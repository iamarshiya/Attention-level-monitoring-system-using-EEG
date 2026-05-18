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

    def extract_stft2d(self, data: np.ndarray) -> np.ndarray:
        """
        Computes the Short-Time Fourier Transform (STFT) for the given signal window.
        Converts 1D EEG data into a 2D Spectrogram image (Time vs Frequency vs Power)
        to be used as input for 2D Convolutional Neural Networks (CNNs).
        """
        try:
            from scipy.signal import stft
            import cv2
            f, t, Zxx = stft(data, fs=self.fs, nperseg=64, noverlap=32)
            # Take the absolute magnitude (power) of the complex numbers
            spectrogram_2d = np.abs(Zxx)
            # Resize to match CNN input shape (64, 64)
            spectrogram_2d = cv2.resize(spectrogram_2d, (64, 64))
            # Expand dimensions to match standard CNN input shape (Height, Width, Channels)
            spectrogram_2d = np.expand_dims(spectrogram_2d, axis=-1)
            return spectrogram_2d
        except Exception as e:
            logger.error(f"Error computing STFT 2D array: {str(e)}")
            return np.zeros((64, 64, 1)) # Default fallback shape

feature_extractor = FeatureExtractor()
