#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies"
pip install -r requirements.txt

echo "Collecting static files"
python manage.py collectstatic --no-input

echo "Creating initial migrations if needed"
python manage.py makemigrations users

echo "Running database migrations"
python manage.py migrate

echo "Build completed successfully"
