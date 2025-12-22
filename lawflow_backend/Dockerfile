# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# libpq-dev and gcc are often needed for building psycopg2 (if using source)
# but we will use binary for simplicity in this setup.
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the dependency files
COPY pyproject.toml .

# Install dependencies
# We install psycopg2-binary explicitly for Postgres support
RUN pip install --no-cache-dir . psycopg2-binary

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Using shell form to allow variable expansion if needed, but array form is preferred for signals.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
