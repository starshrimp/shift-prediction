import React, { useState } from 'react'; // useState for dynamic values
import { Box, Container, Typography, TextField, Button, IconButton, Paper , Alert, Divider , Grid} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import { spo2OutOfRange, pio2OutOfRange } from "../utils/validation";



function PredictForm() {
  const [datapoints, setDatapoints] = useState([{ pio2: '', spo2: '' }]);
  const [submitted, setSubmitted] = useState(false); // whether form has been submitted
  const [prediction, setPrediction] = useState(null);
  const [uncertainty, setUncertainty] = useState(null);
  const [error, setError] = useState(null); 
  const [confidence, setConfidence] = useState(null); // state to hold confidence level
  const [odcPlot, setOdcPlot] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');


  const handleInputChange = (index, field, value) => {
    const updated = [...datapoints];
    updated[index][field] = value;
    setDatapoints(updated);
  };

  const hasInvalidInputs = datapoints.some(
    (dp) =>
      dp.pio2 === '' ||
      dp.spo2 === '' ||
      spo2OutOfRange(dp.spo2) ||
      pio2OutOfRange(dp.pio2)
  );


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
      const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/predict`, { // await = wait for response from backend
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
        if (data.odc_plot) {
          setOdcPlot(data.odc_plot);
        }
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
            <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1 , flexWrap: 'nowrap' }}>
              <Grid item xs={6} sm={5}>
                <TextField
                  label="Inspired O₂ (kPa)"
                  type="number"
                  value={dp.pio2}
                  onChange={(e) => handleInputChange(index, 'pio2', e.target.value)}
                  required
                  fullWidth
                  error={pio2OutOfRange(dp.pio2)}
                  helperText={
                    pio2OutOfRange(dp.pio2)
                      ? "Inspired O₂ must be between 13 and 30 kPa"
                      : " "
                  }
                  slotProps={{
                    step: 0.1,
                    min: 13,
                    max: 30,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                    },
                    '& .MuiFormHelperText-root': {
                      whiteSpace: 'normal',
                      lineHeight: 1.25,
                      minHeight: '2.5em',
                      mt: 0.5,
                    }
                  }}
                />
              </Grid>

              <Grid item xs={6} sm={5}>
                <TextField
                  label="SpO₂ (%)"
                  type="number"
                  value={dp.spo2}
                  onChange={(e) => handleInputChange(index, 'spo2', e.target.value)}
                  required
                  fullWidth
                  error={spo2OutOfRange(dp.spo2)}
                  helperText={
                    spo2OutOfRange(dp.spo2)
                      ? "SpO₂ must be between 80 and 100%"
                      : " "
                  }
                  slotProps={{
                    step: 0.1,
                    min: 80,
                    max: 100,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                    },
                    '& .MuiFormHelperText-root': {
                      whiteSpace: 'normal',
                      lineHeight: 1.25,
                      minHeight: '2.5em',
                      mt: 0.5,
                    }
                  }}
                />
              </Grid>

              <Grid item xs={2} sm = {2}>
                {datapoints.length > 1 &&  (
                  <Button
                    color="error"
                    onClick={() => removeDatapoint(index)}
                    sx={{ minWidth: 0, visibility: index === 0 ? 'hidden' : 'visible' }}
                  >
                    X
                  </Button>
                )}
              </Grid>
            </Grid>
          ))}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0, mb: 1 }}>
              ℹ️ Best model performance is achieved with Inspired O₂ values between <strong>15–30 kPa</strong> and SpO₂ between <strong>88–95%</strong>.
            </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <IconButton color="primary" onClick={addDatapoint}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          <Button type="submit" variant="contained" fullWidth disabled={hasInvalidInputs}>
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
      {odcPlot && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            ODC Curve
          </Typography>
          <Box 
            sx={{
              width: '100%',
              height: isMobile ? 300 : 400, // add explicit height!
            }}
          >
            <Plot
              data={[
                {
                  x: odcPlot.po2,
                  y: odcPlot.reference_spo2,
                  mode: 'lines',
                  name: 'Reference ODC',
                  line: { dash: 'dash', color: 'blue' }
                },
                {
                  x: odcPlot.po2,
                  y: odcPlot.predicted_spo2,
                  mode: 'lines',
                  name: 'Predicted ODC',
                  line: { color: 'orange' }
                },
                {
                  x: odcPlot.measured_points.map(p => p[0]),
                  y: odcPlot.measured_points.map(p => p[1]),
                  mode: 'markers',
                  name: 'Measured Point',
                  marker: { color: 'black', size: 8 }
                }
              ]}
              layout={{
                title: 'Oxyhaemoglobin Dissociation Curve',
                xaxis: { title: 'PiO₂ (kPa)' },
                yaxis: { title: 'SpO₂ (%)', range: [0, 100] },
                margin: { t: 30, r: 10, l: 50, b: 50 },
                autosize: true,
                legend: isMobile
                  ? {
                      orientation: 'h',
                      x: 0.5,
                      xanchor: 'center',
                      y: -0.3,
                      yanchor: 'top'
                    }
                  : {
                      orientation: 'v',
                      x: 1,
                      xanchor: 'right',
                      y: 0,
                      yanchor: 'bottom'
                    }

              }}
              useResizeHandler={true}
              config={{ responsive: true }}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
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