const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const Tree = require('../tree');
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




const port = 5241;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
