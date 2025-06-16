from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator
from predict.predict_1point import predict_shift


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

        if not inputs or not isinstance(inputs, list):
            
            raise ValueError(inputs)
        
        if len(inputs) == 1:
            pio2, spo2 = map(float, inputs[0])
            result = predict_shift(spo2, pio2)
            return jsonify({"prediction": result})

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
