#!/usr/bin/env bash
set -euo pipefail

# Start server with an explicit corporate CA bundle for Node TLS trust.
CA_BUNDLE_PATH="${NODE_EXTRA_CA_CERTS:-${CORP_CA_BUNDLE_PATH:-/tmp/solidigm-ca-bundle.pem}}"

if [[ ! -f "$CA_BUNDLE_PATH" ]]; then
  echo "Error: CA bundle not found at $CA_BUNDLE_PATH"
  echo "Set NODE_EXTRA_CA_CERTS or CORP_CA_BUNDLE_PATH to a valid PEM bundle."
  exit 1
fi

echo "Using CA bundle: $CA_BUNDLE_PATH"
NODE_EXTRA_CA_CERTS="$CA_BUNDLE_PATH" npm start
