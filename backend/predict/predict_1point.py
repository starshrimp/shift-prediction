# backend/predict/predict_1point.py
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from odc.odc_lookup import ODCInterpolator


odc_interp = ODCInterpolator() # initialize ODC interpolator

# --- Load model ensemble ---
cv_model_paths = [f"models/1_point/model_1point_fold_{i}.joblib" for i in range(5)]
cv_models = [joblib.load(p) for p in cv_model_paths]

def classify_confidence(sd):
    if sd < 0.03:
        return "high"
    elif sd < 0.07:
        return "moderate"
    else:
        return "low"

def predict_shift(spo2, pio2):
    pco2 = odc_interp.spo2_to_pco2([spo2])[0]
    shift_raw = pio2 - pco2
    log_pio2 = np.log(pio2)
    X = np.array([[shift_raw, log_pio2, spo2]])

    preds = np.array([model.predict(X)[0] for model in cv_models])
    mean_pred = preds.mean()
    std_pred = preds.std()
    confidence = classify_confidence(std_pred)

    return {
        "prediction": round(mean_pred, 3),
        "uncertainty_sd": round(std_pred, 3),
        "confidence_level": confidence,
        "shift_raw": round(shift_raw, 3),
        "log_PiO2": round(log_pio2, 3)
    }
