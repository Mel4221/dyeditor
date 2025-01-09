const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Welcome endpoint
app.get('/', (req, res) => {
    res.send('Welcome to QNote!');
});

// Save file
app.post('/save/file', async (req, res) => {
    try {
        const filePath = req.header('path');

        if (!filePath) {
            return res.status(400).json({ error: "The 'path' header cannot be null or empty." });
        }

        const data = req.body;
        await fs.writeFile(filePath, JSON.stringify(data), 'utf8');

        res.json({ result: 'saved' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get file info
app.get('/get/file-info', async (req, res) => {
    try {
        const filePath = req.header('path');

        if (!filePath) {
            return res.status(400).json({ error: "The 'path' header cannot be null or empty." });
        }

        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);

        if (!fileExists) {
            return res.status(404).json({ error: `The specified file '${filePath}' does not exist.` });
        }

        const content = await fs.readFile(filePath, 'utf8');
        res.json({
            fileName: path.basename(filePath),
            content,
            length: content.length,
            size: Buffer.byteLength(content, 'utf8')
        });
    } catch (err) {
        res.status(500).json({ error: `An error occurred: ${err.message}` });
    }
});

// Get current working directory
app.get('/get/current-path', (req, res) => {
    res.send(process.cwd());
});

// Check if file exists
app.get('/is/file', async (req, res) => {
    const filePath = req.header('path');
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    res.send(exists);
});

// Check if directory exists
app.get('/is/dir', async (req, res) => {
    const dirPath = req.header('path');
    const exists = await fs.stat(dirPath).then(stats => stats.isDirectory()).catch(() => false);
    res.send(exists);
});

// Get directory tree
app.get('/get/dir', async (req, res) => {
    const dirPath = req.header('path');
    const depth = parseInt(req.header('depth')) || 0;

    if (!dirPath) {
        return res.status(400).json({ error: "The path cannot be null or empty." });
    }

    try {
        const dirExists = await fs.stat(dirPath).then(stats => stats.isDirectory()).catch(() => false);

        if (!dirExists) {
            return res.status(400).json({ error: `The specified path '${dirPath}' does not exist.` });
        }

        const tree = new Tree(dirPath, depth);
        tree.build();
        res.json(tree.toJson());
    } catch (err) {
        res.status(500).json({ error: `An error occurred while processing the request: ${err.message}` });
    }
});

// Tree structure class
class Tree {
    constructor(basePath, depth = 0) {
        this.basePath = basePath;
        this.depth = depth;
        this.items = [];
    }

    async map(dirPath, currentDepth = 0) {
        const item = {
            type: (await fs.stat(dirPath)).isDirectory() ? 'dir' : 'file',
            name: path.basename(dirPath),
            path: path.relative(this.basePath, dirPath).replace(/\\/g, '/')
        };

        if (item.type === 'dir' && (this.depth === 0 || currentDepth < this.depth)) {
            item.sub = [];

            try {
                const entries = await fs.readdir(dirPath);
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry);
                    item.sub.push(await this.map(fullPath, currentDepth + 1));
                }
            } catch (err) {
                console.error(`Error accessing directory: ${dirPath}. ${err.message}`);
            }
        }

        return item;
    }

    async build() {
        this.items = [await this.map(this.basePath)];
    }

    toJson() {
        return { items: this.items };
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
