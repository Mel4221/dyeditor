 /*
    This is the ToolsStrip top where you have pretty mutch the maing options
    @Strip
    @index0
 */
const newFileBtn = document.getElementById('new-file');
const openBtn = document.getElementById('open');
const saveBtn = document.getElementById('save');
const saveAsBtn = document.getElementById('save-as');
const printBtn = document.getElementById('print');
const exitBtn = document.getElementById('exit');
const file_picker = document.getElementById('file_picker');
const editorArea = document.querySelector('.editor');
const loading_icon = document.getElementById('icon-container-box');
const editor_box = document.getElementById('editor-box');
const file_tree = document.getElementById('file-tree');
const tabs_container = document.getElementById('tabs'); 
const url = 'http://localhost:5241/';
var debug_tabs = false; 
var open_file = new Map();

var fileTree;
var lastCheck = performance.now();
var threshold = 100; // Time in ms considered as a "stuck" threshold


  


const editor = CodeMirror.fromTextArea(document.getElementById('editor-box'), {
 
    lineNumbers: true,       // Show line numbers
    mode: "javascript",      // Language mode (e.g., JavaScript)
    theme: "dracula",        // Syntax highlighting theme
    
});
//editor.setSize(1024,500); // Set the editor size to 700px by 500px



function openExplorer(obj)
{
    console.log("Explorer requested",obj);
    file_picker.style.display = 'block'; // Show the iframe
    //window.childNodes.postMessage(obj);
    postMessage(obj,'*');
}


// Function to show the iframe (File Picker)
openBtn.addEventListener('click',()=>openExplorer({mode:'open-any'}));

newFileBtn.addEventListener('click',()=>openExplorer({mode:'create-file'}) );

saveBtn.addEventListener('click',saveFileContent);

// To retrieve and use the data later


 
window.addEventListener('message', function(event) {
    try{
        const data = event.data;
      
        if (data.type === 'selection') 
        {      
        
            console.log("Received message",{data}); 
            fileTree = data.message;
            createFileTree(fileTree,file_tree); // Load the top-level items
            localStorage.setItem('current_tree', JSON.stringify(fileTree));
            file_picker.style.display = 'none';
 
 
        }if(data.type === 'cancel-op'){
            file_picker.style.display = 'none';

        }
    }catch(error)
    {
        console.log("There was an error please try again",error);
        alert(error);
    }
});


async function selectFile(event)
{
    const path = event.target.getAttribute('data-path');
    const id = event.target.getAttribute('data-id');
    document.querySelectorAll('#file-tree li').forEach((file)=>{
        fileOff(file.querySelector('a'));
    });
  

    fileOn(event.target);

    await fetchFileInfo(path,id);
}


function createFileTree(jsonData, parentElement) {
    
    jsonData.items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.classList.add('mb-1');
  
        // Create button for collapsible directories
        if (item.type === 'dir') {
            
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-toggle', 'd-inline-flex', 'align-items-center', 'rounded', 'border-0', 'collapsed');
            button.setAttribute('data-bs-toggle', 'collapse');
            button.setAttribute('data-bs-target', `#${item.name.replace(/\s+/g, '-')}-collapse`);
            button.setAttribute('aria-expanded', 'false');
            button.textContent = item.name;
  
            // Create collapsible container for subdirectories or files
            const collapseDiv = document.createElement('div');
            collapseDiv.classList.add('collapse');
            collapseDiv.setAttribute('id', `${item.name.replace(/\s+/g, '-')}-collapse`);
  
            const subList = document.createElement('ul');
            subList.classList.add('btn-toggle-nav', 'list-unstyled', 'fw-normal', 'pb-1', 'small');
  
            // Recursively add subitems
            createFileTree({ items: item.sub }, subList);
  
            collapseDiv.appendChild(subList);
            listItem.appendChild(button);
            listItem.appendChild(collapseDiv);
        }
  
        // Create list item for files
        if (item.type === 'file') {
            
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('data-path', item.path); // Add data-src attribute
            link.setAttribute('data-id', item.id); // Add data-src attribute

            //dblclick
            link.addEventListener('click',(event)=>selectFile(event));
            //link.classList.add('link-body-emphasis', 'd-inline-flex', 'text-decoration-none', 'rounded');
            link.classList.add('rounded', 'link-body-emphasis', 'text-decoration-none','btn');

            link.textContent = item.name;
            listItem.appendChild(link);
        }
  
        parentElement.appendChild(listItem);
    });
  }




/**
 * 
 * //btn-light btn-secondary btn-outline-secondary
    div.classList.add('btn','btn-ligth','active');
 */
const tabOn = (tag) => {
    if(debug_tabs)console.log("Tab on",tag); 
    tag.classList.remove('btn-ligth','active');
    tag.classList.add('btn-secondary','active');
};
const tabOff = (tag) => {
    if(debug_tabs)console.log("Tab Off",tag); 
    tag.classList.remove('btn-secondary','active');
    tag.classList.add('btn-ligth','active');
};

const fileOff = (tag) => {
    if(tag){tag.classList.remove('btn-ligth','active');}
}

const fileOn = (tag) =>{
    if(tag)tag.classList.add('btn-ligth','active');
}

 
function switchLoading()
{
  
    if(loading_icon.style.display === "none")
    {
        loading_icon.style.display = "block"; 
        return;
    }else{
        loading_icon.style.display = "none"; 
    }

}

 //@todo add that when the last one 
 //of the files is close or the current file si closed
 //that it click on the first file in the map of files
//var target;
async function closeTab(event)
{
  //  target = event.target; 
    event.stopPropagation(); // Prevent the event from bubbling up to the parent div

    const tab_id = event.target.parentElement.getAttribute('data-id');
    const tab_path = event.target.parentElement.getAttribute('data-path');
    const tabs_length = tabs_container.querySelectorAll('.tab').length; 

    const content_id = editor_box.getAttribute('data-id'); 

    console.log(["Closing tab",{"file":tab_path,"tab_id":tab_id,"content_id":content_id,"match":content_id===tab_id}]);
    open_file.delete(tab_id);
    event.target.parentElement.remove();
    if(tab_id === content_id)
    {
        console.log("Closing current tab");
        //editor_box.value = ''; 
        editor.setValue('');
        console.log("Tabs length",tabs_length);
        /*
            if tab is more than one since if is 1
            it means is the last one so no need to
            select the first tab
        */
        if(tabs_length > 1)
        {
            tabs_container.querySelector('.tab').click();
            swapFile(tabs_container.querySelector('.tab').getAttribute('data-id'));
        }
    }   
  
    /*
        because this is the last one right?????
        lets clear the input box right ???? 
    */
    if(tabs_length === 1) editor.setValue('');//editor_box.value = ''; 

    //console.log("File closed",[fileInfo.name,fileInfo.id]);

    //console.log("Closing tab",event.target.getAttribute('data-tab'));
    //console.log(event.target.parentElement.remove());//parentElement.remove();
}

 
 async function selectTab(event) 
{
    //console.log("Tab selected",event.target);
    //if(event.target.classList.contains('close-tab'))return;
    event.stopPropagation();

    const tab = event.target.nodeName === 'DIV'?
    event.target : event.target.parentElement;

    const files = document.querySelectorAll('#sidebar ul li');//document.querySelectorAll('#file-tree li'); 

    const tabs = document.querySelectorAll('.tab');
    const id = tab.getAttribute('data-id');
    const path = tab.getAttribute('data-path');
    
    tabs.forEach((tab)=>
    {
        tabOff(tab);
    });
    files.forEach((file)=>
    {
        try{
            const aTag = file.querySelector('a'); 
            const file_path = aTag.getAttribute('data-path');
            const file_id = aTag.getAttribute('data-id');
            fileOff(aTag);
            if(file_path === path){
                collapseToTarget(file_path,file_id);
            //console.log(file_path);
                //console.log("Selected file tab",file_path);
                //aTag.focus();
                //aTag.parentElement.classList.add('collapsed')
                fileOn(aTag);
            }
        }catch(error)
        {
            console.log({Message:"Select tab item loop failed",Error:error});
        }
    });
  
    
    //console.log("Target",tab);
    tabOn(tab); 
    //console.log("Hit",event.target.parentElement);
    //event.target.parentElement.classList.add('active');
    await fetchFileInfo(path,id); 
}//

function hasChanged(){

}
function swapCloseTabIcon(tag)
{
    //console.log(event.target.classList.has('fa-times'));
    //return;
    const state = tag.parentElement.getAttribute('data-changed') === 'true';
    //console.log("State",state);
    if(tag.classList.contains('fa-circle') && state)
    {
        tag.classList.remove('fa-circle');
        tag.classList.add('fa-times');
        return;
    }if(state){
        tag.classList.remove('fa-times');
        tag.classList.add('fa-circle');
    } 
    //fa-circle
    //fa-times
}
async function createTab(fileInfo) {
    const tabs = document.querySelectorAll('.tab');
    const div = document.createElement('div');
    const label = document.createElement('label');
    const span = document.createElement('i');
     
    div.classList.add('tab');
    div.setAttribute('data-id', fileInfo.id);
    div.setAttribute('data-path', fileInfo.path);
    div.setAttribute('data-changed',false);

    //btn-light btn-secondary btn-outline-secondary
    div.classList.add('btn','btn-ligth','active');
    label.textContent = fileInfo.name;
    span.classList.add('close-tab','fa','fa-times');
    //span.textContent = 'X';
    //<i class="fa fa-times" aria-hidden="true"></i>


    span.addEventListener('click',(event)=>closeTab(event));
    span.addEventListener('mouseover',(event)=>swapCloseTabIcon(event.target));
    span.addEventListener('mouseout',(event)=>swapCloseTabIcon(event.target));

    div.addEventListener('click',async (event)=>selectTab(event));
    //div.addEventListener('touches',async (event)=>selectTab(event));
      
    div.appendChild(label);
    div.appendChild(span);

    // Ensure `open_file` is defined
    
    if (!tabs_container) {
        console.error('open_file container not found!');
        return;
    }

    tabs_container.appendChild(div);
    tabs_container.addEventListener('click',(event)=>{
        console.log(event.target);
    });
    tabs_container.querySelectorAll('.tab').forEach((tab)=>{
        const tab_path = tab.getAttribute('data-path');
        tabOff(tab);
        if(tab_path === fileInfo.path) tabOn(tab);
       
    });
    
}


async function swapFile(id) 
{
    const content_id = editor_box.getAttribute('data-id');
    if(content_id === id)return;
    const temp = open_file.get(id);

    if (!temp) {
        console.error(`File with ID ${id} not found in open_file map.`);
        return;
    }

    console.log(`Swapping file`);

    // Update the editor UI
    document.title = temp.name; 
    //editor_box.value = temp.content;
    editor.setValue(temp.content);
    editor_box.setAttribute('data-id', temp.id); // Ensure the editor reflects the correct file ID
    editor_box.setAttribute('data-path', temp.path);

}

function getBufferSize(text) {
    let fileSize = null;
    const length = text.length; // Length of the text

    if ((length / 1024 / 1024 / 1024) >= 1) {
        fileSize = `${(length / 1024 / 1024 / 1024).toFixed(2)}GB`;
        return fileSize;
    }

    if ((length / 1024 / 1024) >= 1) {
        fileSize = `${(length / 1024 / 1024).toFixed(2)}MB`;
        return fileSize;
    }
    
    if ((length / 1024) >= 1) {
        fileSize = `${(length / 1024).toFixed(2)}KB`;
        return fileSize;
    }

    fileSize = `${length}B`;
    return fileSize;
}


  function hashText(text)
  {
    let hash = 0;
    let e = new TextEncoder();
    let buffer = e.encode(text);
    for(let ch = 0; ch < buffer.length; ch++)
    {
        hash += (buffer[ch] * 2); 
    }
    return hash;
  }
  async function fetchFileInfo(file,id)
  {  
    
        if( file === null || 
            id === null || 
            file === undefined || 
            id === undefined) return;
        
      
        if(open_file.has(id))
        {
            await swapFile(id);
            return;
        }
        try{
        console.log("Fetching file info",["file",file],["id",id]);

   
        switchLoading();

        
        var response = await fetch(`${url}get/file`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'path': file //`${initial_path}/${file}`
            }
        });
        
        // Parse the response as JSON
        if (response.ok) {
            const json = await response.json();
            console.log("File data received: ",json);
              // Create a new file info object
              const newFileInfo = {
                name: json.fileName,
                content: json.content,
                hash: hashText(json.content),
                change:[],
                length: json.length,
                size: json.size,
                path: file,
                id: id,
            };

           // editor_box.value = newFileInfo.content;
           editor.setValue(newFileInfo.content);
            document.title = newFileInfo.name; 
            editor_box.setAttribute('data-path', newFileInfo.path);
            editor_box.setAttribute('data-id', newFileInfo.id);

            open_file.set(newFileInfo.id, newFileInfo);
            //current_file = fileInfo; 
            await createTab(newFileInfo);

        return;
            //document.write(JSON.stringify(data)); // Write the JSON data to the document
        }
    }catch(error){
        console.log(error);
    }finally{
        switchLoading();

    }
  }


  
  async function saveFileContent()
  {
        
    const path = editor_box.getAttribute('data-path');
    const content_id = editor_box.getAttribute('data-id');

    const file = document.title; 
    switchLoading();
    // 3. Send the JSON in a POST request
    await fetch(`${url}save/file`, {
        method: 'POST', // HTTP method
        headers: 
        {
        'Content-Type': 'application/json',
        'path': path
        },
        body: editor.getValue() // The actual data we're sending
    })
        .then(response => response.json())  // Assuming the server responds with JSON
        .then(data => {
            console.log('Response:', data); // Handle the response
            const file = open_file.get(content_id);
            file.content = editor.getValue(); //editor_box.value;
            open_file.set(content_id,file);
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach((tab)=>{
                const tab_id = tab.getAttribute('data-id');
                const iTag = tab.querySelector('i');
                if(tab_id === content_id){
                    iTag.classList.remove('fa-circle');
                    iTag.classList.add('fa-times');
                    tab.setAttribute('data-changed',false);
                }
            });
            
        })
        .catch(error => {
        console.error('Error:', error); // Handle any errors
        }).finally
        {
            switchLoading();
        };
  
  }

  function disableDefaultShortcuts() {
    document.addEventListener('keydown', async (event) => {
      // Disable Ctrl+S (Save)
      
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        await saveFileContent();
        //saveFileContent()
       // console.log('Ctrl+S has been disabled.');
      }
  
      // Custom behavior for the Tab key
      if (event.key === 'Tab') {
        // Check if the active element is editable
        const activeElement = document.activeElement;
        const isEditable = 
          activeElement.tagName === 'TEXTAREA' || 
          (activeElement.tagName === 'INPUT' && activeElement.type === 'text') || 
          activeElement.isContentEditable;
  
        if (isEditable) {
          event.preventDefault();
  
          // Append three spaces where the cursor is
          const value = activeElement.value || ''; // For inputs or textareas
          const selectionStart = activeElement.selectionStart;
          const selectionEnd = activeElement.selectionEnd;
  
          // Insert three spaces at the cursor position
          const newValue = 
            value.substring(0, selectionStart) + 
            '   ' + 
            value.substring(selectionEnd);
  
          activeElement.value = newValue;
          
          // Move the cursor after the inserted spaces
          activeElement.selectionStart = activeElement.selectionEnd = selectionStart + 3;
        }
  
        console.log('Tab key has been customized.');
      }
    });
  }
  
  // Call the function to apply the behavior
function loadLastTree()
{
    try{
        const json = localStorage.getItem('current_tree');
        const retrievedJson = JSON.parse(json);
        if(retrievedJson !== null)
        {
            fileTree = retrievedJson;
            createFileTree(fileTree,file_tree);
        }
    }catch(error){
        console.log({Message:"Load last tree error maybe because it was too big",Error:error});
    }
}


function collapseToTarget(dataSrc, dataId) {
    // Select the target element based on data-src or data-id
    const targetElement = document.querySelector(`[data-src="${dataSrc}"], [data-id="${dataId}"]`);
    if (!targetElement) {
        console.error('Element with specified data-src or data-id not found.');
        return;
    }

    // Traverse up the DOM and expand all collapsible parents
    let parent = targetElement.parentElement;
    while (parent) {
        const collapseButton = parent.querySelector('[data-bs-toggle="collapse"]');
        if (collapseButton) {
            // Escape special characters in the selector
            const collapseTargetSelector = collapseButton.getAttribute('data-bs-target');
            const collapseTarget = document.querySelector(CSS.escape(collapseTargetSelector));
            if (collapseTarget && collapseTarget.classList.contains('collapse')) {
                collapseTarget.classList.add('show'); // Expand the collapsible element
            }
        }
        parent = parent.parentElement;
    }

    // Scroll the target element into view
    targetElement.scrollIntoView({
        behavior: 'smooth', // Adds a smooth scrolling effect
        block: 'center'     // Aligns the element to the center of the viewport
    });
}

  


function monitorUI() {
    const now = performance.now();
    const timeElapsed = now - lastCheck;

    if (timeElapsed > threshold) {
        console.warn('UI is lagging! Time elapsed:', timeElapsed, 'ms');
        handleUILag(timeElapsed);
    }

    lastCheck = now;

    // Schedule the next check
    requestAnimationFrame(monitorUI);
}

function handleUILag(delay) {
    // Trigger your function to handle the lag
    console.log(`Detected lag of ${delay}ms. Taking action...`);
    // Example: Alert the user or reduce input processing
}

document.addEventListener('input',async(event)=>
{

    if(event.target.nodeName === 'TEXTAREA')
    {
        const content_id = editor_box.getAttribute('data-id');
        const tabs = document.querySelectorAll('.tab');
        //console.log(event.target.nodeName);

        tabs.forEach((tab)=>{
            const tab_id = tab.getAttribute('data-id'); 
            const iTag = tab.querySelector('i');
            //console.log({tab_id:tab_id,content_id:content_id});
            if(tab_id===content_id)
                {
                    console.log("Swapping closing state");
                    iTag.classList.remove('fa-times');
                    iTag.classList.add('fa-circle');
                    tab.setAttribute('data-changed',true);
                }

        });
    }

});

// Start monitoring the UI


// Example usage
//collapseToTargetAndFocus('bin/test_script.js', '12644959');

  function Startup()
  {
    disableDefaultShortcuts();
    loadLastTree();
    //monitorUI();
  }
  
  Startup();