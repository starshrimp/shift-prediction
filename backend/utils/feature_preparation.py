import numpy as np
import pandas as pd
from scipy.interpolate import PchipInterpolator

def get_spo2_to_po2_interpolator(odc):
    return PchipInterpolator(odc['SO2 (%)'], odc['PO2 (kPa)'])

def compute_shift_raw(row, spo2_to_po2):
    Pc = spo2_to_po2([row['SpO2(%)']])[0]
    return row['PiO2(kPa)'] - Pc

def add_shift_raw_column(df, spo2_to_po2):
    df['shift_raw'] = df.apply(lambda row: compute_shift_raw(row, spo2_to_po2), axis=1)
    return df

def add_engineered_features(df, spo2_to_po2):
    df['log_PiO2'] = np.log(df['PiO2(kPa)'])
    df['SpO2_over_PiO2'] = df['SpO2(%)'] / df['PiO2(kPa)']
    df['SpO2_squared'] = df['SpO2(%)'] ** 2
    df = add_shift_raw_column(df, spo2_to_po2)  # if not already present
    return df

def prepare_features_for_model(spo2, pio2, odc_interp):
    # Create a DataFrame for a single row
    df = pd.DataFrame([{'SpO2(%)': spo2, 'PiO2(kPa)': pio2}])
    df = add_engineered_features(df, odc_interp)
    # Extract features in required order
    features = df.loc[0, ['shift_raw', 'SpO2_over_PiO2', 'SpO2_squared', 'log_PiO2']].values
    return features