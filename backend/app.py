from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from odc.odc_lookup import ODCInterpolator
from predict.predict_1point import predict_shift
from odc.odc_plot_builder import prepare_odc_plot_data


app = Flask(__name__)
CORS(app)

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        inputs = data.get("inputs")

        odc = ODCInterpolator()
        po2, spo2_pred = odc.generate_predicted_curve(p50=5.0)
        print(spo2_pred[:5])

        if not inputs or not isinstance(inputs, list):
            
            raise ValueError(inputs)
        
        if len(inputs) == 1:
            pio2, spo2 = map(float, inputs[0])
            result = predict_shift(spo2, pio2)

            shift = result["prediction"]
            print(f"Predicted shift: {shift}")
            p50_ref = odc.get_p50_reference()
            p50 = p50_ref + shift
            print(f"DEBUG P50: {p50}")

            odc = ODCInterpolator()
            def solve_n_from_point_and_p50(pio2, spo2_percent, p50):
                spo2 = spo2_percent / 100
                spo2 = np.clip(spo2, 1e-6, 1 - 1e-6)
                ratio = pio2 / p50
                return np.log(spo2 / (1 - spo2)) / np.log(ratio)

            n_fit = solve_n_from_point_and_p50(pio2, spo2, p50)

            odc_plot = prepare_odc_plot_data(p50, measured_points=[[pio2, spo2]], odc=odc, n=n_fit)

            # Add this to your JSON response:
            return jsonify({
                "prediction": result,
                "odc_plot": odc_plot
            })
            #return jsonify({"prediction": result})
    
        # Case 1: Single datapoint
        # Case 2: Multiple datapoints → placeholder for future implementation
        else:
            return jsonify({
                "prediction": None,
                "message": "Multi-point prediction is not implemented yet. Received {} datapoints.".format(len(inputs))
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
