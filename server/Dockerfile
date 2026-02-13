FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Copy project files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install --without dev --no-root

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Default command
CMD ["hypercorn", "app.main:create_app", "--factory", "--bind", "0.0.0.0:8000"]
