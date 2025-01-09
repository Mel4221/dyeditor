const fs = require('fs').promises;
const path = require('path');

// Item class to represent each directory or file
class Item {
    constructor(type, name, relativePath, id = Item.generateId()) {
        this.type = type;
        this.name = name;
        this.path = relativePath;
        this.id = id;
        this.sub = [];
    }

    static generateId() {
        return Math.floor(Math.random() * (99999999 - 11111111 + 1)) + 11111111; // Random ID
    }
}

// Tree class for directory traversal
class Tree {
    constructor(basePath = '', allowDebugger = false, depth = 0) {
        this.basePath = path.resolve(basePath);
        this.allowDebugger = allowDebugger;
        this.depth = depth;
        this.currentDepth = 0;
        this.items = [];
    }

    logDebug(message, color = 'blue') {
        if (this.allowDebugger) {
            const colors = { red: '\x1b[31m', blue: '\x1b[34m', yellow: '\x1b[33m', reset: '\x1b[0m' };
            console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
        }
    }

    async map(dirPath, currentDepth = 0) {
        let stats;
        try {
            stats = await fs.stat(dirPath);
        } catch (err) {
            this.logDebug(`Error reading stats for ${dirPath}: ${err.message}`, 'red');
            return null;
        }

        const type = stats.isDirectory() ? 'dir' : 'file';
        const name = path.basename(dirPath);
        //this dhould return the full path 
        const relativePath = dirPath.replace(/\\/g, '/');//path.relative(this.basePath, dirPath).replace(/\\/g, '/');
        const item = new Item(type, name, relativePath);

        if (type === 'dir' && (this.depth === 0 || currentDepth < this.depth)) {
            try {
                const entries = await fs.readdir(dirPath);
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry);
                    const subItem = await this.map(fullPath, currentDepth + 1);
                    if (subItem) item.sub.push(subItem);
                }
            } catch (err) {
                this.logDebug(`Error accessing directory: ${dirPath}. ${err.message}`, 'red');
            }
        }

        return item;
    }

    async build() {
        if (!this.basePath) {
            throw new Error('The base path is empty.');
        }

        const rootItem = await this.map(this.basePath, 0);
        if (rootItem) this.items.push(rootItem);
    }

    toJson() {
        return JSON.stringify({ items: this.items }, null, 2);
    }
}

module.exports = Tree;


/*
// Example Usage
(async () => {
    const tree = new Tree('/your/directory/path', true, 2); // Set your path and depth
    await tree.build();
    console.log(tree.toJson());
})();
*/