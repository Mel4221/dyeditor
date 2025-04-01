import React from 'react';
import FooterBar from './FooterBar';
import FileTabs from'./FileTabs';
import Container from 'react-bootstrap/Container'

export default function EditorBox()
{
    return (
    <>
        <Container id="editor-container"
        style={{width:'79vw'}}>
            <FileTabs/>
            <div style={{display:'none'}} id="icon-container-box">

                <div style={{
                    position:'absolute',
                    left:'50%',
                    top:'50%'
                }}
                className="spinner-border text-secondary" 
                role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
      
            <textarea id="editor-box" className="vscode-textbox" placeholder="Open a file or type something..."></textarea>
            <FooterBar/>
      </Container>   
    
    </>
    )
}