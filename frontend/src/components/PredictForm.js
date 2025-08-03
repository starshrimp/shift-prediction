import React, { useState } from 'react';
import { Box, Container, Typography, Button, IconButton, Paper, Alert, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import InfoAccordions from './InfoAccordions';
import DatapointInput from './DatapointInput';
import OdcPlot from './OdcPlot';
import { useDatapoints } from '../hooks/useDatapoints';



function PredictForm() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [odcPlot, setOdcPlot] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const {
    datapoints,
    addDatapoint,
    removeDatapoint,
    handleInputChange,
    allInputsValid,
    inputWarning
  } = useDatapoints();
  const spo2High = datapoints.some(dp => parseFloat(dp.spo2) > 95);
  
  

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
            <DatapointInput
              key={index}
              index={index}
              dp={dp}
              handleInputChange={handleInputChange}
              removeDatapoint={removeDatapoint}
              canRemove={datapoints.length > 1}
            />
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
        <OdcPlot odcPlot={odcPlot} />

        <InfoAccordions />

      </Paper>
    </Container>
  );
}

export default PredictForm;