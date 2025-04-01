function createFileTree(jsonData, parentElement) {
  jsonData.items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.classList.add('mb-1');

      // Create button for collapsible directories
      if (item.Type === 'dir') {
          const button = document.createElement('button');
          button.classList.add('btn', 'btn-toggle', 'd-inline-flex', 'align-items-center', 'rounded', 'border-0', 'collapsed');
          button.setAttribute('data-bs-toggle', 'collapse');
          button.setAttribute('data-bs-target', `#${item.Name.replace(/\s+/g, '-')}-collapse`);
          button.setAttribute('aria-expanded', 'false');
          button.textContent = item.Name;

          // Create collapsible container for subdirectories or files
          const collapseDiv = document.createElement('div');
          collapseDiv.classList.add('collapse');
          collapseDiv.setAttribute('id', `${item.Name.replace(/\s+/g, '-')}-collapse`);

          const subList = document.createElement('ul');
          subList.classList.add('btn-toggle-nav', 'list-unstyled', 'fw-normal', 'pb-1', 'small');

          // Recursively add subitems
          createFileTree({ items: item.Sub }, subList);

          collapseDiv.appendChild(subList);
          listItem.appendChild(button);
          listItem.appendChild(collapseDiv);
      }

      // Create list item for files
      if (item.Type === 'file') {
          const link = document.createElement('a');
          link.href = '#';
          link.classList.add('link-body-emphasis', 'd-inline-flex', 'text-decoration-none', 'rounded');
          link.textContent = item.Name;
          listItem.appendChild(link);
      }

      parentElement.appendChild(listItem);
  });
}

// Example usage with the new JSON structure
const jsonData = {
  "root-path": "C:/Users/Melquiceded/Documents/Beta/QNoteManager",
  "items": [
      {
          "Name": "bin",
          "Type": "dir",
          "Sub": [
              {
                  "Type": "dir",
                  "Name": "Debug",
                  "Sub": [
                      {
                          "Type": "dir",
                          "Name": "net6.0",
                          "Sub": [
                              { "Type": "file", "Name": "appsettings.Development.json", "Sub": [] },
                              { "Type": "file", "Name": "appsettings.json", "Sub": [] },
                              { "Type": "file", "Name": "Newtonsoft.Json.dll", "Sub": [] },
                              { "Type": "file", "Name": "QNoteManager.deps.json", "Sub": [] },
                              { "Type": "file", "Name": "QNoteManager.dll", "Sub": [] },
                              { "Type": "file", "Name": "QNoteManager.exe", "Sub": [] },
                              { "Type": "file", "Name": "QNoteManager.pdb", "Sub": [] },
                              { "Type": "file", "Name": "QNoteManager.runtimeconfig.json", "Sub": [] },
                              { "Type": "file", "Name": "QuickTools.dll", "Sub": [] },
                              { "Type": "file", "Name": "QuickTools.xml", "Sub": [] }
                          ]
                      }
                  ]
              }
          ]
      }
  ]
};

// Call the function to render the tree in the sidebar
createFileTree(jsonData, document.getElementById('file-tree'));
