// Example common component
import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo from '../assets/logo.png'
function PrivateNavbar() {
    return (
        <body>
        <div className="header">
            <img className="logo" src={Logo} alt="logo" />
            <h1>DENTAL CLINIC</h1>
        </div>
        <Navbar id="navbar" expand="lg">
            <Container id="me-auto">
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="justify-content-end">
<<<<<<< HEAD
                        <Nav.Link href="#home" >Schedule</Nav.Link>
                        <Nav.Link href="#lik">Your information</Nav.Link>
                        <Nav.Link href="#link">Opening hours</Nav.Link>
                        <Nav.Link href="#link">Add a dentist</Nav.Link>
                        <Nav.Link href="#link">Log out</Nav.Link>
=======
                        <Link href="/appointments" >Schedule</Link>
                        <Link href="/">Your information</Link>
                        <Link href="/">Opening hours</Link>
                        <Link href="/">Add a dentist</Link>
                        <Link href="/">Log out</Link>
>>>>>>> origin/ClinicHomePage
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>


        </body>

    );
}

export default PrivateNavbar;