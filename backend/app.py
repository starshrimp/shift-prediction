from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

# Load the trained model
model = joblib.load("models/model_1point.joblib")

# Load ODC table
odc = pd.read_csv("/Users/sarah/ML/master_thesis/ODC/Neonatal_ODC_Table.csv")
odc = odc.sort_values('SO2 (%)').drop_duplicates('SO2 (%)')
spo2_to_po2 = PchipInterpolator(odc['SO2 (%)'], odc['PO2 (kPa)'])

app = Flask(__name__)
CORS(app)

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        spo2 = data.get("SpO2")
        pio2 = data.get("PiO2")

        if spo2 is None or pio2 is None:
            return jsonify({"error": "Both PiO2 and SpO2 are required."}), 400

        spo2 = float(spo2)
        pio2 = float(pio2)

        # Compute derived features
        pco2 = spo2_to_po2([spo2])[0]  # Interpolate
        shift_raw = pio2 - pco2
        log_pio2 = np.log(pio2)

        # Format features
        features = np.array([shift_raw, log_pio2, spo2]).reshape(1, -1)
        prediction = model.predict(features)[0]

        return jsonify({
            "prediction": round(float(prediction), 3),
            "shift_raw": round(float(shift_raw), 3),
            "log_PiO2": round(float(log_pio2), 3)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
