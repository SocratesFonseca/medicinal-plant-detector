# Medicinal Plant Detector

## Overview

Medicinal Plant Detector is a full-stack application for identifying medicinal plants from images.

## Live Demo

Not deployed yet.

## Tech Stack

- React and Vite
- FastAPI
- Pytest

## Dataset

Dataset research is in progress.

## Features

- React frontend
- FastAPI backend
- API health check

## Evaluation

Model evaluation results are not available yet.

## Deployment

The backend is containerized for Docker-based AWS Elastic Beanstalk deployment.

Build from the `backend` directory with `docker build -t medicinal-plant-detector-api .`.
Create a Docker Elastic Beanstalk environment, deploy the backend source bundle, and
set `FRONTEND_ORIGIN` in the environment properties. The container uses the platform
`PORT` value and defaults to port `8000`.

## API

`GET /health` returns `{"status": "ok"}`.

## Testing

Run backend tests with `pytest` from the `backend` directory.

## Limitations

Plant detection and image upload are not available in the current version.
