import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Form } from 'react-bootstrap';

export default function ToolsStrip() {
  return (
    <Navbar expand="md" bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Toggle aria-controls="tools-strip-nav" />
        <Navbar.Collapse id="tools-strip-nav">
          <Nav className="me-auto">
            <NavDropdown title="File" id="file-dropdown">
              <NavDropdown.Item href="#" id="new-file">New</NavDropdown.Item>
              <NavDropdown.Item href="#" id="open">Open</NavDropdown.Item>
              <NavDropdown.Item href="#" id="save">Save</NavDropdown.Item>
              <NavDropdown.Item href="#" id="save-as">Save As</NavDropdown.Item>
              <NavDropdown.Item href="#" id="print">Print</NavDropdown.Item>
              <NavDropdown.Item href="#" id="exit">Exit</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Edit" id="edit-dropdown">
              <NavDropdown.Item href="#">Undo</NavDropdown.Item>
              <NavDropdown.Item href="#">Cut</NavDropdown.Item>
              <NavDropdown.Item href="#">Copy</NavDropdown.Item>
              <NavDropdown.Item href="#">Delete</NavDropdown.Item>
              <NavDropdown.Item href="#">Find</NavDropdown.Item>
              <NavDropdown.Item href="#">Time / Date</NavDropdown.Item>
              <NavDropdown.Item href="#">Font</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="View" id="view-dropdown">
              <NavDropdown.Item href="#">Zoom in</NavDropdown.Item>
              <NavDropdown.Item href="#">Zoom Out</NavDropdown.Item>
              <NavDropdown.Item href="#">Zoom Reset</NavDropdown.Item>
              <NavDropdown.Item href="#">
                Status Bar
                <Form.Check type="switch" checked className="d-inline-block ms-2" />
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}