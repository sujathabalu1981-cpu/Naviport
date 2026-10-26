import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const PYTHON_PORT = 8001;

app.use(express.json());

// Spawn Python FastAPI backend process if not already running
let pythonProcess: ChildProcess | null = null;

function startPythonBackend() {
  console.log('[Server] Checking / starting Python FastAPI backend...');
  pythonProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', `${PYTHON_PORT}`], {
    cwd: __dirname,
    stdio: 'inherit',
  });

  pythonProcess.on('error', (err) => {
    console.error('[Server] Failed to spawn Python backend:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[Server] Python backend exited with code ${code} and signal ${signal}`);
  });
}

// Start python backend
startPythonBackend();

// Clean up child process on exit
process.on('exit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});
process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill();
  process.exit();
});

// Proxy /api/* to the Python FastAPI backend
app.use('/api', (req, res) => {
  const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api${req.url}`;
  
  const headers: Record<string, string> = {
    'content-type': req.headers['content-type'] || 'application/json',
    'accept': req.headers['accept'] || 'application/json',
  };

  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: PYTHON_PORT,
    path: `/api${req.url}`,
    method: req.method,
    headers: headers,
    timeout: 10000,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Server] Proxy error connecting to Python backend (${targetUrl}):`, err.message);
    res.status(503).json({
      error: 'Python ML service is starting or unavailable.',
      details: err.message,
      suggestion: 'Ensure Python FastAPI is running on port 8000.'
    });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
  
  proxyReq.end();
});

// Setup Vite or static serving
async function setupFrontend() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] NAVIPORT full-stack server running on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Python backend proxying from http://127.0.0.1:${PYTHON_PORT}`);
  });
}

setupFrontend().catch((err) => {
  console.error('[Server] Failed to initialize frontend server:', err);
});
