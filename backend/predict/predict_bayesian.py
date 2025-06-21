# backend/predict/predict_1point.py

import numpy as np
import joblib
from pathlib import Path
from odc.odc_lookup import ODCInterpolator

# --- Initialize interpolator once globally ---
odc_interp = ODCInterpolator()

# --- Load single Bayesian model ---
model_path = Path("models/1_point/final_bayesian_model.joblib")
bayesian_model = joblib.load(model_path)

def classify_confidence(std):
    if std < 1.68:
        return "high"
    elif std < 1.70:
        return "moderate"
    else:
        return "low"

def predict_shift(spo2, pio2):
    # --- Derived features ---
    pco2 = odc_interp.spo2_to_pco2([spo2])[0]
    shift_raw = pio2 - pco2
    log_pio2 = np.log(pio2)
    X = np.array([[shift_raw, log_pio2, spo2]])

    # --- Predict shift with uncertainty ---
    pred, std = bayesian_model.predict(X, return_std=True)
    pred = float(pred[0])
    std = float(std[0])
    confidence = classify_confidence(std)

    return {
        "prediction": round(pred, 3),
        "uncertainty_sd": round(std, 3),
        "confidence_level": confidence,
        "shift_raw": round(shift_raw, 3),
        "log_PiO2": round(log_pio2, 3)
    }
