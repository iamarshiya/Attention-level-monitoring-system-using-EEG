import os
import numpy as np
import logging
import time
import joblib
from config.settings import settings

# Optional TensorFlow import (fails gracefully if not installed)
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

logger = logging.getLogger(__name__)

class ModelWrapper:
    """
    Singleton class executing TRUE Machine Learning inferences dynamically.
    Loads the Random Forest Scikit-Learn serialization binary into RAM.
    """
    _instance = None
    model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelWrapper, cls).__new__(cls)
            cls._instance.load_model()
        return cls._instance

    def load_model(self):
        self.cnn_model = None
        self.rf_model = None

        # 1. Try loading the Keras CNN (.h5)
        cnn_path = settings.MODEL_PATH.replace(".pkl", ".h5")
        if TF_AVAILABLE and os.path.exists(cnn_path):
            try:
                import keras
                self.cnn_model = load_model(
                    cnn_path,
                    custom_objects={'mse': keras.metrics.mean_squared_error},
                    compile=False
                )
                logger.info(f"CNN loaded from {cnn_path}")
            except Exception as e:
                logger.warning(f"CNN load failed: {e}")
                self.cnn_model = None

        # 2. Try loading the scikit-learn RF (.pkl)
        if os.path.exists(settings.MODEL_PATH):
            try:
                self.rf_model = joblib.load(settings.MODEL_PATH)
                logger.info(f"RF model loaded from {settings.MODEL_PATH}")
            except Exception as e:
                logger.warning(f"RF load failed: {e}")
                self.rf_model = None

        if self.cnn_model is None and self.rf_model is None:
            logger.error("No model found. Will use heuristic fallback.")

    def predict(self, features: dict, stft_2d: np.ndarray = None) -> dict:
        """CNN for STFT spectrograms, RF for bandpower features, heuristic as fallback."""
        start = time.time()
        score = 0.0
        model_type = "Heuristic"

        # --- CNN PATH: only when stft_2d provided AND CNN loaded ---
        if stft_2d is not None and self.cnn_model is not None:
            cnn_input = np.expand_dims(stft_2d, axis=0)
            if cnn_input.shape == (1, 64, 64, 1):
                try:
                    res = self.cnn_model.predict(cnn_input, verbose=0)
                    score = float(np.max(res[0])) * 100.0 if res.shape[-1] > 1 else float(res[0][0]) * 100.0
                    model_type = "CNN"
                except Exception as e:
                    logger.warning(f"CNN predict failed ({e}), falling back.")
                    score = self._rf_or_heuristic(features)
                    model_type = "RF/Heuristic"
            else:
                score = self._rf_or_heuristic(features)
                model_type = "RF/Heuristic"
        else:
            # Feature-only inference (stream uses this path)
            score = self._rf_or_heuristic(features)
            model_type = "RF" if self.rf_model is not None else "Heuristic"

        inference_ms = (time.time() - start) * 1000
        score = max(0.0, min(100.0, score))
        state = "Focused" if score >= 70 else ("Distracted" if score < 40 else "Neutral")

        return {
            "attention_score": round(score, 2),
            "state": state,
            "inference_time_ms": round(inference_ms, 2),
            "model_type": model_type
        }

    def _rf_or_heuristic(self, features: dict) -> float:
        """Use RF model if available, else fall back to heuristic."""
        if self.rf_model is not None:
            arr = np.array([[
                features.get("theta_power", 0.0),
                features.get("alpha_power", 0.0),
                features.get("beta_power", 0.0),
                features.get("theta_beta_ratio", 1.0)
            ]])
            try:
                res = self.rf_model.predict(arr)
                return float(res[0])
            except Exception as e:
                logger.warning(f"RF predict failed: {e}")
        return self._heuristic_score(features)

    def _heuristic_score(self, features: dict) -> float:
        """Fallback: derive attention score from bandpower ratios when no model is available."""
        # Use the theta/beta ratio — the gold-standard clinical ADHD marker
        # Low theta/beta = high focus; High theta/beta = distracted
        theta = features.get("theta_power", 0.0)
        beta  = features.get("beta_power",  0.0)
        alpha = features.get("alpha_power", 0.0)

        # custom_attention_index = beta / (theta + alpha + 0.001)  — higher = more focused
        # Use the pre-computed value if available
        cai = features.get("custom_attention_index", None)
        if cai is None:
            cai = beta / (theta + alpha + 0.001)

        # Squash through a sigmoid-like curve: maps (0→100 CAI) into (5→90) score
        # Typical CAI range is 0.1 – 5.0
        # 1.0 = neutral, >2 = focused, <0.5 = distracted
        import math
        score = 50.0 + 40.0 * math.tanh((cai - 1.0) / 1.5)
        return float(np.clip(score, 5.0, 95.0))

model_instance = ModelWrapper()
