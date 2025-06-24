FROM python:3.10-slim

# Set working directory to /app
WORKDIR /app

# Copy the entire repo into the container
COPY . .

# Install dependencies (from root-level requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Set working dir to backend for running the app
WORKDIR /app/backend

# Expose the backend port
EXPOSE 5000

# Run the backend
CMD ["python", "app.py"]
