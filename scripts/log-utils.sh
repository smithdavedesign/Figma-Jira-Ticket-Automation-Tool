#!/bin/bash

# Log Utilities
# Ensures all logs are created in the proper logs directory

# Ensure logs directory exists
ensure_logs_dir() {
    if [ ! -d "logs" ]; then
        echo "📁 Creating logs directory..."
        mkdir -p logs
    fi
}

# Get log file path with timestamp
get_log_path() {
    local log_name="$1"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    ensure_logs_dir
    echo "logs/${log_name}_${timestamp}.log"
}

# Get simple log path without timestamp
get_simple_log_path() {
    local log_name="$1"
    ensure_logs_dir
    echo "logs/${log_name}"
}

# Log with timestamp to specific log file
log_to_file() {
    local message="$1"
    local log_file="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    ensure_logs_dir
    echo "[$timestamp] $message" >> "logs/$log_file"
}

# Export functions for use in other scripts
export -f ensure_logs_dir
export -f get_log_path
export -f get_simple_log_path
export -f log_to_file