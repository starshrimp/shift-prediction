import React, { useState } from 'react';
import {  Accordion, AccordionSummary, AccordionDetails, Box, Container, Typography, TextField, Button, IconButton, Paper, Alert, Divider, Grid } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Plot from 'react-plotly.js';
import { spo2OutOfRange, pio2OutOfRange } from "../utils/validation";
import InfoAccordions from './InfoAccordions';

function PredictForm() {
  const [datapoints, setDatapoints] = useState([{ pio2: '', spo2: '' }]);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [odcPlot, setOdcPlot] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [inputWarning, setInputWarning] = useState('');

  // Check for SpO₂ > 95%
  const spo2High = datapoints.some(dp => parseFloat(dp.spo2) > 95);

  const handleInputChange = (index, field, value) => {
    const updated = [...datapoints];
    updated[index][field] = value;
    setDatapoints(updated);
  };

  const addDatapoint = () => {
    if (datapoints.length < 5) {
      setDatapoints([...datapoints, { pio2: '', spo2: '' }]);
    }
  };

  const removeDatapoint = (indexToRemove) => {
    setDatapoints((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Validation function for all datapoints
  const allInputsValid = datapoints.every(dp => {
    const pio2 = parseFloat(dp.pio2);
    const spo2 = parseFloat(dp.spo2);
    return (
      !isNaN(pio2) && pio2 >= 13 && pio2 <= 53 &&
      !isNaN(spo2) && spo2 >= 72 && spo2 <= 99.9
    );
  });

  React.useEffect(() => {
    let warning = '';
    for (let i = 0; i < datapoints.length; i++) {
      const pio2 = parseFloat(datapoints[i].pio2);
      const spo2 = parseFloat(datapoints[i].spo2);

      if (!isNaN(pio2) && (pio2 < 13 || pio2 > 53)) {
        warning = "Inspired O₂ must be between 13–53 kPa. This ensures reliable prediction within trained model range. Please correct your entry.";
        break;
      }
      if (!isNaN(spo2) && (spo2 < 72 || spo2 > 99.9)) {
        warning = "Oxygen saturation must be between 72–99.9%. This ensures reliable prediction within trained model range. Please correct your entry.";
        break;
      }
    }
    setInputWarning(warning);
  }, [datapoints]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setError(null);

    const payload = {
      inputs: datapoints.map(dp => [parseFloat(dp.pio2), parseFloat(dp.spo2)])
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) {
        setError(`Server error: ${data.error}`);
      } else if (Array.isArray(data.prediction)) {
        setPrediction(data.prediction);
      } else if (typeof data.prediction === 'object') {
        setPrediction([data.prediction]);
        if (data.odc_plot) {
          setOdcPlot(data.odc_plot);
        }
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      setPrediction("Network or server error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>ODC Shift Prediction</Typography>
        <Typography variant="body2">
          This tool helps you estimate the shift in the oxyhaemoglobin dissociation curve (ODC) using your measured SpO₂ and inspired O₂ values. Enter up to 5 datapoints for analysis.
        </Typography>

        <Typography variant="h6" gutterBottom>How to Use This Tool</Typography>
        <Typography variant="body2">
          Enter 1 to 5 pairs of oxygen saturation (SpO₂) and inspired O₂ pressure (PiO₂). <br />
          The tool predicts the rightward shift of the ODC, helping assess gas exchange in preterm infants. Outputs include the predicted shift and a confidence estimate. <br />
          The model is most accurate when SpO₂ <strong>&lt;92.5% or &lt;95%</strong>. Predictions for <strong>&gt;95%</strong> may not be equally reliable. <br />
          
        </Typography>

        {/* Warning for high SpO₂ */}
        {spo2High && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Warning: Model performance is poor for SpO₂ values above 95%.
          </Alert>
        )}
        {/* Input range warning */}
        {inputWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {inputWarning}
          </Alert>
        )}
        <Box sx={{ my: 3 }} />
        <form onSubmit={handleSubmit}>
          {datapoints.map((dp, index) => (

            <Grid container spacing={1} key={index} alignItems="center" sx={{ mb: 1, flexWrap: 'nowrap' }}>

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
                    input: {
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*',
                      min: 13,
                      max: 30,
                      step: 0.1,
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
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
                    input: {
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*',
                      min: 80,
                      max: 100,
                      step: 0.1,
                    }
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                      e.preventDefault();
                    }
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
              <Grid item xs={2} sm={2}>
                {datapoints.length > 1 && (
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

          <Box display="flex" justifyContent="center" mb={2}>
            <IconButton
              color="primary"
              onClick={addDatapoint}
              disabled={datapoints.length >= 5}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
          {/* Alert for recommended datapoints */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Recommended: <strong>1–3 datapoints</strong> for best results.
          </Alert>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!allInputsValid}
          >
            Submit
          </Button>
        </form>

        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

        {Array.isArray(prediction) && prediction.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Predicted Shift
            </Typography>
            {prediction.map((result, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography>
                  {Number(result.prediction).toFixed(2)} (± {Number(result.uncertainty_sd).toFixed(2)})
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
                height: isMobile ? 300 : 400,
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
        <InfoAccordions />

      </Paper>
    </Container>
  );
}

export default PredictForm;