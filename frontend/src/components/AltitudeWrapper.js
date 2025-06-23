import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import PredictForm from "./PredictForm";

function AltitudeWrapper() {
  const [altitude, setAltitude] = useState(null);
  const [showMainForm, setShowMainForm] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const getAltitudeFromGeolocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Coordinates:", latitude, longitude);

      try {
        const response = await fetch(
          `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
        );
        const data = await response.json();
        const elevation = data.results[0].elevation;
        setAltitude(elevation);
        setShowMainForm(true);
      } catch (err) {
        alert("Failed to retrieve altitude.");
        console.error(err);
      }
    });
  };

  const confirmManualInput = () => {
    const num = parseFloat(manualInput);
    if (!isNaN(num)) {
      setAltitude(num);
      setShowMainForm(true);
    } else {
      alert("Please enter a valid number.");
    }
  };

  if (!showMainForm) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to the O₂ Shift Predictor
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            This tool estimates your inspired oxygen pressure (PiO₂) based on altitude and helps
            predict shifts in the oxyhaemoglobin dissociation curve.
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Option 1: Enter your altitude manually
          </Typography>
          <Box display="flex" gap={2} alignItems="center" mb={3}>
            <TextField
              type="number"
              label="Altitude (meters)"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              fullWidth
            />
            <Button onClick={confirmManualInput} variant="contained">
              Continue
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Option 2: Use your current location
          </Typography>
          <Button onClick={getAltitudeFromGeolocation} variant="outlined">
            Use Geolocation
          </Button>
        </Paper>
      </Container>
    );
  }

  return <PredictForm altitude={altitude} />;
}

export default AltitudeWrapper;
