const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const Tree = require('./tree'); // Assuming you have this module

const app = express();
const port = 5241;

// Middleware to parse JSON bodies
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).send('Welcome to QNote!');
});

// Get current working directory
app.get('/get/current-path', async (req, res) => {
  const currentPath = process.cwd();
  res.status(200).send(currentPath);
});

// Check if path is a directory
app.get('/is/dir', async (req, res) => {
  const dirPath = req.headers['path'];
  if (!dirPath) {
    return res.status(400).json({ error: 'No path specified in headers.' });
  }
  const isDirectory = await fs.stat(dirPath)
    .then(stats => stats.isDirectory())
    .catch(() => false);
  res.status(200).json({ exists: isDirectory });
});

// Check if path is a file
app.get('/is/file', async (req, res) => {
  const filePath = req.headers['path'];
  if (!filePath) {
    return res.status(400).json({ error: 'No path specified in headers.' });
  }
  const isFile = await fs.stat(filePath)
    .then(stats => stats.isFile())
    .catch(() => false);
  res.status(200).json({ exists: isFile });
});

// Get file content
app.get('/get/file', async (req, res) => {
  const filePath = req.headers['path'];
  if (!filePath) {
    return res.status(400).json({ error: 'No file path specified in headers.' });
  }
  try {
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!fileExists) {
      return res.status(404).json({ error: `The specified file '${filePath}' does not exist.` });
    }
    const content = await fs.readFile(filePath, 'utf8');
    res.status(200).json({
      fileName: path.basename(filePath),
      content,
      length: content.length,
      size: Buffer.byteLength(content, 'utf8'),
    });
  } catch (err) {
    res.status(500).json({ error: `An error occurred: ${err.message}` });
  }
});

// Get directory structure
app.get('/get/dir', async (req, res) => {
  const dirPath = req.headers['path'];
  const depth = parseInt(req.headers['depth'], 10) || 0;
  if (!dirPath) {
    return res.status(400).json({ error: 'The path cannot be null or empty.' });
  }
  try {
    const dirExists = await fs.stat(dirPath).then(stats => stats.isDirectory()).catch(() => false);
    if (!dirExists) {
      return res.status(400).json({ error: `The specified path '${dirPath}' does not exist or is not a directory.` });
    }
    const tree = new Tree(dirPath, true, depth);
    await tree.build();
    res.status(200).json({ items: tree.items });
  } catch (err) {
    res.status(500).json({ error: `An error occurred: ${err.message}` });
  }
});

// Save file content
app.post('/save/file', async (req, res) => {
  const filePath = req.headers['path'];
  if (!filePath) {
    return res.status(400).json({ error: "The 'path' header cannot be null or empty." });
  }
  try {
    const data = req.body; // Assuming the content is sent in the request body
    await fs.writeFile(filePath, data, 'utf8');
    res.status(200).json({ result: 'saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fallback for unhandled routes
app.all('*', (req, res) => {
  res.status(404).send('Endpoint Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
