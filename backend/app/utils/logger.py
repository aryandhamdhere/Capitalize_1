import logging
import os

LOG_DIR = "backend/app/storage/logs"
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    filename=os.path.join(LOG_DIR, "app.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def info(msg: str):
    logging.info(msg)
    print("[INFO]", msg)

def error(msg: str):
    logging.error(msg)
    print("[ERROR]", msg)