import React, { useState } from 'react'; // useState for dynamic values

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
      
    {error && <p style={{ color: "red" }}>Error: {error}</p>}



      {submitted && ( // only shows if submitted
        <p>
          You entered PiO₂ = <strong>{pio2}</strong> kPa and SpO₂ = <strong>{spo2}</strong>%
        </p>
      )}
      {prediction && <p>{prediction}</p>}

      {prediction !== null && (
          <p>
            <strong>Predicted shift:</strong> {prediction}
            {uncertainty !== null && <> ± {uncertainty}</>}
          </p>
        )}
      {confidence && (
        <p>
          <strong>Confidence level:</strong>{' '}
          {confidence === 'high' && <span style={{ color: 'green' }}>🟢 High</span>}
          {confidence === 'moderate' && <span style={{ color: 'orange' }}>🟡 Moderate</span>}
          {confidence === 'low' && <span style={{ color: 'red' }}>🔴 Low</span>}
        </p>
      )}

    </div>
  );
}

export default PredictForm; // makes it usable in other files


// To quantify model confidence, we used the standard deviation across predictions from 5 cross-validation models. We stratified confidence levels based on empirical percentiles of these standard deviations on the validation set:

// High confidence: SD < 0.03 (below median)

// Moderate confidence: 0.03 ≤ SD < 0.07 (up to ~75th percentile)

// Low confidence: SD ≥ 0.07 (above ~75–80th percentile)

// These thresholds were chosen to reflect regions of consistent model predictions while preserving interpretability for clinical users.