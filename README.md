# ODC Shift Prediction Tool

A web-based tool for predicting the rightward shift in the oxyhaemoglobin dissociation curve (ODC) using paired SpO₂ and inspired O₂ (PiO₂) measurements. Designed for bedside use in neonatal and pediatric care, especially for preterm infants.

---

## Quick Start

**No installation required!**  
Simply visit the website:

[https://your-deployed-url.com](https://your-deployed-url.com)

---

## What Does This Tool Do?

- **Estimates the “shift” in the ODC** using your SpO₂ and PiO₂ measurements.
- **Visualizes the ODC curve** and your entered datapoints.
- **Provides confidence estimates** for each prediction.
- **Gives instant feedback** on input quality and model limitations.

---

## How to Use

1. **Enter 1–5 pairs** of oxygen saturation (SpO₂, %) and inspired O₂ pressure (PiO₂, kPa).
2. **Submit** to receive:
   - The predicted ODC shift (rounded to two decimals)
   - Uncertainty (± SD)
   - Confidence level (high, moderate, low)
   - Curve visualization
3. **Review warnings and tips** for best results:
   - Recommended: 1–3 datapoints
   - Best performance: SpO₂ <92.5% or <95%
   - Model is less reliable for SpO₂ >95%
   - PiO₂ must be between 13–53 kPa; SpO₂ between 72–99.9%

---

## Model & Limitations

- **Trained on:** 219 preterm infants
- **Best for:** SpO₂ between 72% and 95%
- **Not validated for:** Term infants, adults, or patients with hemoglobinopathies
- **Limitations:**
  - Points above 95% SpO₂ contribute less information and may reduce accuracy
  - In very severely impaired infants, the model may overestimate the shift, especially with only 1–2 datapoints
  - Reliable input is essential; ensure values are stable and artifact-free

---

## Data Privacy

- **No data is stored, logged, or transmitted.**
- All processing is in-memory and temporary.
- No patient-identifiable information is used or required.

---

## For Developers & Contributors

If you wish to contribute or run the project locally, see below.

### Project Structure

```
shift_prediction/
├── backend/
│   ├── app.py
│   ├── environment.yml
│   ├── models/
│   ├── predict/
│   ├── utils/
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
├── Dockerfile
├── requirements.txt
└── README.md
```

### Backend

- Python Flask API
- Machine learning models in `backend/models/`
- Input validation in `backend/utils/validation.py`

### Frontend

- React app (`frontend/src/components/PredictForm.js`)
- Responsive UI, input validation, and ODC curve visualization

---

## License

This project is for research and educational use. See LICENSE for details.

---

## Contact

For questions, feedback, or collaboration, please contact the repository owner.
