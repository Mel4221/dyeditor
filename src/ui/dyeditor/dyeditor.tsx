import React from 'react';
//import '../bootstrap/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import  Breadcrumb  from 'react-bootstrap/Breadcrumb';
import  BreadcrumbItem  from 'react-bootstrap/BreadcrumbItem';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import  Container  from 'react-bootstrap/Container';
import  Row  from 'react-bootstrap/Row';
import  Col  from 'react-bootstrap/Col';
import  Nav  from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Label from 'react-bootstrap/FormLabel';
import ToolsStrip from './ToolsStrip/ToolsStrip';
import LeftResizer from './LeftResizer/LeftResizer';
import EditorBox from './EditorBox/EditorBox';
import FileExplorer from './FileExplorer/FileExplorer';
function DyEditor() {
    {/*style={{ 
            height: '100vh', 
            background: 'black',
            display: 'flex',
            flexDirection: 'column'
        }} classNameName="text-white w-100" 
        h-100 d-flex flex-column 
        fluid className=""
        */
    }
    return (
        <Container 
        style={{
            width:'100vw',
            height:'100vh'
        }}
        className='bg-dark'
        fluid>
            <Row>
                <Col>
                    <ToolsStrip/>
                </Col>
            </Row>
            <Row>
                <Col xs={2}>
                    <FileExplorer/>
                </Col>
                <Col xs={1} style={{
                    width:'5px'
                }}>
                    <LeftResizer/>
                </Col>
                <Col xs={6}>
                    <EditorBox/>
                </Col>
            </Row>
            
        </Container>
       
    );
}

export default DyEditor;
