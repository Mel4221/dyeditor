// Initialize global variables
const url = 'http://localhost:5241/QNote/';
let fileTree; // Stores the current file tree
let visited_path = []; // Tracks visited paths
let visit_index = -1; // Points to the current path in visited_path
let visited_trees = {}; // Caches file trees by path

async function getDir(path) {
    // Check if the path is already cached
    if (visited_trees[path]) {
        console.log(`Loading cached file tree for: ${path}`);
        fileTree = visited_trees[path];
        await generateFileList(fileTree);
        return;
    }

    // Fetch directory content from the server
    switchLoading();
    console.log("Requesting directory: " + path);
    try {
        const response = await fetch(`${url}get/dir`, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'path': path }
        });

        if (response.ok) {
            const text = await response.json();
            fileTree = JSON.parse(text);

            // Cache the fetched file tree
            visited_trees[path] = fileTree;

            // Render the file list
            await generateFileList(fileTree);

            // Update visited paths and index
            if (visit_index === visited_path.length - 1) {
                visited_path.push(path);
                visit_index++;
            } else {
                visited_path = visited_path.slice(0, visit_index + 1);
                visited_path.push(path);
                visit_index++;
            }
        } else {
            console.error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error fetching directory:", error);
    } finally {
        switchLoading();
    }
}

function navigateBack() {
    if (visit_index > 0) {
        visit_index--;
        const path = visited_path[visit_index];
        current_path.value = path;
        getDir(path);
    }
}

function navigateForward() {
    if (visit_index < visited_path.length - 1) {
        visit_index++;
        const path = visited_path[visit_index];
        current_path.value = path;
        getDir(path);
    }
}

// Add event listeners for back and forward buttons
goBack.addEventListener('click', navigateBack);
goFoward.addEventListener('click', navigateForward);

// Add startup initialization
function startup() {
    switchLoading();
    current_path.addEventListener('change', () => getDir(current_path.value));
    current_path.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            getDir(current_path.value);
        }
    });

    cancelBtn.addEventListener('click', cancelOperation);
    openBtn.addEventListener('click', openOperation);
    goBack.addEventListener('click', navigateBack);
    goFoward.addEventListener('click', navigateForward);
}

// Initialize the application
startup();
getDir(".");
