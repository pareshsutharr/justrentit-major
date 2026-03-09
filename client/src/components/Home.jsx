import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Home.css";

// Assets
import heroIllustration from "../assets/images/hero-illustration.png";
import howItWorksIllustration from "../assets/images/how-it-works-illustration.png";
import ctaIllustration from "../assets/images/cta-illustration.png";

const dummyRentals = [
  {
    id: 1,
    title: "C Type Apple charger",
    location: "Surat",
    price: "1000",
    unit: "day",
    image: "https://images.unsplash.com/photo-1624823183594-5b74681347ba?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "DSLR Camera",
    location: "Surat",
    price: "845",
    unit: "day",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Portable Projector",
    location: "Surat",
    price: "895",
    unit: "day",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    title: "Camping Tent",
    location: "Surat",
    price: "845",
    unit: "day",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=400",
  }
];

function Home() {
  return (
    <div className="home-page-redesign">
      <Header />

      <main className="home-main-content">
        {/* 1. Hero Section */}
        <section className="hero-section">
          <div className="container hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Discover Rentals Near You</h1>
              <p className="hero-subtitle">
                Rent products easily and affordably from nearby owners.
              </p>

              <div className="hero-search-box">
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    className="hero-search-input"
                  />
                </div>
                <button className="hero-filter-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                  <span>Filters</span>
                  <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </div>
            
            <div className="hero-illustration">
              <img src={heroIllustration} alt="People renting products" />
            </div>
          </div>
        </section>

        {/* 2. Featured Rentals Section */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                Featured Rentals
                <span className="arrow-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </span>
              </h2>
            </div>
            
            <div className="rental-grid">
              {dummyRentals.map((item) => (
                <div key={item.id} className="rental-card">
                  <div className="card-image-box">
                    <img src={item.image} alt={item.title} />
                    <span className="image-badge">1/1</span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{item.location}</span>
                    </div>
                    <div className="card-footer">
                      <div className="card-price">
                        <span className="currency">₹</span>
                        <span className="amount">{item.price}</span>
                        <span className="per">per</span>
                      </div>
                      <div className="card-unit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <span>Per {item.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <button 
                className="btn-gold"
                onClick={() => (window.location.href = "/products")}
              >
                View All Rentals
              </button>
            </div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section className="how-it-works-section">
          <div className="container works-container">
            <div className="works-content">
              <h2 className="section-title">How It Works</h2>
              <div className="works-cards">
                <div className="works-card">
                  <div className="icon-box icon-blue">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <h4>Find It Locally</h4>
                  <p>Browse products available nearby</p>
                </div>
                
                <div className="works-card">
                  <div className="icon-box icon-purple">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <h4>Rent It Easily</h4>
                  <p>Book the items you need with ease</p>
                </div>

                <div className="works-card">
                  <div className="icon-box icon-gold">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cda059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <h4>Rent Nearby</h4>
                  <p>Conveniently rent top-quality items from owners</p>
                </div>
              </div>
            </div>
            
            <div className="works-illustration">
              <img src={howItWorksIllustration} alt="People taking photos" />
            </div>
          </div>
        </section>

        {/* 4. Why Choose Just Rent It? */}
        <section className="why-choose-section">
          <div className="container">
            <h2 className="section-title">Why Choose Just Rent It?</h2>
            
            <div className="reasons-grid">
              <div className="reason-card">
                <div className="reason-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 12 15 16 9"></polyline></svg>
                </div>
                <div className="reason-text">
                  <h4>Trusted Platform</h4>
                  <p>Safe, secure and reliable marketplace</p>
                </div>
              </div>

              <div className="reason-card">
                <div className="reason-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </div>
                <div className="reason-text">
                  <h4>Affordable Prices</h4>
                  <p>Rent products at a fraction of the cost</p>
                </div>
              </div>

              <div className="reason-card">
                <div className="reason-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="reason-text">
                  <h4>Rent Nearby</h4>
                  <p>Find rentals conveniently in your area.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="cta-section">
          <div className="container cta-container">
            <div className="cta-content">
              <h2>Start Listing Your Products for Rent</h2>
              <p>Earn money by listing your items for rent today!</p>
              <button 
                className="btn-gold cta-btn"
                onClick={() => (window.location.href = "/dashboard")}
              >
                List Your Product
              </button>
            </div>
            <div className="cta-illustration">
              <img src={ctaIllustration} alt="Happy people" />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Home;
