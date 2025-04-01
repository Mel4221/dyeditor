import React, { useState } from 'react';
import { Nav, Tab, Button } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import './EditorBox.css';

export default function FileTabs() {
  const [activeTab, setActiveTab] = useState<string|any>('home');
  const [tabs, setTabs] = useState([
    { id: 'home', title: 'index.html', unsaved: false },
    { id: 'profile', title: 'styles.css', unsaved: true },
    { id: 'contact', title: 'app.js', unsaved: false },
  ]);

  const closeTab = (id: any, e: any) => {
    e.stopPropagation();
    setTabs(tabs.filter(tab => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  return (
    <div className="tabs-container bg-dark p-0" id="tabs">
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="flex-nowrap tabs-scrollable" style={{ 
          borderBottom: '1px solid #495057',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          flexWrap: 'nowrap'
        }}>
          {tabs.map(tab => (
            <Nav.Item key={tab.id} className="position-relative">
              <Nav.Link
                eventKey={tab.id}
                className={`d-flex align-items-center ps-3 pe-1 py-2 text-white ${activeTab === tab.id ? 'bg-secondary' : 'bg-dark'}`}
                style={{
                  borderRight: '1px solid #495057',
                  userSelect: 'none',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <span className={tab.unsaved ? 'text-warning' : ''} style={{ 
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tab.title}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-2 text-white-50 hover-bg"
                  onClick={(e) => closeTab(tab.id, e)}
                  style={{ minWidth: '20px' }}
                >
                  <X size={14} />
                </Button>
              </Nav.Link>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: activeTab === tab.id ? 'darkgray' : 'transparent'
              }} />
            </Nav.Item>
          ))}
        </Nav>
        
        <div className="tab-content bg-dark" style={{ height: 'calc(100% - 41px)' }}>
          {tabs.map(tab => (
            <Tab.Pane 
              key={tab.id} 
              eventKey={tab.id} 
              className="h-100"
              style={{ backgroundColor: '#343a40' }}  // Slightly lighter than bg-dark
            >
              {/* Your tab content here */}
            </Tab.Pane>
          ))}
        </div>
      </Tab.Container>
    </div>
  );
}