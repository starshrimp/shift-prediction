import React, { useState } from 'react';

function PingTest() {
  const [response, setResponse] = useState(null);

  const handlePing = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/ping');
      const data = await res.json();
      setResponse(data.message);
    } catch (err) {
      setResponse("Could not connect to Flask 😢");
    }
  };

  return (
    <div>
      <button onClick={handlePing}>Ping Flask Backend</button>
      {response && <p>Response: {response}</p>}
    </div>
  );
}

export default PingTest;
