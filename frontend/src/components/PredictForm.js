import React, { useState } from 'react';

function PredictForm() {
  const [pio2, setPio2] = useState('');
  const [spo2, setSpo2] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault(); // prevents page from reloading
    setSubmitted(true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Inspired O₂ (PiO₂ in kPa): 
          <input
            type="number"
            step="any"
            value={pio2}
            onChange={(e) => setPio2(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          SpO₂ (%): 
          <input
            type="number"
            step="any"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
      

      {submitted && (
        <p>
          You entered PiO₂ = <strong>{pio2}</strong> kPa and SpO₂ = <strong>{spo2}</strong>%
        </p>
      )}
    </div>
  );
}

export default PredictForm;
