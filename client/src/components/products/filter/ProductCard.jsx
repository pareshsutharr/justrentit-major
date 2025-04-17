import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import './ProductCard.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const ProductCard = ({ product, activeImageIndex, handlePrev, handleNext, openProductView }) => {
  if (!product?.userId || !product?._id) return null;
  const COLORS = {
    primary: '#1A365D',
    accent: '#ED8936',
    background: '#F7FAFC',
    text: '#2D3748',
    mutedText: '#718096'
  };

  const conditionStyles = {
    new: { bg: '#2C5282', text: 'white' },
    used: { bg: '#4A5568', text: 'white' },
    excellent: { bg: '#718096', text: 'white' },
    good: { bg: '#CBD5E0', text: COLORS.text },
    fair: { bg: '#E2E8F0', text: COLORS.text }
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 col-xl-3 mb-4 ">
      <div 
        className="card h-100 border-0 overflow-hidden shadow-sm " 
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
       >
        {product.featured && (
          <div className="featured-ribbon">
            <span>FEATURED</span>
          </div>
        )}

        <div className="card-header border-0 pb-0">
          <div className="d-flex align-items-center">
            <img
              src={`${baseUrl}${product.userId?.profilePhoto}`}
              alt={product.userId?.name}
              className="user-avatar"
              loading="lazy"
            />
            <div className="user-info">
              <h6 className="user-name">
                {product.userId?.name}
                {product.verified && <i className="verification-badge"></i>}
              </h6>
              <small className="post-time">
                {product.createdAt
                  ? `Posted ${formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}`
                  : "Date not available"}
              </small>
            </div>
          </div>
        </div>

        <div className="card-img-section">
          <div className="image-container">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`carousel-item ${activeImageIndex[product._id] === index ? 'active' : ''}`}
              >
                <img
                  src={`${baseUrl}${image}`}
                  className="product-image"
                  alt={`Product ${index}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          
          {product.images.length > 1 && (
            <div className="carousel-controls">
              <button
                className="control-btn prev"
                onClick={() => handlePrev(product._id)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="control-btn next"
                onClick={() => handleNext(product._id)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}

          <div className="image-counter">
            <span>
              {activeImageIndex[product._id] + 1}/{product.images.length}
            </span>
          </div>
        </div>

        <div className="card-body pt-2">
          <div className="title-section">
            <h5 className="product-title">
              {product.name}
            </h5>
            <span className="availability-badge">
              {product.available ? 'Available' : 'Booked'}
            </span>
          </div>

          <div className="badge-section">
            <span className="condition-badge" style={{
              backgroundColor: conditionStyles[product.condition]?.bg,
              color: conditionStyles[product.condition]?.text
            }}>
              <i className="bi bi-tag"></i>
              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </span>
            {product.isForSale && (
              <span className="sale-badge" style={{
                backgroundColor: COLORS.primary,
                color: 'white'
              }}>
                <i className="bi bi-cash-coin"></i>Available for Purchase
              </span>
            )}
          </div>

          <p className="product-description">
            {product.description}
          </p>

          <div className="details-grid">
            <DetailItem 
              icon="geo-alt"
              title="Location"
              value={`${product.location.area}, ${product.location.state}`}
            />
            <DetailItem 
              icon="shield-check"
              title="Deposit"
              value={`₹${product.securityDeposit}`}
            />
            <DetailItem 
              icon="calendar3"
              title="Duration"
              value={`Per ${product.rentalDuration}`}
            />
            <DetailItem 
              icon="star"
              title="Rating"
              value={`(${product.ratings?.averageRating && product.ratings?.totalRatings ? 
                `${product.ratings.averageRating} (${product.ratings.totalRatings})` : 'N/A'})`}
              
            />
          </div>{product.isForSale >0 ? (
                <div className="sale-price"> 
                  <small>Also Can Purchase At:</small>
                  ₹{product.sellingPrice}
                </div>
              ): <div className="sale-price"> 
              <small>Reny Only Product</small>
              {/* ₹{product.sellingPrice} */}
            </div>}

          <div className="price-section">
            <div className="price-content">
              <div className="rental-price">
                ₹{product.rentalPrice}
                <span>/{product.rentalDuration}</span>
              </div>
              
            </div>
            <button 
              onClick={() => openProductView(product)}
              className="view-button"
            >
              <i className="bi bi-eye"></i>View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, title, value }) => (
  <div className="detail-item">
    <i className={`bi bi-${icon}`}></i>
    <div>
      <div className="detail-title">{title}</div>
      <div className="detail-value">{value}</div>
    </div>
  </div>
);

export default ProductCard;