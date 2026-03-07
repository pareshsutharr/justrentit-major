import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer mt-auto">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <h5>About Just Rent It</h5>
            <p>
              Just Rent It is your one-stop platform to rent and lease products easily and efficiently. Whether you need equipment, furniture, or gadgets, we’ve got you covered!
            </p>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <NavLink to="/products" className="footer-link">Rent Products</NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="footer-link">List a Product</NavLink>
              </li>
              <li>
                <NavLink to="/register" className="footer-link">Get Started</NavLink>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <p><strong>Email:</strong> support@justrentit.com</p>
            <p><strong>Phone:</strong> +91 0000000000</p>
            <h5>Follow Us</h5>
            <div className="d-flex gap-3">
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaInstagram size={24} />
              </a>
              <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={6} className="mx-auto">
            <h5>Subscribe to Our Newsletter</h5>
            <Form className="d-flex">
              <Form.Control type="email" placeholder="Enter your email" className="me-2 newsletter-input" />
              <Button className="newsletter-btn">Subscribe</Button>
            </Form>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col className="text-center">
            <small className="footer-copy">
              &copy; {new Date().getFullYear()} Just Rent It. All rights reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
