const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const server = require('./server');



const port = 5241;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});