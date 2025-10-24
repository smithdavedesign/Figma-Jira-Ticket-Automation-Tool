# Production Releases

This directory contains packaged releases of the Figma AI Ticket Generator plugin.

## Files

- **`figma-design-intelligence-platform-v4.0.0.zip`** - Production plugin package v4.0.0
- **`figma-design-intelligence-platform-v4.0.0.zip.sha256`** - SHA256 checksum for integrity verification

## Usage

1. Download the `.zip` file for the version you need
2. Verify integrity using the `.sha256` file:
   ```bash
   shasum -a 256 -c figma-design-intelligence-platform-v4.0.0.zip.sha256
   ```
3. Install in Figma Desktop by importing the plugin

## Versioning

Files follow semantic versioning: `figma-design-intelligence-platform-vX.Y.Z.zip`