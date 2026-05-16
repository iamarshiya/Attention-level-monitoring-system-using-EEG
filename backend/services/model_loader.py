import os
import numpy as np
import logging
import time
import joblib
from config.settings import settings

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
        try:
            if os.path.exists(settings.MODEL_PATH):
                logger.info(f"Mounting TRUE Machine Learning Classifier from {settings.MODEL_PATH}...")
                self.model = joblib.load(settings.MODEL_PATH)
                logger.info("Scikit-Learn ML model successfully mounted into RAM.")
            else:
                logger.error(f"FATAL: Model file missing at {settings.MODEL_PATH}. Cannot execute ML inferences.")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to load ML model: {str(e)}")
            self.model = None

    def predict(self, features: dict) -> dict:
        """Executes the Scikit-Learn regressor directly on arriving Numpy feature tuples."""
        if self.model:
            # Construct standard 1x4 sample array for sklearn inference
            arr = np.array([[
                features.get("theta_power", 0.0),
                features.get("alpha_power", 0.0),
                features.get("beta_power", 0.0),
                features.get("theta_beta_ratio", 1.0)
            ]])
            
            # Predict
            start = time.time()
            res = self.model.predict(arr)
            inference_ms = (time.time() - start) * 1000
            
            # Predict returns standard float bounds array
            score = float(res[0])
            score = max(0.0, min(100.0, score))
            
            state = "Neutral"
            if score >= 70:
                state = "Focused"
            elif score < 40:
                state = "Distracted"
                
            return {
                "attention_score": round(score, 2),
                "state": state,
                "inference_time_ms": round(inference_ms, 2),
                "is_simulation": False
            }
        else:
            return {"attention_score": 0, "state": "Error - No Model Available", "inference_time_ms": 0}

model_instance = ModelWrapper()
