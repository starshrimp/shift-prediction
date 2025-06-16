# backend/odc_lookup.py or backend/utils/odc_lookup.py

import pandas as pd
import numpy as np
from pathlib import Path
from scipy.interpolate import PchipInterpolator

class ODCInterpolator:
    def __init__(self, odc_path="data/Neonatal_ODC_Table.csv"):
        self.odc_path = Path(odc_path)
        self.odc = pd.read_csv(self.odc_path).sort_values('SO2 (%)').drop_duplicates('SO2 (%)')
        self.interpolator = PchipInterpolator(self.odc['SO2 (%)'], self.odc['PO2 (kPa)'])

    def spo2_to_pco2(self, spo2):
        """
        Converts SpO₂ (%) to corresponding PcO₂ (kPa) using neonatal ODC table.
        Supports single values or lists.
        """
        return self.interpolator(spo2)

    def get_reference_curve(self):
        """
        Returns the reference ODC curve from the original neonatal lookup table.
        Output: tuple of (po2 array, spo2 array)
        """
        po2 = self.odc['PO2 (kPa)'].values
        spo2 = self.odc['SO2 (%)'].values
        return po2, spo2
    
    def generate_predicted_curve(self, p50, n=2.7):
        """
        Generates an SpO₂ curve using a Hill model with custom p50 and Hill coefficient n.
        Returns (po2, spo2_pred)
        """
        po2 = self.odc['PO2 (kPa)'].values
        spo2_pred = (po2 ** n) / (po2 ** n + p50 ** n)
        spo2_pred *= 100  # convert to percentage to match reference curve
        return po2, spo2_pred
    
    def get_p50_reference(self):
        """
        Returns the PO₂ value where SpO₂ = 50% from the neonatal ODC table.
        """
        return float(self.interpolator(50.0))

