import { useState, useEffect } from 'react';

export function useDatapoints(maxPoints = 5) {
  const [datapoints, setDatapoints] = useState([{ pio2: '', spo2: '' }]);
  const [inputWarning, setInputWarning] = useState('');

  const addDatapoint = () => {
    if (datapoints.length < maxPoints) {
      setDatapoints([...datapoints, { pio2: '', spo2: '' }]);
    }
  };

  const removeDatapoint = (indexToRemove) => {
    setDatapoints(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...datapoints];
    updated[index][field] = value;
    setDatapoints(updated);
  };

  const allInputsValid = datapoints.every(dp => {
    const pio2 = parseFloat(dp.pio2);
    const spo2 = parseFloat(dp.spo2);
    return (
      !isNaN(pio2) && pio2 >= 13 && pio2 <= 53 &&
      !isNaN(spo2) && spo2 >= 72 && spo2 <= 99.9
    );
  });

  useEffect(() => {
    let warning = '';
    for (const dp of datapoints) {
      const pio2 = parseFloat(dp.pio2);
      const spo2 = parseFloat(dp.spo2);
      if (!isNaN(pio2) && (pio2 < 13 || pio2 > 53)) {
        warning = "Inspired O₂ must be between 13–53 kPa.";
        break;
      }
      if (!isNaN(spo2) && (spo2 < 72 || spo2 > 99.9)) {
        warning = "Oxygen saturation must be between 72–99.9%.";
        break;
      }
    }
    setInputWarning(warning);
  }, [datapoints]);

  return {
    datapoints,
    addDatapoint,
    removeDatapoint,
    handleInputChange,
    allInputsValid,
    inputWarning,
  };
}
