const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Helper: Parse JSON request body
const parseJsonBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
    });
};

// Tree class for directory traversal
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
            path: path.relative(this.basePath, dirPath).replace(/\\\\/g, '/'),
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

// Server
const server = http.createServer(async (req, res) => {
    const headers = req.headers;
    const method = req.method;
    const url = req.url;

    if (method === 'GET' && url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Welcome to QNote!');
    } else if (method === 'POST' && url === '/save/file') {
        try {
            const filePath = headers['path'];
            if (!filePath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "The 'path' header cannot be null or empty." }));
                return;
            }

            const data = await parseJsonBody(req);
            await fs.writeFile(filePath, JSON.stringify(data), 'utf8');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result: 'saved' }));
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (method === 'GET' && url === '/get/file-info') {
        try {
            const filePath = headers['path'];
            if (!filePath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "The 'path' header cannot be null or empty." }));
                return;
            }

            const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
            if (!fileExists) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `The specified file '${filePath}' does not exist.` }));
                return;
            }

            const content = await fs.readFile(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    fileName: path.basename(filePath),
                    content,
                    length: content.length,
                    size: Buffer.byteLength(content, 'utf8'),
                })
            );
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `An error occurred: ${err.message}` }));
        }
    } else if (method === 'GET' && url === '/get/current-path') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(process.cwd());
    } else if (method === 'GET' && url === '/is/file') {
        const filePath = headers['path'];
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(exists));
    } else if (method === 'GET' && url === '/is/dir') {
        const dirPath = headers['path'];
        const exists = await fs.stat(dirPath).then((stats) => stats.isDirectory()).catch(() => false);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(exists));
    } else if (method === 'GET' && url === '/get/dir') {
        try {
            const dirPath = headers['path'];
            const depth = parseInt(headers['depth']) || 0;

            if (!dirPath) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'The path cannot be null or empty.' }));
                return;
            }

            const dirExists = await fs.stat(dirPath).then((stats) => stats.isDirectory()).catch(() => false);
            if (!dirExists) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: `The specified path '${dirPath}' does not exist.` }));
                return;
            }

            const tree = new Tree(dirPath, depth);
            await tree.build();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tree.toJson()));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `An error occurred while processing the request: ${err.message}` }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 5241;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
