import React, { useState } from 'react'; // useState for dynamic values
import { Box, Container, Typography, TextField, Button, Paper , Alert, Divider } from '@mui/material';

function PredictForm() {
  const [pio2, setPio2] = useState('');
  const [spo2, setSpo2] = useState('');
  const [submitted, setSubmitted] = useState(false); // whether form has been submitted
  const [prediction, setPrediction] = useState(null);
  const [uncertainty, setUncertainty] = useState(null);
  const [error, setError] = useState(null); 
  const [confidence, setConfidence] = useState(null); // state to hold confidence level


  const handleSubmit = async (e) => { //async function to handle form submission
    e.preventDefault(); // prevents page from reloading (HTML default behavior)
    setSubmitted(true);
    setPrediction(null);
    setUncertainty(null);
    setError(null);

    const payload = {
      PiO2: pio2 !== '' ? parseFloat(pio2) : null,
      SpO2: spo2 !== '' ? parseFloat(spo2) : null
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
        setPrediction(`Server error: ${data.error}`);
      } else {
        setPrediction(data.prediction);
        setUncertainty(data.uncertainty_sd);
        setConfidence(data.confidence_level);


      }
    } catch (err) {
      setPrediction("Network or server error");
    }
    }; //e is event object -> created when submission occurs

  return ( //JSX syntax -> rendered UI
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          ODC Shift Prediction
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Inspired O₂ (PiO₂ in kPa)"
            value={pio2}
            onChange={(e) => setPio2(e.target.value)}
            type="number"
            step="any"
            required
            fullWidth
          />
          <TextField
            label="SpO₂ (%)"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            type="number"
            step="any"
            required
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {submitted && (
          <Typography sx={{ mt: 2 }}>
            You entered PiO₂ = <strong>{pio2}</strong> kPa and SpO₂ = <strong>{spo2}</strong>%
          </Typography>
        )}

        {prediction !== null && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography>
              <strong>Predicted shift:</strong> {prediction}
              {uncertainty !== null && <> ± {uncertainty}</>}
            </Typography>
          </>
        )}

        {confidence && (
          <Typography sx={{ mt: 1 }}>
            <strong>Confidence level:</strong>{' '}
            {confidence === 'high' && <span style={{ color: 'green' }}>🟢 High</span>}
            {confidence === 'moderate' && <span style={{ color: 'orange' }}>🟡 Moderate</span>}
            {confidence === 'low' && <span style={{ color: 'red' }}>🔴 Low</span>}
          </Typography>
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