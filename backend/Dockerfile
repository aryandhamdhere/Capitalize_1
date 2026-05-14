FROM python:3.10-slim

WORKDIR /app

# system deps for tabula/pdf etc (may need java for tabula)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-jre \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY ./app /app/app
COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
