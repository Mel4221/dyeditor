
// Assuming 'fileTree' is the global object containing all the directory and file data

fileTree = {
    "root": {
        "items": [
            {
                "Type": "dir",
                "Name": "dir1",
                "Sub": [
                    {
                        "Type": "file",
                        "Name": "file1.txt",
                        "Sub": []
                    },
                    {
                        "Type": "file",
                        "Name": "file2.txt",
                        "Sub": []
                    }
                ]
            },
            {
                "Type": "dir",
                "Name": "dir2",
                "Sub": [
                    {
                        "Type": "file",
                        "Name": "file3.txt",
                        "Sub": []
                    }
                ]
            },
            {
                "Type": "file",
                "Name": "root_file.txt",
                "Sub": []
            }
        ]
    }
};

// Function to load the contents of a directory from the global fileTree object
function loadDirectoryContents(path) {
    const container = document.querySelector('.list-unstyled');

    // Clear the current content before loading new files
    container.innerHTML = '';

    // Navigate to the specified path in the global file tree
    const pathParts = path.split('/'); // Split the path into parts
    let currentDir = fileTree;

    // Traverse down the file tree to reach the desired directory
    pathParts.forEach(part => {
        if (currentDir[part]) {
            currentDir = currentDir[part];
        }
    });

    // Create and append the new file and directory items
    generateFileList(currentDir, path);
}

// Function to generate the file list from the current directory
function generateFileList(filesData, currentPath) {
    const container = document.querySelector('.list-unstyled');

    filesData.items.forEach(item => {
        const fileItemDiv = document.createElement('div');
        fileItemDiv.classList.add('file-item');
        
        // Checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('file-checkbox');
        fileItemDiv.appendChild(checkbox);
        
        // File or folder icon
        const icon = document.createElement('i');
        if (item.Type === 'dir') {
            icon.classList.add('fas', 'fa-folder');
        } else {
            const extension = item.Name.split('.').pop().toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                icon.classList.add('fas', 'fa-file-image');
            } else if (['js', 'html', 'css'].includes(extension)) {
                icon.classList.add('fas', 'fa-file-code');
            } else if (['txt'].includes(extension)) {
                icon.classList.add('fas', 'fa-file-alt');
            } else {
                icon.classList.add('fas', 'fa-file');
            }
        }
        fileItemDiv.appendChild(icon);
        
        // File name
        const fileNameSpan = document.createElement('span');
        fileNameSpan.classList.add('file-name');
        fileNameSpan.dataset.type = item.Type;
        fileNameSpan.textContent = item.Name;
        fileItemDiv.appendChild(fileNameSpan);

        // Add event listener to navigate into directories
        if (item.Type === 'dir') {
            fileNameSpan.addEventListener('dblclick', function() {
                // Construct the new path and load the contents of that directory
                const newPath = `${currentPath}/${item.Name}`;
                loadDirectoryContents(newPath);
            });
        }

        container.appendChild(fileItemDiv);
    });
}

// Function to initialize the root directory view
function initializeRootDirectory() {
    loadDirectoryContents('root');
}

// Initialize the UI with the root directory contents on page load
initializeRootDirectory();
