FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies if necessary
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files, models, and data splits
COPY . ./backend/
COPY ../models/ ./models/
COPY ../data_splits/ ./data_splits/
COPY ../data_processing.py ./data_processing.py

ENV PORT=8080
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["sh", "-c", "python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
