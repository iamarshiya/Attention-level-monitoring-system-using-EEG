from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from datetime import datetime

from services.preprocessing import preprocessor
from services.features import feature_extractor
from services.model_loader import model_instance
from database.mongo import db_instance

router = APIRouter()

class PredictPayload(BaseModel):
    subject_id: str
    channel_data: list[float]
    
@router.post("/predict")
async def predict_cognitive_state(payload: PredictPayload):
    """
    Runs an array of raw channel floats through the full AI Pipeline:
    Filter -> Normalize -> Band Power Extraction -> TensorFlow Model Loop.
    Stores the ultimate inference score securely in MongoDB.
    """
    if len(payload.channel_data) < 256:
        raise HTTPException(status_code=400, detail="Insufficient window size. Minimum 1 second of data (256Hz) required.")

    # Convert to Numpy Array
    raw_array = np.array(payload.channel_data, dtype=float)

    # 1. Preprocess
    clean_signal = preprocessor.process_pipeline(raw_array)

    # 2. Extract Features
    psd_features = feature_extractor.extract_metrics(clean_signal)
    
    # 2.5 Extract STFT 2D Spectrogram for Convolutional Neural Network processing
    stft_2d = feature_extractor.extract_stft2d(clean_signal)

    # 3. Predict via Model Architecture (handles either CNN or Random Forest automatically)
    prediction = model_instance.predict(psd_features, stft_2d=stft_2d)

    # 4. Prepare Store Document
    record = {
        "timestamp": datetime.utcnow(),
        "subject_id": payload.subject_id,
        "attention_score": prediction["attention_score"],
        "state": prediction["state"],
        "model_version": "v1.4",
        "theta_beta_ratio_raw": psd_features["theta_beta_ratio"]
    }

    # 5. Connect and store asynchronously (skip if Mongo unconnected)
    if db_instance.client:
        try:
            await db_instance.db["predictions"].insert_one(record)
        except Exception:
            pass # Failsafe logging typically added here

    # 6. Format API Return Map
    record.pop("timestamp") 
    
    return {
        "status": "success",
        "results": record,
        "processing_time": prediction.get("inference_time_ms")
    }
