def validate_input_row(row):
    try:
        pio2 = float(row["pio2"])
        spo2 = float(row["spo2"])
    except (KeyError, TypeError, ValueError):
        return False, "All fields must be valid numbers."

    if pio2 < 13 or pio2 > 30:
        return False, "Inspired O₂ must be between 13 and 30 kPa."

    if spo2 < 80 or spo2 > 100:
        return False, "SpO₂ must be between 80% and 100%."

    return True, None
