#!/bin/bash
# This script starts the client and backend applications for development.

# Start the client
echo "Starting client..."
(cd client && npm run dev) &

# Start the backend
echo "Starting backend..."
(cd backend && . venv/bin/activate && cd app && uvicorn main:app --reload) &

# Wait for all background jobs to finish
wait
