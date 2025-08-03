import React from 'react';
import Plot from 'react-plotly.js';
import { Box, Typography, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

const OdcPlot = ({ odcPlot }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  if (!odcPlot) return null;

  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        ODC Curve
      </Typography>
      <Box sx={{ width: '100%', height: isMobile ? 300 : 400 }}>
        <Plot
          data={[
            {
              x: odcPlot.po2,
              y: odcPlot.reference_spo2,
              mode: 'lines',
              name: 'Reference ODC',
              line: { dash: 'dash', color: 'blue' },
            },
            {
              x: odcPlot.po2,
              y: odcPlot.predicted_spo2,
              mode: 'lines',
              name: 'Predicted ODC',
              line: { color: 'orange' },
            },
            {
              x: odcPlot.measured_points.map((p) => p[0]),
              y: odcPlot.measured_points.map((p) => p[1]),
              mode: 'markers',
              name: 'Measured Point',
              marker: { color: 'black', size: 8 },
            },
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
                  yanchor: 'top',
                }
              : {
                  orientation: 'v',
                  x: 1,
                  xanchor: 'right',
                  y: 0,
                  yanchor: 'bottom',
                },
          }}
          useResizeHandler
          config={{ responsive: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    </>
  );
};

export default OdcPlot;
