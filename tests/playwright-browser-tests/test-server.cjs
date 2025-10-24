#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, '../../');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root requests
  if (pathname === '/') {
    pathname = '/tests/integration/test-consolidated-suite.html';
  }

  const filePath = path.join(ROOT_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err.message);
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Test server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${ROOT_DIR}`);
  console.log(`🎯 Ultimate Test Suite: http://localhost:${PORT}/tests/integration/test-consolidated-suite.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});