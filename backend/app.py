from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from odc.odc_lookup import ODCInterpolator
#from predict.predict_1point import predict_shift
from predict.predict_bayesian import predict_shift
from odc.odc_plot_builder import prepare_odc_plot_data
from collections import Counter


app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "🎉 Hello from Dockerized Flask app!"

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        inputs = data.get("inputs")

        if not inputs or not isinstance(inputs, list):
            raise ValueError("Missing or invalid 'inputs' format")

        # --- Load ODC + reference P50 ---
        odc = ODCInterpolator()
        p50_ref = odc.get_p50_reference()

        # --- Define helper for fitting n ---
        def solve_n(points, p50):
            """
            Fit Hill coefficient n to best match the points.
            """
            spo2 = np.array([pt[1] for pt in points]) / 100
            spo2 = np.clip(spo2, 1e-6, 1 - 1e-6)
            pio2 = np.array([pt[0] for pt in points])
            ratios = pio2 / p50
            return float(np.mean(np.log(spo2 / (1 - spo2)) / np.log(ratios)))

        # --- SINGLE POINT MODE ---
        if len(inputs) == 1:
            pio2, spo2 = map(float, inputs[0])
            result = predict_shift(spo2, pio2)
            shift = result["prediction"]
            p50 = p50_ref + shift
            n_fit = solve_n([inputs[0]], p50)
            odc_plot = prepare_odc_plot_data(p50, measured_points=inputs, odc=odc, n=n_fit)
            return jsonify({ "prediction": result, "odc_plot": odc_plot })

        # --- MULTI POINT MODE ---
        shifts = []
        uncertainties = []
        confidences = []
        for pio2, spo2 in inputs:
            result = predict_shift(spo2, pio2)
            shifts.append(result["prediction"])
            uncertainties.append(result.get("uncertainty_sd", None))
            confidences.append(result.get("confidence_level", None))

        # --- Aggregate results ---
        shift_mean = float(np.mean(shifts))
        filtered_uncertainties = [u for u in uncertainties if u is not None]
        uncertainty_mean = float(np.mean(filtered_uncertainties)) if filtered_uncertainties else None
        confidence_mode = Counter(confidences).most_common(1)[0][0] if confidences else None

        p50 = p50_ref + shift_mean
        n_fit = solve_n(inputs, p50)

        odc_plot = prepare_odc_plot_data(p50, measured_points=inputs, odc=odc, n=n_fit)

        # --- Return aggregated result ---
        return jsonify({
            "prediction": {
                "prediction": shift_mean,
                "uncertainty_sd": uncertainty_mean,
                "confidence_level": confidence_mode
            },
            "odc_plot": odc_plot
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
