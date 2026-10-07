import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler


# --------------------------------------------------
# CORE PREPROCESSING FUNCTION (REUSABLE)
# --------------------------------------------------
def preprocess_pixel_timeseries(data):
    """
    Preprocess pixel-wise Sentinel-2 time series data for ML.

    Parameters
    ----------
    data : pd.DataFrame
        Pixel-wise Sentinel-2 time series DataFrame

    Returns
    -------
    X : np.ndarray
        Scaled spectral feature matrix
    metadata : pd.DataFrame
        Metadata for post-ML analysis
    df_scaled : pd.DataFrame
        Fully processed DataFrame (scaled)
    """

    # -----------------------------------------
    # PHASE 1: Load & Validate Data
    # -----------------------------------------
    if isinstance(data, str):
        df = pd.read_csv(data)
    else:
        df = data.copy()
        

    required_columns = [
        "mine_id", "date", "latitude", "longitude",
        "B4", "B8", "B11", "NDVI", "NBR"
    ]

    missing_cols = set(required_columns) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    print("✅ Data loaded successfully")
    print("Shape:", df.shape)

    # -----------------------------------------
    # PHASE 2: Date Handling
    # -----------------------------------------
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"])

    df = df.sort_values(
        by=["mine_id", "latitude", "longitude", "date"]
    ).reset_index(drop=True)

    print("✅ Date conversion & sorting completed")

    # -----------------------------------------
    # PHASE 3: Missing / Invalid Value Handling
    # -----------------------------------------
    numeric_cols = ["B4", "B8", "B11", "NDVI", "NBR"]

    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)

    initial_rows = df.shape[0]
    df = df.dropna(subset=numeric_cols)
    final_rows = df.shape[0]

    print(f"Removed {initial_rows - final_rows} invalid rows")
    print("Remaining rows:", final_rows)

    # -----------------------------------------
    # PHASE 4: Feature Scaling
    # -----------------------------------------
    features = df[numeric_cols].values

    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    df_scaled = df.copy()
    df_scaled[numeric_cols] = features_scaled

    print("✅ Feature scaling completed")

    # -----------------------------------------
    # PHASE 5: Temporal Helper Features
    # -----------------------------------------
    df_scaled["month"] = df_scaled["date"].dt.month

    df_scaled["time_index"] = (
        df_scaled
        .groupby(["mine_id", "latitude", "longitude"])
        .cumcount()
    )

    print("✅ Temporal helper features added")

    # -----------------------------------------
    # PHASE 6: Final Output
    # -----------------------------------------
    X = df_scaled[numeric_cols].values

    metadata = df_scaled[
        ["mine_id", "date", "latitude", "longitude", "month", "time_index"]
    ]

    print("✅ Preprocessing completed")
    print("ML Feature Matrix Shape:", X.shape)

    return X, metadata, df_scaled



