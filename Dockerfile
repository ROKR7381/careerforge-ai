FROM python:3.12-slim

ARG BUILD_TIME=2026-06-21
WORKDIR /app

COPY python-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY python-backend/ .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
