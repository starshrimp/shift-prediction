import React, { useState } from 'react'; // useState for dynamic values

function PredictForm() {
  const [pio2, setPio2] = useState('');
  const [spo2, setSpo2] = useState('');
  const [submitted, setSubmitted] = useState(false); // whether form has been submitted

  const handleSubmit = (e) => {
    e.preventDefault(); // prevents page from reloading (HTML default behavior)
    setSubmitted(true);
  }; //e is event object -> created when submission occurs

  return ( //JSX syntax -> rendered UI
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Inspired O₂ (PiO₂ in kPa): 
          <input
            type="number"
            step="any"
            value={pio2}
            onChange={(e) => setPio2(e.target.value)} //e.target.value is input typed 
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
      

      {submitted && ( // only shows if submitted
        <p>
          You entered PiO₂ = <strong>{pio2}</strong> kPa and SpO₂ = <strong>{spo2}</strong>%
        </p>
      )}
    </div>
  );
}

export default PredictForm; // makes it usable in other files
