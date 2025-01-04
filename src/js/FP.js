const cancelBtn = document.getElementById('cancel-btn');
const openBtn = document.getElementById('open-btn');
const current_path = document.getElementById('current-path'); 
const goBack = document.getElementById('go-back'); 
const goFoward = document.getElementById('go-foward'); 
const loading_icon = document.getElementById('icon-container-box');
const search_bar = document.getElementById('search-bar');
//search-bar

const url = 'http://localhost:5241/';
let length = 0; 
let map = new Map();
let fileTree;
let visited_path = [];
let visit_index = 0;  
let lastClickedElement = null;
let lastClickTime = 0;
let visited_trees = {};
var initial_path = ""; 


search_bar.addEventListener('input',()=>{filterFiles((search_bar.value))});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'f') {
        event.preventDefault(); // Prevent the default browser find action
        const searchBar = document.querySelector('.search-bar'); // Adjust the selector for your search bar
        if (searchBar) {
            searchBar.focus(); // Focus on your custom search bar
        }
    }
});


function filterFiles(searchText) {
    let allFiles = [];
    const items =  document.querySelectorAll(".file-item");

    for(let item = 0; item <items.length; item++)
    {
        const i = items[item].getElementsByTagName("span")[0].textContent;
        allFiles.push(i);
    }
    console.log(allFiles);
  
    // Matches files that match the search text character by character
    let match = [];
    allFiles.forEach(fileName => {
        let isMatch = true;

        // Check each character of the searchText against the fileName
        for (let i = 0; i < searchText.length; i++) {
           
            if (i >= fileName.length || searchText[i].toLowerCase() !== fileName[i].toLowerCase()) {
                isMatch = false;
                break;
            }
        }

        // If it matches for the entire searchText, add it to the matches
        if (isMatch) {
            match.push(fileName);
        }
    });

    console.log(match);

    // Update the UI to only show matching files
    const fileItems = document.querySelectorAll(".file-item");
    fileItems.forEach(fileItem => {
        const fileNameSpan = fileItem.querySelector(".file-name");
        const fileName = fileNameSpan.textContent;

        // Show or hide file items based on match
        if (match.includes(fileName)) {
            fileItem.style.display = ""; // Show matching items
        } else {
            fileItem.style.display = "none"; // Hide non-matching items
        }
    });
}



async function exist_dir(path)
{
    switchLoading();

    console.log("Requesting to go to : "+path);
    var response = await fetch(`${url}is/dir`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'path': path
        }
    });
    
    // Parse the response as JSON
    if (response.ok) {
        const text = await response.json();
        const dir = JSON.parse(text)
        console.log('Is a dir:', dir);

        return true; 
     
        //document.write(JSON.stringify(data)); // Write the JSON data to the document
    } else {
        // Handle errors
        console.log(`Error: ${response.status} ${response.statusText}`);
        switchLoading();
        return false; 
    }
  
   


}

function switchLoading()
{
  
    if(loading_icon.style.display === "none")
    {
        document.querySelector('.files-container').innerHTML ='';

        loading_icon.style.display = "block"; 
        return;
    }else{
        loading_icon.style.display = "none"; 
    }

}


async function loadCurrentPath() 
{
    try{
        console.log("Requesting current path");
        var response = await fetch(`${url}get/current-path`, {
            method: 'GET',
            headers: {
                'Accept': 'text/plain',
            }
        });
        
        // Parse the response as JSON
        if (response.ok) 
        {
            const path = await response.text();
            
            current_path.value = path.replaceAll('\\','/').replaceAll('"','').replaceAll("'","");
            initial_path = current_path.value; 
            console.log("Current path",initial_path);
        }
    }catch(error)
    {
        console.log("Error",error);
    }
}

function isAbsolutePath(path) {
    // Check for Windows absolute path (e.g., C:/ or C:\)
    const isWindowsAbsolute = /^[a-zA-Z]:[\\/]/.test(path);
    // Check for Unix-like absolute path (starts with /)
    const isUnixAbsolute = path.startsWith('/');

    return isWindowsAbsolute || isUnixAbsolute;
}
 
async function getTree(path,depth=1) 
{
    var response = await fetch(`${url}get/dir`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'path': path,
            'depth':depth
        }
    });
    if(response.ok)
    {
        const json = await response.text();
        return JSON.parse(json); 
    }else{
        return null; 
    }
}

async function getDir(path,depth=1,getTreeOnly=false)
{
    
    if (visited_trees[path]?.fileTree && !getTreeOnly) {
        console.log(`Loading cached file tree for: ${path}`);
        //fileTree = visited_trees[path];
        fileTree = visited_trees[path].fileTree;
        //visit_index = visited_trees[path].index; // Update visit_index from cached data
        //current_path.value = visited_path[visit_index]; // Update the current path
        //visited_trees[path].index
        await generateFileList(fileTree);
        await addClickFunction();
        return;
    }
    

    switchLoading();
    try{
        console.log("Requesting to go to : "+path);
        var response = await fetch(`${url}get/dir`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'path': path,
                'depth':depth
            }
        });
        
        // Parse the response as JSON
        if (response.ok) {
            const json = await response.text();
           
            //const text = await response.json();
            //console.log("Text response",text);
            //fileTree = json;
            fileTree = JSON.parse(json);
            //console.log("Recived fileTree: ",fileTree);

            //visited_trees[path] = fileTree;
            visited_trees[path] = {
                fileTree,
                index: visited_path.length // Cache the index
            };

            console.log('fileTree:', fileTree);

            await generateFileList(fileTree);
            await addClickFunction();

            // Update visited paths and index
            //if (visit_index === visited_path.length - 1) {
                visited_path.push(path);
                visit_index++;
          
        

        
            //document.write(JSON.stringify(data)); // Write the JSON data to the document
            } else {
                // Handle errors
                console.log(`Error: ${response.status} ${response.statusText}`);
            }
    }catch(error)
    {
        console.log(error);
    }finally{
        switchLoading();
    }
  

}


function navigateBack() {
    let path = current_path.value;
    path = path.substring(0,path.lastIndexOf('/'));

    if (visit_index > 0) {
        visit_index--;
        console.log("Navigate back:", path);
        gotoDir(path);        
        return;
    }else{
        console.log("Navigating back without history",path);
        gotoDir(path);        
    }
  
}

function navigateForward() {
    if (visit_index < visited_path.length - 1) {
        visit_index++;
        
        const path = visited_path[visit_index];
        console.log("Navigate foward:", { visit_index, path });

        current_path.value = path;
        getDir(path);
    }
}

goBack.addEventListener('click', navigateBack);
goFoward.addEventListener('click', navigateForward);


 
 
async function generateFileList(filesData) {
    console.log("Building file list");
    const container = document.querySelector('.files-container');
    //filesData.items.shift();
    // Recursive function to create file items
    function createFileItem(item) {
        const fileItemDiv = document.createElement('div');
        fileItemDiv.classList.add('file-item');
        
        // Checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.setAttribute('data-path',`${item.path}`);
        checkbox.setAttribute('data-id',`${item.id}`);
        checkbox.setAttribute('data-name',`${item.name}`);
        checkbox.setAttribute('data-type',`${item.type}`);




        checkbox.classList.add('file-checkbox');
        
        fileItemDiv.appendChild(checkbox);
        
        // File or folder icon
        const icon = document.createElement('i');
        if (item.type === 'dir') {
            icon.classList.add('fas', 'fa-folder');
        } else {
            const extension = item.name.split('.').pop().toLowerCase();
            // Set file icon based on file extension
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
        //fileNameSpan.dataset.type = item.type;
        fileNameSpan.textContent = item.name;
        fileItemDiv.appendChild(fileNameSpan);
        
        return fileItemDiv;
    }

    // Clear previous content
    container.innerHTML = '';
    //console.log(filesData);
    // Create file items from the data
    filesData.items.forEach(item => {
        const fileItemDiv = createFileItem(item);
        container.appendChild(fileItemDiv);

        // Handle sub-directories and files recursively
        if (item.sub && item.sub.length > 0) {
            const subContainer = document.createElement('div');
            subContainer.classList.add('files-container');
            item.sub.forEach(subItem => {
                const subItemDiv = createFileItem(subItem);
                subContainer.appendChild(subItemDiv);
            });
            container.appendChild(subContainer);
        }
    });
     
        // this removes the first directory since this is the current
        // directory that we are in
        // @work around
   
    const firstFileItem = container.querySelector('.file-item');
    if (firstFileItem) {
        firstFileItem.remove();
    }
}
 
 
function gotoDir(dir)
{
    console.log("Loading directory");
    current_path.value = dir; 
    getDir(current_path.value);
    
} 

function cancelOperation()
{
    console.log("Cancel operation requested...");
    window.parent.postMessage({type:'cancel-op'}, '*'); // Notify parent to close iframe
}

function isMultiple()
{
    const boxes = document.querySelectorAll('.file-checkbox');
    for(let item = 0; item < boxes.length; item++)
    {
        if(boxes[item].isChecked)
        {
            return true; 
        }

    }
    return false;
    
}


 
async function openOperation() {
    console.log("Opening operation requested...");
    const items = document.querySelectorAll('.file-item');
    // This also clears the file list
    switchLoading();

    const selected = {
        "root-path": current_path.value,
        "items": [] // Initialize the "items" array
    };
    selected["root-path"] = current_path.value;

    // Using for...of to handle asynchronous operations in sequence
    for (const item of items) {
        const input = item.querySelector('input');

        if (input.checked) {
            const name = input.getAttribute('data-name');
            const type = input.getAttribute('data-type');
            const path = input.getAttribute('data-path');
            const id = input.getAttribute('data-id');

            switch (type) {
                case 'dir':
                    const tree = await getTree(`${path}/`, 0);

                    const dirObj = {
                        name: name,
                        type: type,
                        path: path,
                        id: id,
                        sub: tree.items[0]?.sub
                    };
                    //console.info({ tree });

                    //if(tree.items[0].sub)tree.items[0].sub.shift();
                    
                    //console.info({ sub: tree.items[0]?.sub });
                    
                    selected.items.push(dirObj);
                    break;

                case 'file':
                    const fileObj = {
                        name: name,
                        type: type,
                        path: path,
                        id: id
                    };
                    selected.items.push(fileObj);
                    break;
            }
        }
    }

    console.log("Selected items", selected);

    // If no items are selected, fetch the default tree
    if (selected.items.length === 0) {
        const tree = await getTree(current_path.value, 0);
        console.log({ 'Tree': tree, 'From': current_path.value });

        const dirObj = {
            name: tree.items[0]?.name,
            type: tree.items[0]?.type,
            path: tree.items[0]?.path,
            id: tree.items[0]?.id,
            sub: tree.items[0]?.sub
        };
        selected.items.push(dirObj);
    }

    console.log("Selected", selected);

    // Send the result back with a delay
    setTimeout(() => {
        window.parent.postMessage({ type: 'selection', message: selected }, '*');
        switchLoading();
    }, 1000);

    return selected;
}


/*
async function openOperation() 
{
   
    console.log("Opening operation requested...");
    const items = document.querySelectorAll('.file-item');
    //this also clear the file list
    switchLoading();

    const selected = {
        "root-path": current_path.value,
        "items": []  // Initialize the "items" array
    };
    selected["root-path"] = current_path.value;
  
   await items.forEach(async (item)=>
    {
        const input = item.querySelector('input');
       
        
        if(input.checked)
        {
           // console.log("item",item);

            const name = input.getAttribute('data-name');
            const type = input.getAttribute('data-type');
            const path = input.getAttribute('data-path');
            const id   = input.getAttribute('data-id');
            switch(type)
            {
                case 'dir':
                    const tree = await getTree(path,0);
    
                    const dirObj = {
                        name: name,
                        type: type,
                        path: path,
                        id: id,
                        sub: tree
                    };
                    console.info({tree});
                    console.info({sub:tree.items[0].sub});
                    selected.items.push(dirObj);
                    break;
                case 'file':
                    const fileObj = {
                        name: name,
                        type: type,
                        path: path,
                        id: id
                    };
                    selected.items.push(fileObj);
                    break;
            }

        }
    });
    
    console.log("Selected items",selected);
    
    if(selected.items.length === 0)
    {
        const tree = await getTree(current_path.value,0);
        console.log({'Tree':tree,'From':current_path.value});
       
        const dirObj = {
            name: tree.items[0].name,
            type: tree.items[0].type,
            path: tree.items[0].path,
            id:  tree.items[0].id,
            sub:tree.items[0].sub
        };
        selected.items.push(dirObj);
    }

    console.log("Selected",selected);
    
    setTimeout(()=>{
        window.parent.postMessage({type:'selection',message:selected},'*');
        switchLoading();
    },1000);
    return selected;
   
    
}

*/



function isDoubleClick(element) {
  const currentTime = Date.now(); // Get the current time in milliseconds
  const doubleClickThreshold = 300; // Maximum time (ms) between clicks to consider as double-click

  // Check if the same element was clicked and within the threshold time
  const isDoubleClick = 
    lastClickedElement === element && 
    currentTime - lastClickTime <= doubleClickThreshold;

  // Update the last clicked element and time
  lastClickedElement = element;
  lastClickTime = currentTime;

  return isDoubleClick;
}


async function addClickFunction()
{
    const file_items = document.querySelectorAll('.file-item');

    console.log(`Making items clickable ${file_items.length} items`);
    file_items.forEach((item)=>
    {

        const input = item.querySelector('input');
        const type = input.getAttribute('data-type');
        const path = input.getAttribute('data-path');
        item.addEventListener('dblclick',(event)=>
        {
            if(type === 'dir')
            {
                gotoDir(path);
                return;
            }else{
                input.checked = true; 
                openOperation();
            }
        });
        item.addEventListener('click',(event)=>
        {
            input.checked = input.checked?false:true;
        });
     

    });

}




function fixPath()
{
    let path = current_path.value;
    if(path[path.length-1] === '/' || 
        path[path.length-1] === '\\')
        {
            path.substring(0,path.length-2);
        }
    current_path.value = path; 
    return path; 
}

window.addEventListener('message', function(event) 
{
    const obj = event.data; 
    console.log("Message received",{obj});
    switch(obj.mode)
    {
        case 'open-any':
            break;
        case 'create-file':
            break;
    }
});

async function startup()
{
    switchLoading();
    //current_path.addEventListener('input',()=>{getDir(fixPath())});
    current_path.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
         
            getDir(fixPath());
        }
      });
    cancelBtn.addEventListener('click',cancelOperation);
    openBtn.addEventListener('click',openOperation);
    await loadCurrentPath();
    await getDir(fixPath());//load directory

}

startup();

//console.log(localStorage.getItem('fp-mode'));

//getDir(".");


// Call the function to generate the list
//generateFileList(filesJson);
