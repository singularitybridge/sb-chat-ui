#!/bin/sh

# Function to escape special characters for sed
escape_for_sed() {
    echo "$1" | sed 's/[[\.*^$()+?{|]/\\&/g'
}

# Function to replace placeholders in built files
replace_placeholders() {
    local dist_dir="dist"
    
    # Check if dist directory exists
    if [ ! -d "$dist_dir" ]; then
        echo "Error: dist directory not found. Make sure the build completed successfully."
        exit 1
    fi
    
    echo "Replacing placeholders in built files..."
    
    # Replace VITE_API_URL placeholder
    if [ -n "$VITE_API_URL" ]; then
        local escaped_api_url=$(escape_for_sed "$VITE_API_URL")
        echo "Replacing %VITE_API_URL% with $VITE_API_URL"
        find "$dist_dir" -type f -name "*.js" -exec sed -i "s|%VITE_API_URL%|$escaped_api_url|g" {} \;
        find "$dist_dir" -type f -name "*.html" -exec sed -i "s|%VITE_API_URL%|$escaped_api_url|g" {} \;
    else
        echo "Warning: VITE_API_URL environment variable is not set"
    fi
    
    # Replace VITE_GOOGLE_AUTH_CLIENT_ID placeholder
    if [ -n "$VITE_GOOGLE_AUTH_CLIENT_ID" ]; then
        local escaped_client_id=$(escape_for_sed "$VITE_GOOGLE_AUTH_CLIENT_ID")
        echo "Replacing %VITE_GOOGLE_AUTH_CLIENT_ID% with $VITE_GOOGLE_AUTH_CLIENT_ID"
        find "$dist_dir" -type f -name "*.js" -exec sed -i "s|%VITE_GOOGLE_AUTH_CLIENT_ID%|$escaped_client_id|g" {} \;
        find "$dist_dir" -type f -name "*.html" -exec sed -i "s|%VITE_GOOGLE_AUTH_CLIENT_ID%|$escaped_client_id|g" {} \;
    else
        echo "Warning: VITE_GOOGLE_AUTH_CLIENT_ID environment variable is not set"
    fi
    
    # Replace VITE_PUSHER_APP_KEY placeholder
    if [ -n "$VITE_PUSHER_APP_KEY" ]; then
        local escaped_pusher_key=$(escape_for_sed "$VITE_PUSHER_APP_KEY")
        echo "Replacing %VITE_PUSHER_APP_KEY% with $VITE_PUSHER_APP_KEY"
        find "$dist_dir" -type f -name "*.js" -exec sed -i "s|%VITE_PUSHER_APP_KEY%|$escaped_pusher_key|g" {} \;
        find "$dist_dir" -type f -name "*.html" -exec sed -i "s|%VITE_PUSHER_APP_KEY%|$escaped_pusher_key|g" {} \;
    else
        echo "Warning: VITE_PUSHER_APP_KEY environment variable is not set"
    fi
    
    # Replace VITE_PUSHER_CLUSTER placeholder
    if [ -n "$VITE_PUSHER_CLUSTER" ]; then
        local escaped_pusher_cluster=$(escape_for_sed "$VITE_PUSHER_CLUSTER")
        echo "Replacing %VITE_PUSHER_CLUSTER% with $VITE_PUSHER_CLUSTER"
        find "$dist_dir" -type f -name "*.js" -exec sed -i "s|%VITE_PUSHER_CLUSTER%|$escaped_pusher_cluster|g" {} \;
        find "$dist_dir" -type f -name "*.html" -exec sed -i "s|%VITE_PUSHER_CLUSTER%|$escaped_pusher_cluster|g" {} \;
    else
        echo "Warning: VITE_PUSHER_CLUSTER environment variable is not set"
    fi
    
    echo "Placeholder replacement completed."
}

# Run placeholder replacement
replace_placeholders

# Execute the command passed to the entrypoint (e.g., serve -s dist -l 5173)
exec "$@"
