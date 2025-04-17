import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Table, Form, Badge } from 'react-bootstrap';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RentalManagement = () => {
  const [rentalRequests, setRentalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sort: 'newest'
  });

  const statusColors = {
    pending: 'warning',
    approved: 'primary',
    rejected: 'danger',
    in_transit: 'info',
    delivered: 'success',
    returned: 'dark',
    completed: 'success'
  };

  useEffect(() => {
    fetchRentalRequests();
  }, [filters]);

  const fetchRentalRequests = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/rentals`, {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRentalRequests(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch rental requests');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
      `${baseUrl}/api/admin/rentals/${selectedRequest._id}/status`,
        { status: currentStatus, message: statusMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Status updated successfully');
      fetchRentalRequests();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setCurrentStatus(request.status);
    setShowModal(true);
  };

  return (
    <div className="container-fluid p-4">
      <ToastContainer />
      <h2 className="mb-4">Rental Management</h2>
      
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3">
          <Form.Select 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
            style={{ width: '200px' }}
          >
            <option value="all">All Statuses</option>
            {Object.keys(statusColors).map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </Form.Select>

          <Form.Select 
            name="sort" 
            value={filters.sort}
            onChange={handleFilterChange}
            style={{ width: '200px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </Form.Select>
        </div>

        <Form.Control
          type="text"
          placeholder="Search requests..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          style={{ width: '300px' }}
        />
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product</th>
              <th>Requester</th>
              <th>Owner</th>
              <th>Dates</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rentalRequests.map(request => (
              <tr key={request._id}>
                <td>{request.product?.name}</td>
                <td>{request.requester?.name}</td>
                <td>{request.owner?.name}</td>
                <td>
                  {new Date(request.startDate).toLocaleDateString()} -{' '}
                  {new Date(request.endDate).toLocaleDateString()}
                </td>
                <td>
                  <Badge bg={statusColors[request.status]}>
                    {request.status}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    onClick={() => openDetailsModal(request)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Rental Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <h5>Product Information</h5>
                  <p>Name: {selectedRequest.product?.name}</p>
                  <p>Rental Price: {selectedRequest.product?.rentalPrice}</p>
                </div>
                <div className="col-md-6">
                  <h5>Duration</h5>
                  <p>Start: {new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Update Status</Form.Label>
                <Form.Select 
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  {Object.keys(statusColors).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status Message (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                />
              </Form.Group>

              <div className="mt-4">
                <h5>Status History</h5>
                <ul className="list-group">
                  {selectedRequest.currentStatus?.map((status, index) => (
                    <li key={index} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span>{new Date(status.timestamp).toLocaleString()}</span>
                        <Badge bg={statusColors[status.stage]}>{status.stage}</Badge>
                      </div>
                      {status.description && <p className="mt-1">{status.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RentalManagement;