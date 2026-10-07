# # backend/services/normalize.py

# import pandas as pd

# def normalize_df(df: pd.DataFrame, mine_id: str) -> pd.DataFrame:
#     """
#     Normalize algorithm output dataframe
#     so it matches database schema exactly.
#     """

#     df = df.copy()

#     # Ensure mine_id exists
#     df["mine_id"] = int(mine_id)

#     # Ensure date is DATE (not datetime)
#     df["date"] = pd.to_datetime(df["date"]).dt.date

#     # Rename columns to DB-friendly lowercase
#     df = df.rename(columns={
#         "B4": "b4",
#         "B8": "b8",
#         "B11": "b11",
#         "NDVI": "ndvi",
#         "NBR": "nbr"
#     })

#     # Select only what we store
#     df = df[
#         [
#             "mine_id",
#             "date",
#             "latitude",
#             "longitude",
#             "b4",
#             "b8",
#             "b11",
#             "ndvi",
#             "nbr",
#             "anomaly_label",
#             "anomaly_score",
#             "excavated_flag"
#         ]
#     ]

#     return df



# backend/services/normalize.py

import pandas as pd


def normalize_df(df: pd.DataFrame, mine_id: str) -> pd.DataFrame:
    """
    Normalize pixel-level data (df_anomaly OR violations)
    so it matches database schema exactly.
    """

    df = df.copy()

    # Ensure mine_id exists
    df["mine_id"] = int(mine_id)

    # Ensure date is DATE (not datetime)
    df["date"] = pd.to_datetime(df["date"]).dt.date

    # Rename spectral columns to DB-friendly lowercase (if present)
    df = df.rename(columns={
        "B4": "b4",
        "B8": "b8",
        "B11": "b11",
        "NDVI": "ndvi",
        "NBR": "nbr"
    })

    # -------------------------------
    # CASE 1: df_anomaly → pixel_timeseries
    # -------------------------------
    if "zone_type" not in df.columns:
        df = df[
            [
                "mine_id",
                "date",
                "latitude",
                "longitude",
                "b4",
                "b8",
                "b11",
                "ndvi",
                "nbr",
                "anomaly_label",
                "anomaly_score",
                "excavated_flag"
            ]
        ]
        return df

    # -------------------------------
    # CASE 2: violations → violation_pixels
    # -------------------------------
    df = df[
        [
            "mine_id",
            "date",
            "latitude",
            "longitude",
            "zone_type",
            "pixel_area",
            "anomaly_score"
        ]
    ]

    return df


def normalize_alerts(df: pd.DataFrame, mine_id: str) -> pd.DataFrame:
    """
    Normalize alert dataframe so it matches violation_alerts table.
    """

    df = df.copy()

    df["mine_id"] = int(mine_id)
    df["date"] = pd.to_datetime(df["date"]).dt.date

    df = df[
        [
            "mine_id",
            "date",
            "zone_type",
            "alert_type",
            "affected_area"
        ]
    ]

    return df