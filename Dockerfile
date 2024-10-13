FROM python:3.10

# Set the working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libsystemd-dev \
    && rm -rf /var/lib/apt/lists/*  # Clean up APT when done

# Copy the requirements file separately to leverage Docker layer caching
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --upgrade pip \
    && pip install "cython<3.0.0" wheel \
    && pip install "pyyaml==5.4.1" --no-build-isolation \
    && pip install python-multipart \
    && pip install -r /code/requirements.txt

# Copy application files
COPY ./app /code/app
COPY ./.env /code/

# Set PYTHONPATH environment variable
ENV PYTHONPATH="${PYTHONPATH}:/code/app"

# Command to run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
