import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import './EditorBox.css'
export default function FileTabs() {
  const [activeTab, setActiveTab] = useState<string|any>('home');
  const [tabs, setTabs] = useState([
    { id: 'home', title: 'index.html', unsaved: false, path: '/path/to/index.html' },
    { id: 'profile', title: 'styles.css', unsaved: true, path: '/path/to/styles.css' },
    { id: 'contact', title: 'app.js', unsaved: false, path: '/path/to/app.js' },
    { id: 'utils', title: 'utils.ts', unsaved: true, path: '/src/utils/utils.ts' },
    { id: 'config', title: 'config.json', unsaved: false, path: '/config/config.json' },
    { id: 'component', title: 'Button.tsx', unsaved: true, path: '/src/components/Button.tsx' },
    { id: 'hooks', title: 'useFetch.ts', unsaved: false, path: '/src/hooks/useFetch.ts' },
    { id: 'assets', title: 'constants.ts', unsaved: true, path: '/src/assets/constants.ts' },
    { id: 'tests', title: 'App.test.js', unsaved: false, path: '/tests/App.test.js' },
    { id: 'readme', title: 'README.md', unsaved: true, path: '/docs/README.md' }
  ]);

  const closeTab = (id: any, e: any) => {
    e.stopPropagation();
    setTabs(tabs.filter(tab => tab.id !== id));
    if (activeTab === id) {
      setActiveTab(tabs.length > 1 ? tabs[0].id : null);
    }
  };

  return (
    <div className="tabs-container d-flex bg-dark p-2"  id="tabs">

      <div className="d-flex flex-nowrap overflow-auto bk-dark tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab btn ${activeTab === tab.id ? 'btn-secondary active' : 'btn-dark'}`}
            data-id={tab.id}
            data-path={tab.path}
            data-changed={tab.unsaved}
            onClick={() => setActiveTab(tab.id)}
            style={{
              borderRadius: 0,
              borderRight: '1px solid #495057',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              padding: '0.375rem 0.75rem'
            }}
          >
            <label className="mb-0 me-2" style={{ 
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: tab.unsaved ? 'var(--bs-warning)' : 'inherit'
            }}>
              {tab.title}
            </label>
            <Button
              variant="secondary"
              size="sm"
              className="p-0 border-solid"
              onClick={(e) => closeTab(tab.id, e)}
              style={{ 
                color: 'inherit',
                minWidth: '20px',
                lineHeight: 1
              }}
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>

       
    </div>
  );
}