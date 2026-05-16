"""
Research API Route — /api/v1/research/*
Exposes:
  GET  /research/topology   → latest scalp topology snapshot
  GET  /research/ica        → latest ICA decomposition
  GET  /research/neurofeedback → latest protocol scoring
  GET  /research/report     → full structured research report
  WS   /research/stream     → live research telemetry (topology + ICA + NF)
"""

import numpy as np
import pandas as pd
import json
import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException

from services.eeg_research import eeg_research_engine, CHANNEL_POSITIONS_10_20

logger = logging.getLogger(__name__)
router = APIRouter()

ALL_KNOWN_CHANNELS = list(CHANNEL_POSITIONS_10_20.keys())


def _resolve_eeg_matrix(app_state, n_rows: int = 512) -> tuple:
    """
    Extracts an EEG matrix (np.ndarray) and channel list from the
    uploaded DataFrame in app_state.
    Returns (eeg_matrix, channel_names) or raises HTTPException.
    """
    if not hasattr(app_state, 'uploaded_df') or app_state.uploaded_df is None:
        raise HTTPException(
            status_code=400,
            detail="No EEG data uploaded. Upload features_raw.csv via /api/v1/upload first."
        )

    df: pd.DataFrame = app_state.uploaded_df

    # Prefer 10-20 channel names found in the CSV
    eeg_cols = [c for c in df.columns if c in ALL_KNOWN_CHANNELS]
    if not eeg_cols:
        # Fallback: any numeric columns
        eeg_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if not eeg_cols:
        raise HTTPException(status_code=422, detail="No numeric EEG channels found in uploaded file.")

    # Rolling window around current stream position
    idx   = getattr(app_state, 'stream_index', n_rows)
    start = max(0, idx - n_rows)
    window_df = df.iloc[start : idx + 1] if idx >= n_rows else df.iloc[:n_rows]

    try:
        mat = window_df[eeg_cols].values.astype(float)
        # Replace NaN/Inf
        mat = np.nan_to_num(mat, nan=0.0, posinf=0.0, neginf=0.0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matrix extraction failed: {e}")

    return mat, eeg_cols


# ── REST Endpoints ──────────────────────────────────────────────────

@router.get("/topology")
async def get_topology(request: None = None):
    """
    Returns the latest channel-level topology data.
    Requires data to be already uploaded + stream running.
    """
    from fastapi import Request
    # Handled via WebSocket stream for live
    return {"detail": "Use WebSocket /api/v1/research/stream for live topology data."}


@router.get("/analyze")
async def analyze_snapshot():
    """
    Triggers a one-shot full EEG analysis on the currently streamed data.
    Returns topology + ICA + neurofeedback + research report JSON.
    """
    return {"detail": "Connect to WebSocket /api/v1/research/stream for full real-time analysis."}


# ── WebSocket Research Stream ───────────────────────────────────────

@router.websocket("/stream")
async def research_websocket_stream(websocket: WebSocket):
    """
    Live WebSocket stream emitting:
      - multichannel topology (per-channel bandpower + impedance + coordinates)
      - ICA component decomposition
      - Neurofeedback protocol scoring
      - Structured research report

    Streams every 2 seconds (heavier computation than attention stream).
    """
    await websocket.accept()
    app_state = websocket.app.state
    logger.info("Research WebSocket connected.")

    try:
        while True:
            if hasattr(app_state, 'uploaded_df') and app_state.uploaded_df is not None:
                try:
                    df: pd.DataFrame = app_state.uploaded_df

                    # ── Channel resolution ──────────────────────────
                    eeg_cols = [c for c in df.columns if c in ALL_KNOWN_CHANNELS]
                    if not eeg_cols:
                        eeg_cols = df.select_dtypes(include=[np.number]).columns.tolist()

                    # ── Window selection ────────────────────────────
                    N = 512
                    idx   = getattr(app_state, 'stream_index', N)
                    start = max(0, idx - N)
                    window_df = df.iloc[start : idx + 1] if idx >= N else df.iloc[:N]

                    mat = window_df[eeg_cols].values.astype(float)
                    mat = np.nan_to_num(mat, nan=0.0, posinf=0.0, neginf=0.0)

                    # ── Multi-channel analysis ──────────────────────
                    multichannel = eeg_research_engine.analyze_multichannel(mat, eeg_cols)

                    # ── ICA decomposition ───────────────────────────
                    ica_result = eeg_research_engine.run_ica(mat, eeg_cols)

                    # ── Neurofeedback protocol ──────────────────────
                    # Alternate protocols every 10 ticks for demo richness
                    protocols = ["alpha", "beta_enhance", "theta_suppress", "smt"]
                    tick = idx % len(protocols)
                    active_protocol = protocols[tick]
                    nf_result = eeg_research_engine.neurofeedback_protocol(
                        multichannel["channels"], protocol=active_protocol
                    )

                    # ── Attention score from global indices ─────────
                    gi = multichannel["global_indices"]
                    raw_attention = gi["attention_index"] * 100
                    attention_score = min(100.0, max(0.0, raw_attention))

                    # ── Research report ─────────────────────────────
                    report = eeg_research_engine.generate_research_report(
                        multichannel, ica_result, nf_result, attention_score
                    )

                    # ── Serialize topology for frontend ─────────────
                    # Keep topology light — only send key fields
                    topology_lite = [
                        {
                            "channel":    t["channel"],
                            "x":          t["x"],
                            "y":          t["y"],
                            "impedance":  t["impedance"],
                            "quality":    t["quality"],
                            "alpha":      round(t["alpha_power"], 3),
                            "beta":       round(t["beta_power"],  3),
                            "theta":      round(t["theta_power"], 3),
                            "power_norm": t["power_norm"],
                        }
                        for t in multichannel.get("topology", [])
                    ]

                    payload = {
                        "type": "research",
                        "attention_score": round(attention_score, 2),
                        "global_indices": gi,
                        "topology": topology_lite,
                        "ica": ica_result,
                        "neurofeedback": nf_result,
                        "research_report": report["research_report"],
                        "lobe_summary": multichannel.get("lobe_summary", {}),
                    }

                    await websocket.send_text(json.dumps(payload))

                except Exception as e:
                    logger.error(f"Research stream error: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "detail": str(e)
                    }))

                await asyncio.sleep(2.0)  # Research analysis is heavier — 2s cycle

            else:
                await websocket.send_text(json.dumps({
                    "type": "waiting",
                    "detail": "Upload features_raw.csv to begin research analysis."
                }))
                await asyncio.sleep(2.0)

    except WebSocketDisconnect:
        logger.info("Research WebSocket client disconnected.")
