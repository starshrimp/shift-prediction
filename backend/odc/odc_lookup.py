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
