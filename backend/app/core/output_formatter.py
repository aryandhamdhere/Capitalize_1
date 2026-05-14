import pandas as pd
import os
from ..config import settings

def export_to_excel(df, filename="report.xlsx"):
    file_path = os.path.join(settings.REPORT_DIR, filename)
    pd.DataFrame(df).to_excel(file_path, index=False)
    return file_path

def export_to_csv(df, filename="report.csv"):
    file_path = os.path.join(settings.REPORT_DIR, filename)
    pd.DataFrame(df).to_csv(file_path, index=False)
    return file_path