import React, { useState } from "react";
import { Card, Button, Row, Col, Form } from "react-bootstrap";
import Select from "react-select";

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  in_transit: "info",
  delivered: "primary",
  in_use: "secondary",
  return_in_transit: "info",
  returned: "success",
  completed: "dark",
};
const FilterComponent = ({ filters, onFilterChange, onResetFilters }) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Card className="mb-4 d-flex shadow-lg border-1" style={{borderRadius:'25px'}}>
      <Card.Body className="mb-0 justify-content-between align-items-center p-4">
        <Row className="g-4 ">
            <Row className="g-1" style={{borderRadius:'20px',marginRight:'0px'}}>
          <Col md={9} >
            <Form.Group controlId="productName" >
              <Form.Control
style={{borderRadius:'15px',marginTop:'10px' , padding:'10px'}}
                type="text"
                placeholder="Search products..."
                name="productName"
                value={filters.productName}
                onChange={onFilterChange}
              />
            </Form.Group>
          </Col>

          {/* More Filters Toggle Button */}
          <Col md={2} className="d-flex align-items-end " style={{padding:'auto',width:'20%'}}>
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "More Filters"}
            </Button>
          </Col>
          </Row>

          {/* Additional Filters (Hidden Initially) */}
          {showFilters && (
            <>
              <Col md={3}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Select
                    isMulti
                    name="selectedStatuses"
                    options={Object.keys(statusColors).map((status) => ({
                      value: status,
                      label: status.replace(/_/g, " "),
                    }))}
                    value={filters.selectedStatuses.map((status) => ({
                      value: status,
                      label: status.replace(/_/g, " "),
                    }))}
                    onChange={(selectedOptions) =>
                      onFilterChange({
                        target: {
                          name: "selectedStatuses",
                          value: selectedOptions
                            ? selectedOptions.map((option) => option.value)
                            : [],
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="startDate">
                  <Form.Label>Start Date After</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={onFilterChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="endDate">
                  <Form.Label>End Date Before</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={onFilterChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="minPrice">
                  <Form.Label>Min Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Min price"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={onFilterChange}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="maxPrice">
                  <Form.Label>Max Price</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Max price"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={onFilterChange}
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mt-4 d-flex justify-content-end">
                <Button variant="danger" className="me-2" onClick={onResetFilters}>
                  Reset Filters
                </Button>
                <Button variant="primary">Apply Filters</Button>
              </Col>
            </>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FilterComponent;
