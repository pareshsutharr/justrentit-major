import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingPage from './loadingpages/LoadingPage';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function PublicProduct() {
  const [products, setProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = storedUser._id; // Ensure storedUser has an _id property
  
  const navigate = useNavigate();

  const openProductView = (product) => {
    setSelectedProduct(product);
  };

  const closeProductView = () => {
    setSelectedProduct(null);
  };

  const handlePrev = (productId) => {
    setActiveImageIndex((prev) => {
      const currentIndex = prev[productId];
      const productImages = products.find((product) => product._id === productId).images;
      const newIndex = (currentIndex - 1 + productImages.length) % productImages.length;
      return { ...prev, [productId]: newIndex };
    });
  };

  const handleNext = (productId) => {
    setActiveImageIndex((prev) => {
      const currentIndex = prev[productId];
      const productImages = products.find((product) => product._id === productId).images;
      const newIndex = (currentIndex + 1) % productImages.length;
      return { ...prev, [productId]: newIndex };
    });
  };
  
  useEffect(() => {
    axios
      .get(`${baseUrl}/api/products`)
      .then((response) => {
        if (response.data.success) {
          // Filter products to only include available ones
          const availableProducts = response.data.products.filter(product => product.available);
          setProducts(availableProducts);

          const initialIndexes = {};
          availableProducts.forEach((product) => {
            initialIndexes[product._id] = 0;
          });
          setActiveImageIndex(initialIndexes);
        } else {
          console.error('Failed to fetch products:', response.data.message);
        }
      })
      .catch((err) => console.error('Error:', err))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="container my-5" style={{ maxWidth: '1400px' }}>
      
      <h1 className="text-center mb-5">Available Products</h1>
      <div className="row g-4">
        {products.map((product) => (
          <div key={product._id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-header d-flex align-items-center">
                <img
                  src={`${baseUrl}${product.authorDetails.profilePhoto}`}
                  alt={product.authorDetails.name}
                  className="rounded-circle me-3"
                  style={{ width: '50px', height: '50px' }}
                />
                <div>
                  <h5 className="mb-0">{product.authorDetails.name}</h5>
                  <small className="text-muted">{product.authorDetails.email}</small>
                </div>
              </div>
              <div className="carousel slide card-img-top position-relative" data-bs-ride="carousel">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`carousel-item ${activeImageIndex[product._id] === index ? 'active' : ''}`}
                  >
                    <img
                      src={`${baseUrl}${image}`}
                      className="d-block w-100"
                      alt={`Product ${index}`}
                      style={{ objectFit: 'cover', height: '200px', transition: 'transform 0.3s ease-in-out' }}
                    />
                  </div>
                ))}
                <button
                  className="carousel-control-prev"
                  type="button"
                  onClick={() => handlePrev(product._id)}
                  style={{
                    left: '10px',
                    zIndex: 5,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  onClick={() => handleNext(product._id)}
                  style={{
                    right: '10px',
                    zIndex: 5,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
              <div className="card-body text-center">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                {/* <p className="card-text">{product.description}</p> */}
                <p className="text-danger fw-bold">₹{product.rentalPrice} / day</p>
                <button
                  onClick={() => openProductView(product)}
                  className="btn btn-primary"
                >
                  View Product
                </button>
                <button
  className="btn btn-success ms-2"
>
  Chat with Author
</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '50vw', maxHeight: '50vh' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.name}</h5>
                <button type="button" className="btn-close" onClick={closeProductView}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="carousel slide" data-bs-ride="carousel">
                      {selectedProduct.images.map((image, index) => (
                        <div
                          key={index}
                          className={`carousel-item ${activeImageIndex[selectedProduct._id] === index ? 'active' : ''}`}
                        >
                          <img
                            src={`${baseUrl}${image}`}
                            className="d-block w-100"
                            alt={`Selected Product ${index}`}
                            style={{
                              objectFit: 'cover',
                              height: '45vh',
                              width: '70vh',
                              transition: 'transform 0.3s ease-in-out',
                            }}
                          />
                        </div>
                      ))}
                      <button
                        className="carousel-control-prev"
                        type="button"
                        onClick={() => handlePrev(selectedProduct._id)}
                        style={{
                          left: '10px',
                          zIndex: 5,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        onClick={() => handleNext(selectedProduct._id)}
                        style={{
                          right: '10px',
                          zIndex: 5,
                          transition: 'opacity 0.3s',
                        }}
                      >
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p>{selectedProduct.description}</p>
                    <p className="text-danger fw-bold">₹{selectedProduct.rentalPrice} / day</p>
                    <div className='bg-whitesmoke' style={{background:'#f4f4f4',borderRadius:'10px',padding:'10px',justifyContent:'fit',backgroundSize:'cover'}}>
                    <h6>Author: {selectedProduct.authorDetails.name}</h6>
                    <p>Email: {selectedProduct.authorDetails.email}</p>
                    </div>
                    <div className="d-flex gap-2">
                      <a href={`mailto:${selectedProduct.authorDetails.email}`} className="btn btn-primary">
                        Email
                      </a>
                      <a href={`tel:${selectedProduct.authorDetails.phone}`} className="btn btn-danger">
                        Call
                      </a>
                      <button className="btn btn-success" onClick={() => alert('Chat feature coming soon!')}>
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProduct;
