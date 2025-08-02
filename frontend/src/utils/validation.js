export function spo2OutOfRange(value) {
  if (value === '' || value === null) return false;  // don't show error for empty field

  const v = parseFloat(value);
  if (isNaN(v)) return true;

  if (/^\d+\.$/.test(value)) return false;

  return v < 80 || v > 100;
}

export function pio2OutOfRange(value) {
  if (value === '' || value === null) return false;  // don't show error for empty field

  const v = parseFloat(value);
  if (isNaN(v)) return true;

  if (/^\d+\.$/.test(value)) return false;

  return v < 13 || v > 30;
}
