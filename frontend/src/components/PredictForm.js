import React, { useState } from 'react'; // useState for dynamic values

function PredictForm() {
  const [pio2, setPio2] = useState('');
  const [spo2, setSpo2] = useState('');
  const [submitted, setSubmitted] = useState(false); // whether form has been submitted
  const [prediction, setPrediction] = useState(null);


  const handleSubmit = async (e) => { //async function to handle form submission
    e.preventDefault(); // prevents page from reloading (HTML default behavior)
    setSubmitted(true);
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
        setPrediction(`Predicted shift: ${data.prediction} (shift_raw = ${data.shift_raw}, log_PiO2 = ${data.log_PiO2})`);
      }
    } catch (err) {
      setPrediction("Network or server error");
    }
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
      {prediction && <p>{prediction}</p>}

      {prediction !== null && (
        <p>Predicted shift: <strong>{prediction}</strong></p>
      )}

    </div>
  );
}

export default PredictForm; // makes it usable in other files
