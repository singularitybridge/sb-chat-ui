#!/bin/bash

set -euo pipefail  # Exit on any error, unset variables, or errors in pipelines

# Get the build status from the first argument
BUILD_STATUS="$1"

# Get the Slack webhook URL from the environment variable (better security practice)
SLACK_WEBHOOK_URL="$2"  


# Get the BUILD_ID from the third argument
BUILD_ID="$3"

# Get the PROJECT_ID from the fourth argument
PROJECT_ID="$4"

BUILD_URL="https://console.cloud.google.com/cloud-build/builds/$BUILD_ID?project=${PROJECT_ID}"

# Define the message payload (using a here-doc for better readability)
if [[ "$BUILD_STATUS" -eq 0 ]]; then
    MESSAGE=":white_check_mark: Build succeeded! [Build details]($BUILD_URL)"
else
    MESSAGE=":x: Build failed! [Build details]($BUILD_URL)"

    # Read error log with a maximum size to avoid flooding Slack
    ERROR_LOG=$(tail -n 50 /workspace/steps.log)
    MESSAGE="$MESSAGE

Error log (last 50 lines):
\`\`\`
$ERROR_LOG
\`\`\`"
fi

# Send the message to Slack (with error handling)
if curl -X POST -H 'Content-type: application/json' --data "{\"text\": \"$MESSAGE\"}" "$SLACK_WEBHOOK_URL"; then
    echo "Slack notification sent successfully."
else
    echo "Failed to send Slack notification." >&2
fi
