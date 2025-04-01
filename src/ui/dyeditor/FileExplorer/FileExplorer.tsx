import React, { useState } from 'react';
import { Nav, Collapse, ListGroup } from 'react-bootstrap';
import { ChevronRight, ChevronDown, Folder, Folder2Open, FileEarmark } from 'react-bootstrap-icons';
import './FileExplorer.css';
export default function FileExplorer() {
  const [openFolders, setOpenFolders] = useState({
    src: true,
    components: false,
    public: false
  });

  const toggleFolder = (folder:any) => {
    setOpenFolders(prev => ({
      ...prev,
      // @ts-ignore
      [folder]: !prev[folder]
    }));
  };

  return (
    <div id="sidebar" className="bg-dark text-white d-flex flex-column" style={{ 
      width: '250px', 
     
      overflow: 'hidden'
    }}>
      <Nav.Item className="border-bottom border-secondary pb-3 mb-3 px-3">
        <span className="fs-5 fw-semibold text-white">Explorer</span>
      </Nav.Item>
      
      <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
        <Nav className="flex-column px-2">
          {/* Example folder structure */}
          <div className="folder-item">
            <Nav.Link 
              onClick={() => toggleFolder('src')} 
              className="d-flex align-items-center p-1 text-white hover-bg"
            >
              {openFolders.src ? <ChevronDown className="me-1" /> : <ChevronRight className="me-1" />}
              {openFolders.src ? <Folder2Open className="me-2" /> : <Folder className="me-2" />}
              <span>src</span>
            </Nav.Link>
            <Collapse in={openFolders.src}>
              <div className="ms-4">
                <Nav.Link className="d-flex align-items-center p-1 text-white hover-bg">
                  <FileEarmark className="me-2" />
                  <span>App.js</span>
                </Nav.Link>
                <Nav.Link className="d-flex align-items-center p-1 text-white hover-bg">
                  <FileEarmark className="me-2" />
                  <span>index.js</span>
                </Nav.Link>
              </div>
            </Collapse>
          </div>

          <div className="folder-item">
            <Nav.Link 
              onClick={() => toggleFolder('components')} 
              className="d-flex align-items-center p-1 text-white hover-bg"
            >
              {openFolders.components ? <ChevronDown className="me-1" /> : <ChevronRight className="me-1" />}
              {openFolders.components ? <Folder2Open className="me-2" /> : <Folder className="me-2" />}
              <span>components</span>
            </Nav.Link>
            <Collapse in={openFolders.components}>
              <div className="ms-4">
                <Nav.Link className="d-flex align-items-center p-1 text-white hover-bg">
                  <FileEarmark className="me-2" />
                  <span>FileExplorer.js</span>
                </Nav.Link>
              </div>
            </Collapse>
          </div>
        </Nav>
      </div>
    </div>
  );
}
 