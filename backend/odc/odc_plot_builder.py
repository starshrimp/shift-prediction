from odc.odc_lookup import ODCInterpolator

def prepare_odc_plot_data(p50, measured_points, odc: ODCInterpolator, n=2.7):
    """
    Creates a dictionary with all ODC data needed for frontend plotting.
    Inputs:
        - p50: predicted p50 for this patient
        - measured_points: list of [PiO₂, SpO₂] pairs
        - odc: instance of ODCInterpolator
        - n: Hill coefficient (default 2.7)

    Returns: dict with po2, reference_spo2, predicted_spo2, measured_points
    """
    po2_ref, spo2_ref = odc.get_reference_curve()
    _, spo2_pred = odc.generate_predicted_curve(p50=p50, n=n)

    return {
        "po2": po2_ref.tolist(),
        "reference_spo2": spo2_ref.tolist(),
        "predicted_spo2": spo2_pred.tolist(),
        "measured_points": measured_points  # e.g., [[20.1, 83.5]]
    }
