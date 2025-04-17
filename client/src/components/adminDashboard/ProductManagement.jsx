import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Pagination, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { Edit, Trash2, CheckCircle, XCircle, Star, Search, Filter, Info } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    featured: 'all',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/admin/products`, {
          params: { ...filters, searchTerm, page: currentPage },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, searchTerm, currentPage]);

  const handleVerification = async (productId, status) => {
    try {
      await axios.put(`${baseUrl}/api/admin/products/${productId}/verify`, 
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProducts(products.map(p => 
        p._id === productId ? { ...p, verified: status === 'approved' } : p
      ));
      toast.success(`Product ${status} successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleFeatureToggle = async (productId) => {
    try {
      const product = products.find(p => p._id === productId);
      await axios.put(`${baseUrl}/api/admin/products/${productId}/feature`, 
        { featured: !product.featured },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProducts(products.map(p => 
        p._id === productId ? { ...p, featured: !p.featured } : p
      ));
      toast.success(`Product featured status updated`);
    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Failed to update feature status');
    }
  };

  const handleDelete = async (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}/api/admin/products/${productId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
          toast.success('Product deleted successfully');
        } catch (error) {
          console.error("Error deleting product:", error);
          toast.error('Failed to delete product');
        }
      }
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
       `${baseUrl}/api/admin/products/${editProduct._id}`,
        editProduct,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setProducts(products.map(p => p._id === editProduct._id ? response.data : p));
      setEditProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (loading) return <div className="d-flex justify-content-center my-5"><div className="spinner-border" role="status"></div></div>;

  return (
    <div className="container-fluid py-4">
      <Toaster position="top-right" />
      
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Product Management</h2>
          <div className="d-flex gap-2">
            <Form.Group className="me-2">
              <Form.Control 
              style={{width:'30vh'}}
                type="search" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
            <Form.Select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="me-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
            <Form.Select
              value={filters.featured}
              onChange={(e) => setFilters({...filters, featured: e.target.value})}
            >
              <option value="all">All Features</option>
              <option value="featured">Featured</option>
              <option value="non-featured">Non-Featured</option>
            </Form.Select>
          </div>
        </div>

        <div className="card-body">
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </Button>
                  </td>
                  <td>{product.category?.map(c => c.name).join(', ')}</td>
                  <td>{product.userId?.name}</td>
                  <td>
                    <Badge bg={product.verified ? 'success' : 'warning'}>
                      {product.verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    {product.featured ? (
                      <Star size={18} className="text-warning" fill="#ffd700" />
                    ) : '-'}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-info" size="sm" onClick={() => setEditProduct(product)}>
                        <Edit size={16} />
                      </Button>
                      {!product.verified && (
                        <>
                          <Button variant="outline-success" size="sm" onClick={() => handleVerification(product._id, 'approved')}>
                            <CheckCircle size={16} />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleVerification(product._id, 'rejected')}>
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant={product.featured ? 'outline-warning' : 'outline-secondary'} 
                        size="sm"
                        onClick={() => handleFeatureToggle(product._id)}
                      >
                        <Star size={16} />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Product Detail Modal */}
      <Modal show={!!selectedProduct} onHide={() => setSelectedProduct(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex gap-2 overflow-auto">
                {selectedProduct?.images?.map((img, index) => (
                  <img key={index} src={`${baseUrl}` + img} alt={`Product ${index + 1}`} className="img-thumbnail" style={{ height: '150px' }} />
                ))}
              </div>
            </div>
            <div className="col-12">
              <p>{selectedProduct?.description}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Price:</strong> ₹{selectedProduct?.rentalPrice}/day</p>
              <p><strong>Location:</strong> {selectedProduct?.location?.area}, {selectedProduct?.location?.state}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Condition:</strong> {selectedProduct?.condition}</p>
              <p><strong>Categories:</strong> {selectedProduct?.category?.map(c => c.name).join(', ')}</p>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Product Modal */}
      <Modal show={!!editProduct} onHide={() => setEditProduct(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateProduct}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={editProduct?.name || ''}
                onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editProduct?.description || ''}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rental Price ($/day)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={editProduct?.rentalPrice || ''}
                onChange={(e) => setEditProduct({...editProduct, rentalPrice: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditProduct(null)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.Prev 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          <Pagination.Next 
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={products.length < itemsPerPage}
          />
        </Pagination>
      </div>
    </div>
  );
};

export default ProductManagement;