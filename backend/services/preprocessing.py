import numpy as np
from scipy.signal import butter, lfilter
import logging

logger = logging.getLogger(__name__)

class Preprocessor:
    def __init__(self, fs=256, lowcut=0.5, highcut=45.0, order=5):
        self.fs = fs
        self.lowcut = lowcut
        self.highcut = highcut
        self.order = order

    def butter_bandpass(self):
        nyq = 0.5 * self.fs
        low = self.lowcut / nyq
        high = self.highcut / nyq
        b, a = butter(self.order, [low, high], btype='band')
        return b, a

    def apply_bandpass(self, data: np.ndarray) -> np.ndarray:
        """Filters input EEG data array through defined bandpass frequencies."""
        try:
            b, a = self.butter_bandpass()
            y = lfilter(b, a, data)
            return y
        except Exception as e:
            logger.error(f"Error during bandpass filtering: {str(e)}")
            raise ValueError(f"Failed to preprocess data: {str(e)}")

    def normalize(self, data: np.ndarray) -> np.ndarray:
        """Scales data features relative to individual variance."""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return data
        return (data - mean) / std

    def process_pipeline(self, raw_data: np.ndarray) -> np.ndarray:
        """Runs the whole pipeline sequentially: filter -> normalize."""
        filtered = self.apply_bandpass(raw_data)
        normalized = self.normalize(filtered)
        return normalized

preprocessor = Preprocessor()
