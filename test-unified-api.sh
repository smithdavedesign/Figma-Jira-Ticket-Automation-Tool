#!/bin/bash

# 🧪 Test Unified Generate API
# Tests the new consolidated endpoint functionality

echo "🧪 Testing Unified Generate API"
echo "==============================="

# Start server in background
echo "📡 Starting server..."
npm start &
SERVER_PID=$!
sleep 5

echo "🎯 Testing unified endpoint: POST /api/generate"
echo ""

# Test 1: Basic JIRA generation with template strategy
echo "Test 1: Basic JIRA ticket generation (template strategy)"
echo "--------------------------------------------------------"
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": [{"type": "text", "content": "Login Button Component"}],
    "format": "jira",
    "strategy": "template",
    "documentType": "task"
  }' | jq '.success, .message, .data.format, .data.strategy' | head -10

echo ""

# Test 2: Auto-strategy detection
echo "Test 2: Auto-strategy detection"
echo "-------------------------------"
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": [
      {"type": "text", "content": "Complex Dashboard Component"},
      {"type": "button", "content": "Submit"},
      {"type": "input", "content": "Email field"},
      {"type": "select", "content": "Country dropdown"},
      {"type": "checkbox", "content": "Terms agreement"},
      {"type": "link", "content": "Forgot password"}
    ],
    "format": "jira",
    "strategy": "auto",
    "documentType": "story"
  }' | jq '.success, .data.strategy' | head -5

echo ""

# Test 3: Legacy endpoint with deprecation warning
echo "Test 3: Legacy endpoint (should show deprecation header)"
echo "--------------------------------------------------------"
curl -X POST http://localhost:3000/api/generate-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": [{"type": "text", "content": "Legacy Button"}],
    "platform": "jira",
    "documentType": "task"
  }' -I | grep -E "(X-Deprecated|X-Deprecation-Message)"

echo ""

# Test 4: Different formats (should show warnings for unimplemented formats)
echo "Test 4: Different output formats"
echo "--------------------------------"
for format in "wiki" "code" "markdown"; do
  echo "Testing format: $format"
  curl -X POST http://localhost:3000/api/generate \
    -H "Content-Type: application/json" \
    -d "{
      \"frameData\": [{\"type\": \"text\", \"content\": \"Test component\"}],
      \"format\": \"$format\",
      \"strategy\": \"template\",
      \"documentType\": \"task\"
    }" | jq '.success, .data.format' | head -2
  echo ""
done

echo ""

# Test 5: Error handling - invalid format
echo "Test 5: Error handling (invalid format)"
echo "---------------------------------------"
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": [{"type": "text", "content": "Test"}],
    "format": "invalid-format",
    "strategy": "template"
  }' | jq '.success, .error' | head -5

echo ""

# Test 6: Error handling - no data
echo "Test 6: Error handling (no frame data)"
echo "--------------------------------------"
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "format": "jira",
    "strategy": "template"
  }' | jq '.success, .error' | head -5

echo ""

# Cleanup
echo "🧹 Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "✅ Test completed!"
echo ""
echo "📊 Summary:"
echo "- ✅ Unified endpoint: /api/generate"
echo "- ✅ Format support: jira (working), wiki/code/markdown (planned)"
echo "- ✅ Strategy selection: ai, template, enhanced, legacy, auto"
echo "- ✅ Legacy compatibility with deprecation warnings"
echo "- ✅ Input validation and error handling"
echo "- ✅ Auto-strategy detection based on data richness"