import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { MdOutlineMail, MdOutlineLocalPhone, MdOutlinePlace, MdEdit, MdCameraAlt } from "react-icons/md";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const UserProfiles = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    profilePhoto: null
  });
  const [validation, setValidation] = useState({
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`${baseUrl}/getUserProfile`, {
          params: { userId: storedUser._id }
        });
        
        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setFormData({
            address: userData.address || '',
            phone: userData.phone || '',
            profilePhoto: null
          });
        }
      } catch (error) {
        toast.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'phone':
        if (!/^\d{10}$/.test(value)) error = 'Phone must be 10 digits';
        break;
      case 'address':
        if (value.trim().length < 5) error = 'Address must be at least 5 characters';
        break;
    }
    setValidation(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isPhoneValid = validateField('phone', formData.phone);
    const isAddressValid = validateField('address', formData.address);

    if (!isPhoneValid || !isAddressValid) return;

    const data = new FormData();
    data.append('userId', user._id);
    data.append('address', formData.address);
    data.append('phone', formData.phone);
    if (formData.profilePhoto) {
      data.append('profilePhoto', formData.profilePhoto);
    }

    try {
      const response = await axios.post(`${baseUrl}/updateProfile`, data);
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('data is already present ');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <ToastContainer />
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-lg">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Profile Details</h2>
                <Button variant="link" onClick={() => setIsEditing(!isEditing)}>
                  <MdEdit size={24} />
                </Button>
              </div>

              <Row>
                <Col md={4} className="text-center">
                  <div className="position-relative d-inline-block">
                    <Image
                      src={photoPreview || (user.profilePhoto?.startsWith("http") 
                        ? user.profilePhoto 
                        : `${baseUrl}${user.profilePhoto}`)}
                      alt="Profile"
                      roundedCircle
                      className="img-thumbnail mb-3"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                    {isEditing && (
                      <Form.Group controlId="formPhoto" className="mt-3">
                        <Form.Label className="btn btn-outline-primary">
                          <MdCameraAlt className="me-2" />
                          Change Photo
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            hidden
                          />
                        </Form.Label>
                      </Form.Group>
                    )}
                  </div>
                </Col>

                <Col md={8}>
                  {!isEditing ? (
                    <>
                      <h3 className="mb-3">{user.name}</h3>
                      <div className="mb-3">
                        <MdOutlineMail className="me-2" size={20} />
                        <span className="text-muted">{user.email}</span>
                      </div>
                      <div className="mb-3">
                        <MdOutlineLocalPhone className="me-2" size={20} />
                        <span className="text-muted">
                          {user.phone || 'Not provided'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <MdOutlinePlace className="me-2" size={20} />
                        <span className="text-muted">
                          {user.address || 'Not provided'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          isInvalid={!!validation.phone}
                          placeholder="Enter 10-digit phone number"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validation.phone}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          isInvalid={!!validation.address}
                          placeholder="Enter your full address"
                          rows={3}
                        />
                        <Form.Control.Feedback type="invalid">
                          {validation.address}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfiles;