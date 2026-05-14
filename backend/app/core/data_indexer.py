import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
import os

# Initialize FAISS + encoder
encoder = SentenceTransformer("all-MiniLM-L6-v2")
embedding_dim = 384
index = faiss.IndexFlatL2(embedding_dim)

TABLE_REGISTRY = {}      # { "filename_sheet": DataFrame }
METADATA = []            # list of {text, embedding, table_key}

def dataframe_to_text(df: pd.DataFrame):
    return df.to_string()

def index_data(extracted_data: dict, file_name: str):
    global index, METADATA, TABLE_REGISTRY

    for sheet, df in extracted_data.items():
        key = f"{file_name}_{sheet}"
        TABLE_REGISTRY[key] = df

        text = dataframe_to_text(df)
        emb = encoder.encode([text])[0]

        index.add(np.array([emb]).astype("float32"))
        METADATA.append({
            "table": key,
            "text": text,
            "embedding": emb
        })