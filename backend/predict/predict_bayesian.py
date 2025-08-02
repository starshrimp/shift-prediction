import numpy as np
import joblib
from pathlib import Path
from odc.odc_lookup import ODCInterpolator
from utils.feature_preparation import prepare_features_for_model

# --- Initialize interpolator once globally ---
odc_interp = ODCInterpolator()

# --- Load stratified models and scalers ---
ensemble_dir = Path("models/final model ensemble")
model_files = {
    "A": ("model_spo2_below_92_5.joblib", "model_spo2_below_92_5_scaler.joblib"),
    "B": ("model_spo2_below_95.joblib", "model_spo2_below_95_scaler.joblib"),
    "C": ("model_spo2_below_98.joblib", "model_spo2_below_98_scaler.joblib"),
}
models = {}
scalers = {}
for key, (model_file, scaler_file) in model_files.items():
    models[key] = joblib.load(ensemble_dir / model_file)
    scalers[key] = joblib.load(ensemble_dir / scaler_file)

def classify_confidence(std):
    if std < 1.68:
        return "high"
    elif std < 1.70:
        return "moderate"
    else:
        return "low"

def select_model(spo2):
    if spo2 < 92.5:
        return "A", None
    elif spo2 < 95:
        return "B", None
    else:
        return "C", "Warning: Model performance may be degraded for SpO₂ ≥ 95%."

def predict_shift(spo2, pio2):
    pco2 = odc_interp.spo2_to_pco2([spo2])[0]
    X = np.array([prepare_features_for_model(spo2, pio2, odc_interp.spo2_to_pco2)])

    # Select model and scaler
    model_key, warning = select_model(spo2)
    scaler = scalers[model_key]
    model = models[model_key]

    # Scale features
    X_scaled = scaler.transform(X)

    # Predict
    pred, std = model.predict(X_scaled, return_std=True)
    pred = float(pred[0])
    std = float(std[0])
    confidence = classify_confidence(std)

    result = {
        "prediction": round(pred, 3),
        "uncertainty_sd": round(std, 3),
        "confidence_level": confidence
    }
    if warning:
        result["warning"] = warning
    return result