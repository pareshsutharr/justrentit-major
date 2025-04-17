import React from 'react';
import { Modal, ListGroup, Button } from 'react-bootstrap';

const SearchModal = ({ show, onHide, products, categories }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Search Results</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Categories:</h5>
        <ListGroup>
          {categories.map((category) => (
            <ListGroup.Item key={category._id}>
              {category.name}
            </ListGroup.Item>
          ))}
        </ListGroup>
        <h5>Products:</h5>
        <ListGroup>
          {products.map((product) => (
            <ListGroup.Item key={product._id}>
              {product.name} - {product.description}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SearchModal;
