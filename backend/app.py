from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np

# Load the trained model
model = joblib.load("models/model_1point.joblib")

# Define the features expected by the model
MODEL_FEATURES = ['shift_raw', 'log_PiO2', 'SpO2(%)']

app = Flask(__name__)
CORS(app)

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    inputs = data.get("inputs", [])

    if len(inputs) != 2:
        return jsonify({"error": "Expected exactly 2 inputs"}), 400

    # dummy prediction logic for now
    dummy_shift = round(inputs[0] * 0.1 + inputs[1] * 0.01, 3)
    return jsonify({"prediction": dummy_shift})

if __name__ == "__main__":
    app.run(debug=True)
