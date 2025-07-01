#!/bin/sh

# If VITE_API_URL is provided as an environment variable, use it for the build
if [ -n "$VITE_API_URL" ]; then
  echo "VITE_API_URL is set to $VITE_API_URL. Building with this URL."
  # Vite automatically picks up VITE_ prefixed environment variables
  # so we just need to ensure it's in the environment when npm run build is called.
else
  echo "VITE_API_URL is not set. Building with default API URL."
fi

echo "Running npm install..."
npm install

echo "Running npm run build..."
npm run build

# Execute the command passed to the entrypoint (e.g., serve -s dist -l 5173)
exec "$@"
