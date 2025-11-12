#!/bin/bash

# Log File Monitor
# Monitors for any log or txt files being created in the project root
# and automatically moves them to the logs directory

PROJECT_ROOT="/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator"
LOGS_DIR="$PROJECT_ROOT/logs"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Log File Monitor started - watching for files in project root"
echo "📁 Project root: $PROJECT_ROOT"
echo "📂 Logs directory: $LOGS_DIR"
echo "⏹️  Press Ctrl+C to stop monitoring"
echo ""

# Function to move log files to logs directory
move_log_files() {
    local moved_count=0
    
    # Check for log files
    for log_file in "$PROJECT_ROOT"/*.log; do
        if [ -f "$log_file" ]; then
            local filename=$(basename "$log_file")
            local timestamp=$(date +"%Y%m%d_%H%M%S")
            local new_name="${filename%.*}_moved_${timestamp}.${filename##*.}"
            
            echo -e "${YELLOW}📦 Found log file in root: $filename${NC}"
            mv "$log_file" "$LOGS_DIR/$new_name"
            echo -e "${GREEN}✅ Moved to: logs/$new_name${NC}"
            moved_count=$((moved_count + 1))
        fi
    done
    
    # Check for txt files
    for txt_file in "$PROJECT_ROOT"/*.txt; do
        if [ -f "$txt_file" ]; then
            local filename=$(basename "$txt_file")
            local timestamp=$(date +"%Y%m%d_%H%M%S")
            local new_name="${filename%.*}_moved_${timestamp}.${filename##*.}"
            
            echo -e "${YELLOW}📄 Found txt file in root: $filename${NC}"
            mv "$txt_file" "$LOGS_DIR/$new_name"
            echo -e "${GREEN}✅ Moved to: logs/$new_name${NC}"
            moved_count=$((moved_count + 1))
        fi
    done
    
    if [ $moved_count -gt 0 ]; then
        echo -e "${GREEN}📊 Moved $moved_count files to logs directory${NC}"
        echo ""
    fi
}

# Initial check
cd "$PROJECT_ROOT"
move_log_files

# Monitor for new files (check every 5 seconds)
while true; do
    sleep 5
    move_log_files
done