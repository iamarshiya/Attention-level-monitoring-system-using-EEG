import numpy as np
from scipy.signal import welch
import logging

logger = logging.getLogger(__name__)

class FeatureExtractor:
    def __init__(self, fs=256):
        self.fs = fs

    def bandpower(self, data, fmin, fmax):
        """Compute the average power of the signal x in a specific frequency band."""
        if len(data) < 256:
            pad = 256 - len(data)
            data = np.pad(data, (0, pad), 'constant')
            
        f, Pxx = welch(data, fs=self.fs, window='hann', nperseg=256, scaling='density')
        idx_band = np.logical_and(f >= fmin, f <= fmax)
        if not np.any(idx_band):
            return 0.0
        return float(np.trapz(Pxx[idx_band], f[idx_band]))

    def extract_metrics(self, data: np.ndarray) -> dict:
        """Extracts Theta, Alpha, Beta bands, statistical features, and the crucial Theta/Beta ratio."""
        try:
            # Frequency Domain Features
            theta = self.bandpower(data, 4, 8)
            alpha = self.bandpower(data, 8, 12)
            beta = self.bandpower(data, 12, 30)

            ratio = theta / (beta + 0.001)
            
            # Custom Research Feature
            attention_score_custom = beta / (theta + alpha + 0.001)

            # Statistical Time-Domain Features
            signal_mean = float(np.mean(data))
            signal_std = float(np.std(data))
            signal_var = float(np.var(data))

            return {
                "theta_power": float(theta),
                "alpha_power": float(alpha),
                "beta_power": float(beta),
                "theta_beta_ratio": float(ratio),
                "custom_attention_index": float(attention_score_custom),
                "signal_mean": signal_mean,
                "signal_std": signal_std,
                "signal_var": signal_var
            }
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            # Default fallback for extreme noise / empty bounds
            return {
                "theta_power": 0.0,
                "alpha_power": 0.0,
                "beta_power": 0.0,
                "theta_beta_ratio": 0.0
            }

feature_extractor = FeatureExtractor()
