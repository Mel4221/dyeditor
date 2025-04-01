function createFileTree(jsonData, parentElement) {
    jsonData.items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.classList.add('mb-1');
  
      // Create button for collapsible directories
      if (item.Type === 'dir') {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-toggle', 'd-inline-flex', 'align-items-center', 'rounded', 'border-0', 'collapsed');
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', `#${item.Name}-collapse`);
        button.setAttribute('aria-expanded', 'false');
        button.textContent = item.Name;
  
        // Create collapsible container for subdirectories or files
        const collapseDiv = document.createElement('div');
        collapseDiv.classList.add('collapse');
        collapseDiv.setAttribute('id', `${item.Name}-collapse`);
  
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
  
  // Example usage:
  const jsonData = {
    "items": [
      {
        "Type": "dir",
        "Name": "root",
        "Sub": [
          {
            "Type": "dir",
            "Name": "1",
            "Sub": [
              {
                "Type": "dir",
                "Name": "2",
                "Sub": [
                  {
                    "Type": "dir",
                    "Name": "3",
                    "Sub": [
                      {
                        "Type": "dir",
                        "Name": "4",
                        "Sub": [
                          {
                            "Type": "file",
                            "Name": "deep_file.txt",
                            "Sub": []
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "Type": "file",
                    "Name": "not-that-deep-file.txt",
                    "Sub": []
                  }
                ]
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
    ]
  };
  
  // Call the function to render the tree in the sidebar
  createFileTree(jsonData, document.getElementById('file-tree'));
  