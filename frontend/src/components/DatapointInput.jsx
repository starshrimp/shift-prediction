import React from 'react';
import { TextField, Grid, Button } from '@mui/material';
import { spo2OutOfRange, pio2OutOfRange } from '../utils/validation';

const DatapointInput = ({ index, dp, handleInputChange, removeDatapoint, canRemove }) => (
  <Grid container spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: 'nowrap' }}>
    <Grid item xs={6} sm={5}>
      <TextField
        label="Inspired O₂ (kPa)"
        type="number"
        value={dp.pio2}
        onChange={(e) => handleInputChange(index, 'pio2', e.target.value)}
        required
        fullWidth
        slotProps={{
          input: {
            inputMode: 'decimal',
            pattern: '[0-9]*\\.?[0-9]*',
            min: 13,
            max: 53,
            step: 0.1,
          }
        }}
        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
        sx={{
          '& .MuiOutlinedInput-root': { height: 56 },
          '& .MuiFormHelperText-root': {
            whiteSpace: 'normal', lineHeight: 1.25, minHeight: '2.5em', mt: 0.5,
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

        slotProps={{
          input: {
            inputMode: 'decimal',
            pattern: '[0-9]*\\.?[0-9]*',
            min: 72,
            max: 100,
            step: 0.1,
          }
        }}
        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
        sx={{
          '& .MuiOutlinedInput-root': { height: 56 },
          '& .MuiFormHelperText-root': {
            whiteSpace: 'normal', lineHeight: 1.25, minHeight: '2.5em', mt: 0.5,
          }
        }}
      />
    </Grid>
    <Grid item xs={2} sm={2}>
      {canRemove && (
        <Button color="error" onClick={() => removeDatapoint(index)} sx={{ minWidth: 0 }}>
          X
        </Button>
      )}
    </Grid>
  </Grid>
);

export default DatapointInput;
