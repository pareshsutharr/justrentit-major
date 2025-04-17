import React from 'react';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function ProductView({ productId, products, onClose }) {
  const product = products.find((p) => p._id === productId);

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">
          {/* Carousel for Images */}
          <div className="carousel">
            {product.images.map((image, index) => (
              <div key={index} className="carousel-item">
                <img src={`${baseUrl}${image}`} alt={`Slide ${index}`} />
              </div>
            ))}
          </div>
          {/* Product Details */}
          <div className="product-details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ₹{product.rentalPrice} / day</p>
          </div>
          {/* Author Details */}
          <div className="author-details">
            <img
              src={`${baseUrl}${product.authorDetails.profilePhoto}`}
              alt={product.authorDetails.name}
              className="author-profile-img"
            />
            <h3>{product.authorDetails.name}</h3>
            <p>Email: {product.authorDetails.email}</p>
            <p>Phone: {product.authorDetails.phone}</p>
          </div>
          {/* Call and Chat Options */}
          <div className="action-buttons">
            <button onClick={() => (window.location.href = `mailto:${product.authorDetails.email}`)}>Email</button>
            <button onClick={() => (window.location.href = `tel:${product.authorDetails.phone}`)}>Call</button>
            <button>Chat</button>
          </div>
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          border-radius: 10px;
          width: 90%;
          max-width: 600px;
          position: relative;
          padding: 20px;
          overflow: hidden;
        }
        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        .carousel img {
          width: 100%;
          border-radius: 10px;
        }
        .product-details, .author-details {
          margin-top: 20px;
        }
        .author-profile-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        .action-buttons button {
          margin-right: 10px;
          padding: 10px 20px;
          background: #007bff;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default ProductView;
