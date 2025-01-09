const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const Tree = require('./tree');
 
//const { create } = require('domain');

const parseJsonBody = (req) => {
    return new Promise((resolve, reject) => 
        {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                resolve(body);
            } catch (err) {
                reject(err);
            }
        });
    });
};


const server = http.createServer(async (req, res) => 
    {
        const headers = req.headers;
        const method = req.method;
        const url = req.url;
        let dfpath; 
        let exists;
        let file; 
        
        // Add CORS headers to all responses
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods','*');// 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers','*');//'Content-Type, Path, Depth');
        
        switch(method)
        {
            case 'OPTIONS':
                res.writeHead(204, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Headers': '*',
                  });
                res.end();
                break;
            case 'GET':
                switch(url)
                {
                    case '/':
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Welcome to QNote!');
                        break;
                    case  '/get/current-path':
                        res.writeHead(200, { 'Content-Type': 'text/plain'});
                        dfpath = await process.cwd();
                        res.end(dfpath);
                        return;
                    case '/is/dir':
                        dfpath = headers['path'];
                        exists = await fs.stat(dfpat)
                            .then(stats => stats.isDirectory())
                            .catch(() => false); // Returns false if path doesn't exist or error occurs
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ exists }));
                        break;
                    case '/is/file':
                        file = headers['path'];
                        exists = await fs.stat(file)
                            .then(stats => stats.isFile())
                            .catch(() => false); // Returns false if path doesn't exist or error occurs
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ exists }));
                        return;
                        case '/get/file':
                            try {
                                file = headers['path']; // Declare and initialize filePath
                                if (!file) {
                                    // Check if filePath is provided
                                    res.writeHead(400, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: "No file path specified in headers." }));
                                    return;
                                }
                        
                                const fileExists = await fs.access(file).then(() => true).catch(() => false);
                                if (!fileExists) {
                                    res.writeHead(404, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: `The specified file '${file}' does not exist.` }));
                                    return;
                                }
                                
                                const content = await fs.readFile(file, 'utf8');
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                const json = JSON.stringify({
                                    fileName: path.basename(file),
                                    content: content,
                                    length: content.length,
                                    size: Buffer.byteLength(content, 'utf8'),
                                })
                                res.end(json);
                                return;
                            } catch (err) {
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: `An error occurred: ${err.message}` }));
                            }
                            break;
                    case '/get/dir':
                        try {
                            const dirPath = headers['path'];
                            const depth = parseInt(headers['depth'], 10) || 0; // Depth defaults to 0 if not provided.
                        
                            // Validate the provided path
                            if (!dirPath) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'The path cannot be null or empty.' }));
                                return;
                            }
                        
                            // Check if the path exists and is a directory
                            const dirExists = await fs.stat(dirPath).then((stats) => stats.isDirectory()).catch(() => false);
                            if (!dirExists) {
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: `The specified path '${dirPath}' does not exist or is not a directory.` }));
                                return;
                            }
                        
                            // Create a Tree object and enable debugging if needed
                            const tree = new Tree(dirPath, true, depth); // `true` enables debugger, `depth` controls recursion level.
                            await tree.build(); // Build the directory tree structure.
                        
                            // Send the directory tree as a JSON response
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ items: tree.items })); // Directly use the `items` property of the Tree object.
                        } catch (err) {
                            // Handle any unexpected errors
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: `An error occurred while processing the request: ${err.message}` }));
                        }
                        break;
                    default:
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('End point Not Found');
                        break;
                }
                break;
            case 'POST':
                    switch(url)
                    {
                        case '/save/file':
                            try 
                            {
                                file = headers['path'];
                                if (!file) {
                                    res.writeHead(400, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: "The 'path' header cannot be null or empty." }));
                                    return;
                                }

                                const data = await parseJsonBody(req);
                                await fs.writeFile(file,data,'utf8');

                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ result: 'saved' }));
                                return;
                            } catch (err) {
                                
                                res.writeHead(400, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: err.message }));
                            }
                        break;
                        default:
                             
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('End point Not Found');
                            
                            break;
                    }
             break;
            default:
                 
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('METHOD Not Found');
               
                break;
        }
        

    });


    //app.options('*', cors(corsOptions));


    const port = 5241;
 
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

 