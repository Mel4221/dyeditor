const http = require('http');
const fs = require('fs').promises;
const path = require('path');

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