def validate_input_row(row):
    try:
        pio2 = float(row["pio2"])
        spo2 = float(row["spo2"])
    except (KeyError, TypeError, ValueError):
        return False, "All fields must be valid numbers."

    if pio2 < 13 or pio2 > 53:
        return False, "Inspired O₂ must be between 13 and 53 kPa."

    if spo2 < 72 or spo2 > 99.9:
        return False, "SpO₂ must be between 72 and 99.9%."

    return True, None
