import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header';
import Footer from './Footer';

const AboutPage = () => {
  return (
    <>
    <Header/>
    <div style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
      <Container>
        {/* Page Header */}
        <Row className="text-center mb-5">
          <Col>
            <h1 className="display-4 font-weight-bold">About Just Rent It</h1>
            <p className="lead text-muted">
              Your one-stop platform to rent or lend any product you need, at your convenience.
            </p>
          </Col>
        </Row>

        {/* About Us Section */}
        <Row className="align-items-center mb-5">
          <Col md={6}>
            <h2 className="font-weight-bold mb-4">Who We Are</h2>
            <p>
              At <strong>Just Rent It</strong>, we are revolutionizing the way people access and offer rental products. 
              Whether you're looking to rent something for a short-term need or share your own products with others, we provide a platform that makes it easy to connect, share, and benefit.
            </p>
            <p>
              Our goal is to help you find what you need, when you need it, without the long-term commitment of ownership. We focus on creating a trusted, seamless experience for renters and lenders alike.
            </p>
          </Col>
          <Col md={6}>
            <Image
              src="images/about-image.jpg"
              alt="About Us"
              height="300px"
              width="500px"
              fluid
              className="rounded shadow-lg overflow-hidden bg-cover" 
            />
          </Col>
        </Row>

        {/* Our Services */}
        <Row className="text-center mb-5">
          <Col>
            <h2 className="font-weight-bold mb-4">What We Do</h2>
            <p className="lead text-muted">
              Rent any product, or list your own. Here's how we help you:
            </p>
          </Col>
        </Row>
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <div className="p-4 bg-white shadow-lg rounded">
              <h4 className="font-weight-bold mb-3">Rent Products</h4>
              <p>Browse through a wide selection of products available for rent. Find the perfect item for your needs, from electronics to home appliances.</p>
              <Button variant="primary" href="/rent-products">Explore Now</Button>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="p-4 bg-white shadow-lg rounded">
              <h4 className="font-weight-bold mb-3">List Your Products</h4>
              <p>If you have products you'd like to rent out, we make it easy to list them for others to find. Start earning today!</p>
              <Button variant="success" href="/list-product">List Your Product</Button>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="p-4 bg-white shadow-lg rounded">
              <h4 className="font-weight-bold mb-3">Trusted Community</h4>
              <p>Our platform is built on trust and transparency. Renters and lenders can review each other to ensure a safe experience for everyone.</p>
              <Button variant="info" href="/about">Learn More</Button>
            </div>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="text-center">
          <Col>
            <h2 className="font-weight-bold mb-4">Get Started Today</h2>
            <p className="lead text-muted">
              Join the <strong>Just Rent It</strong> community and start renting or lending with ease. It's free to sign up and start exploring!
            </p>
            <Button variant="primary" href="/register">Sign Up Now</Button>
          </Col>
        </Row>
      </Container>
    </div>
    <Footer/>
    </>
  );
};

export default AboutPage;
