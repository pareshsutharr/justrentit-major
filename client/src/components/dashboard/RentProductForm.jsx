import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingForLocation from '../loadingpages/LoadingForLocation';
import 'bootstrap/dist/css/bootstrap.min.css';
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const RentProductForm = () => {
  const initialFormState = {
    name: '',
    description: '',
    rentalPrice: '',
    securityDeposit: '',
    rentalDuration: 'day',
    condition: 'good',
    category: [],
    images: [],
    available: false,
    isForSale: false,
    sellingPrice: '',
    location: {
      country: '',
      state: '',
      area: '',
      pincode: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const user = Cookies.get('userDetails') ? JSON.parse(Cookies.get('userDetails')) : null;

  // Fetch categories and countries on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, countriesRes] = await Promise.all([
          axios.get(`${baseUrl}/api/categories`),
          axios.get('https://restcountries.com/v3.1/all?fields=name')
        ]);
        
        setCategories(categoriesRes.data || []);
        setCountries(countriesRes.data.map(c => ({ name: c.name.common })).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        toast.error('Error initializing form data');
      }
    };
    
    fetchData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(categoryId)
        ? prev.category.filter(id => id !== categoryId)
        : [...prev.category, categoryId]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!user?._id) return toast.error('User not logged in');
  //   if (formData.category.length === 0) return toast.error('Please select at least one category');

  //   setLoading(true);
  //   const data = new FormData();

  //   // Append form data
  //   const { images, location, category, ...rest } = formData;
  //   Object.entries(rest).forEach(([key, val]) => data.append(key, val));
  //   Object.entries(location).forEach(([key, val]) => data.append(key, val));
  //   category.forEach(cat => data.append('category', cat));
  //   Array.from(images).forEach(img => data.append('images', img));
  //   data.append('userId', user._id);

  //   try {
  //     await axios.post('http://localhost:3001/rentproduct/add', data);
  //     toast.success('Product added successfully!');
  //     setFormData(initialFormState);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Error adding product');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!user?._id) return toast.error('User not logged in');
    if (formData.category.length === 0) return toast.error('Please select at least one category');
  
    setLoading(true);
    const data = new FormData();
    const token = localStorage.getItem("token"); // Get JWT token from localStorage

  
    // Append form data (remove userId from form data)
    const { images, location, category, ...rest } = formData;
    Object.entries(rest).forEach(([key, val]) => data.append(key, val));
    Object.entries(location).forEach(([key, val]) => data.append(key, val));
    category.forEach(cat => data.append('category', cat));
    Array.from(images).forEach(img => data.append('images', img));
  
    try {
      await axios.post(`${baseUrl}/rentproduct/add`, data, {
        headers: {
          Authorization: `Bearer ${token}` // Add JWT to headers
        }
      });
      toast.success('Product added successfully!');
      setFormData(initialFormState);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };
  const selectedCategories = categories
    .filter(cat => formData.category.includes(cat._id))
    .map(cat => cat.name)
    .join(', ') || 'Select categories...';

  return (
    <div className="container py-5">
      <ToastContainer position="top-center" />
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <h2 className="mb-4 text-center text-primary">Add Rental Product</h2>
          
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            {/* Product Information Section */}
            <fieldset className="mb-4">
              <legend className="h5 mb-3 text-secondary">Product Information</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Pricing & Details Section */}
            <fieldset className="mb-4">
              <legend className="h5 mb-3 text-secondary">Pricing & Details</legend>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Rental Price</label>
                  <div className="input-group">
                    <input
                      type="number"
                      name="rentalPrice"
                      value={formData.rentalPrice}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                    <span className="input-group-text">/ {formData.rentalDuration}</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Security Deposit</label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Rental Duration</label>
                  <select
                    name="rentalDuration"
                    value={formData.rentalDuration}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {['hour', 'day', 'week', 'month'].map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {['new', 'used', 'excellent', 'good', 'fair'].map(option => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Sale Options Section */}
            <fieldset className="mb-4">
              <legend className="h5 mb-3 text-secondary">Sale Options</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="isForSale"
                      checked={formData.isForSale}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Available for Purchase</label>
                  </div>
                  {formData.isForSale && (
                    <div className="mt-2">
                      <label className="form-label">Selling Price</label>
                      <input
                        type="number"
                        name="sellingPrice"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Categories Section */}
            <div className="mb-4">
              <label className="form-label">Categories</label>
              <div className="dropdown">
                <button
                  type="button"
                  className="form-select text-start dropdown-toggle"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  {selectedCategories}
                </button>
                
                <div className={`dropdown-menu p-3 ${showCategoryDropdown ? 'show' : ''}`}>
                  <div className="row g-2">
                    {categories.map(cat => (
                      <div key={cat._id} className="col-md-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id={`cat-${cat._id}`}
                            checked={formData.category.includes(cat._id)}
                            onChange={() => handleCategoryChange(cat._id)}
                            className="form-check-input"
                          />
                          <label htmlFor={`cat-${cat._id}`} className="form-check-label">
                            {cat.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <fieldset className="mb-4">
              <legend className="h5 mb-3 text-secondary">Location Details</legend>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Country</label>
                  <select
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Area</label>
                  <input
                    type="text"
                    name="location.area"
                    value={formData.location.area}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleInputChange}
                    className="form-control"
                    pattern="\d{6}"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Images Section */}
            <div className="mb-4">
              <label className="form-label">Product Images</label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={e => setFormData(prev => ({ ...prev, images: e.target.files }))}
                className="form-control"
                required
              />
            </div>

            {/* Availability Section */}
            <div className="mb-4">
              <div className="form-check">
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                  className="form-check-input"
                />
                <label className="form-check-label">Immediately Available for Rent</label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? <LoadingForLocation /> : 'Submit Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentProductForm;