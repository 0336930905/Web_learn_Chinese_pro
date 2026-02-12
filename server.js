/**
 * Development Server
 * Serves both static files from /public and API from /api
 */
// Load environment variables first
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer(async (req, res) => {
  // Patch res.status and res.json for API routes (to be compatible with Express-style middleware)
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  console.log(`${req.method} ${req.url}`);

  // Handle API routes
  if (req.url.startsWith('/api')) {
    return app(req, res);
  }

  // Serve static files from /public
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  
  // Remove query string
  filePath = filePath.split('?')[0];

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  console.log(`📂 Attempting to serve: ${filePath}`);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.log(`❌ File not found: ${filePath}`);
        
        // Don't fallback for static assets (favicon, images, etc.)
        if (req.url.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|json|woff|woff2|ttf|eot)$/)) {
          console.log(`   Static asset not found, returning 404`);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File Not Found', 'utf-8');
          return;
        }
        
        console.log(`⤵️  Falling back to index.html for SPA routing`);
        // File not found - try index.html for SPA routing (only for HTML requests)
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Page Not Found</h1>', 'utf-8');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        console.log(`❌ Server error reading file: ${error.code}`);
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      console.log(`✅ Serving: ${filePath} (${contentType})`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from /public`);
  console.log(`🔌 API available at /api/*`);
  console.log(`\n📄 Pages:`);
  console.log(`   - Landing: http://localhost:${PORT}/`);
  console.log(`   - Login: http://localhost:${PORT}/login_screen.html`);
  console.log(`   - Signup: http://localhost:${PORT}/sign_up_screen.html`);
  console.log(`   - Categories: http://localhost:${PORT}/user/personal_vocabulary_categories_screen.html`);
  console.log(`   - User Home: http://localhost:${PORT}/user/home.html\n`);
});
