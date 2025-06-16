import React, { useState } from 'react'; // useState for dynamic values
import { Box, Container, Typography, TextField, Button, IconButton, Paper , Alert, Divider , Grid} from '@mui/material';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function PredictForm() {
  const [datapoints, setDatapoints] = useState([{ pio2: '', spo2: '' }]);
  const [submitted, setSubmitted] = useState(false); // whether form has been submitted
  const [prediction, setPrediction] = useState(null);
  const [uncertainty, setUncertainty] = useState(null);
  const [error, setError] = useState(null); 
  const [confidence, setConfidence] = useState(null); // state to hold confidence level

  const handleInputChange = (index, field, value) => {
    const updated = [...datapoints];
    updated[index][field] = value;
    setDatapoints(updated);
  };

  const addDatapoint = () => {
    setDatapoints([...datapoints, { pio2: '', spo2: '' }]);
  };

  const removeDatapoint = (indexToRemove) => {
  setDatapoints((prev) => prev.filter((_, i) => i !== indexToRemove));
};

  const handleSubmit = async (e) => { //async function to handle form submission
    e.preventDefault(); // prevents page from reloading (HTML default behavior)
    setSubmitted(true);
    setPrediction(null);
    setUncertainty(null);
    setError(null);
    setConfidence(null);


    const payload = {
      inputs: datapoints.map(dp => [parseFloat(dp.pio2), parseFloat(dp.spo2)])
    };


    try {
      const res = await fetch('http://127.0.0.1:5000/predict', { // await = wait for response from backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json(); // response parsed as JSON

      if (data.error) {
        setError(`Server error: ${data.error}`);
      } else if (Array.isArray(data.prediction)) {
        setPrediction(data.prediction);
        setUncertainty(null); // optional: could compute mean or min/max SD here
        setConfidence(null);  // optional: could infer aggregate confidence
      } else if (typeof data.prediction === 'object') {
        setPrediction([data.prediction]); // wrap single prediction into array
        setUncertainty(data.prediction.uncertainty_sd ?? null);
        setConfidence(data.prediction.confidence_level ?? null);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      setPrediction("Network or server error");
    }
    }; //e is event object -> created when submission occurs

  return ( //JSX syntax -> rendered UI
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>ODC Shift Prediction</Typography>
        <form onSubmit={handleSubmit}>
          {datapoints.map((dp, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={5}>
                <TextField
                  label="Inspired O₂ (kPa)"
                  type="number"
                  value={dp.pio2}
                  onChange={(e) => handleInputChange(index, 'pio2', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  label="SpO₂ (%)"
                  type="number"
                  value={dp.spo2}
                  onChange={(e) => handleInputChange(index, 'spo2', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={2}>
                {datapoints.length > 1 && index > 0 && (
                  <Button
                    color="error"
                    onClick={() => removeDatapoint(index)}
                    sx={{ minWidth: 0 }}
                  >
                    X
                  </Button>
                )}
              </Grid>

            </Grid>
          ))}


          <Box display="flex" justifyContent="center" mb={2}>
            <IconButton color="primary" onClick={addDatapoint}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          <Button type="submit" variant="contained" fullWidth>
            Submit
          </Button>
        </form>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

       {Array.isArray(prediction) && prediction.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Predicted Shifts
            </Typography>
            {prediction.map((result, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography>
                  <strong>Point {index + 1}:</strong> {result.prediction} (± {result.uncertainty_sd})
                </Typography>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Confidence: 
                  {result.confidence_level === 'high' && <span style={{ color: 'green' }}> 🟢 High</span>}
                  {result.confidence_level === 'moderate' && <span style={{ color: 'orange' }}> 🟡 Moderate</span>}
                  {result.confidence_level === 'low' && <span style={{ color: 'red' }}> 🔴 Low</span>}
                </Typography>
              </Box>
            ))}
          </>
        )}

      </Paper>
    </Container>
  );
}

export default PredictForm; // makes it usable in other files


// To quantify model confidence, we used the standard deviation across predictions from 5 cross-validation models. We stratified confidence levels based on empirical percentiles of these standard deviations on the validation set:

// High confidence: SD < 0.03 (below median)

// Moderate confidence: 0.03 ≤ SD < 0.07 (up to ~75th percentile)

// Low confidence: SD ≥ 0.07 (above ~75–80th percentile)

// These thresholds were chosen to reflect regions of consistent model predictions while preserving interpretability for clinical users.