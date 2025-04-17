import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
function ProductModal({ product, onClose, onSave }) {
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    description: "",
    rentalPrice: 0,
    securityDeposit: 0,
    rentalDuration: "day",
    condition: "good",
    available: true,
    isForSale: true,
    sellingPrice: 0,
    location: { country: "", state: "", area: "", pincode: "" },
    category: [],
    featured: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/categories`
        );
        const receivedCategories = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setCategories(receivedCategories);
      } catch (error) {
        toast.error("Failed to load categories");
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountries(response.data);
      } catch (error) {
        toast.error("Failed to load countries");
        console.error("Error fetching countries:", error);
      }
    };

    if (product) {
      const initialCategories = Array.isArray(product.category)
        ? product.category.map((c) => (c._id ? c._id.toString() : c.toString()))
        : [];

      setEditedProduct({
        ...product,
        securityDeposit: product.securityDeposit || 0,
        rentalDuration: product.rentalDuration || "day",
        condition: product.condition || "good",
        available: product.available !== undefined ? product.available : true,
        isForSale: product.isForSale !== undefined ? product.isForSale : false,
        sellingPrice: product.sellingPrice || 0,
        featured: product.featured || false,
        location: product.location || {
          country: "",
          state: "",
          area: "",
          pincode: "",
        },
        category: initialCategories,
      });
      setImagePreviews(product.images || []);
    }

    fetchCategories();
    fetchCountries();
  }, [product]);

  const renderCategories = () => {
    if (!Array.isArray(categories)) return null;

    return categories.map((cat) => (
      <div key={cat._id} className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value={cat._id}
          id={`cat-${cat._id}`}
          checked={editedProduct.category.includes(cat._id)}
          onChange={handleCategoryChange}
        />
        <label className="form-check-label d-block" htmlFor={`cat-${cat._id}`}>
          {cat.name}
        </label>
      </div>
    ));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedProduct((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setEditedProduct((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      category: checked
        ? [...prev.category, value]
        : prev.category.filter((cat) => cat !== value),
    }));
  };

  // Update the handleSave validation and data preparation
  const handleSave = async () => {
    // Validate category selection
    if (editedProduct.category.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    // Validate numeric fields
    if (editedProduct.isForSale && editedProduct.sellingPrice <= 0) {
      toast.error("Please enter a valid selling price");
      return;
    }

    const formData = new FormData();
    const numericFields = ["rentalPrice", "securityDeposit", "sellingPrice"];
    const booleanFields = ["available", "featured", "isForSale"];

    // Append all fields with proper formatting
    Object.entries(editedProduct).forEach(([key, value]) => {
      if (booleanFields.includes(key)) {
        formData.append(key, value.toString());
      } else if (key === "location") {
        formData.append(key, JSON.stringify(value));
      } else if (key === "category") {
        formData.append(key, JSON.stringify(value));
      } else if (numericFields.includes(key)) {
        formData.append(key, parseFloat(value) || 0);
      } else {
        formData.append(key, value);
      }
    });

    // Append images
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      const response = await axios.put(
          `${baseUrl}/api/update-product/${editedProduct._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        onSave(response.data.product);
        onClose();
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating product";
      toast.error(errorMessage);
    }
  };
  const handleRemoveImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const handleSwapImages = (index1, index2) => {
    const updatedPreviews = [...imagePreviews];
    [updatedPreviews[index1], updatedPreviews[index2]] = [
      updatedPreviews[index2],
      updatedPreviews[index1],
    ];
    setImagePreviews(updatedPreviews);
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Edit Product</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={editedProduct.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={editedProduct.description}
                    onChange={handleChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Rental Price (₹/day)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="rentalPrice"
                      value={editedProduct.rentalPrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Security Deposit</label>
                    <input
                      type="number"
                      className="form-control"
                      name="securityDeposit"
                      value={editedProduct.securityDeposit}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Rental Duration</label>
                    <select
                      className="form-select"
                      name="rentalDuration"
                      value={editedProduct.rentalDuration}
                      onChange={handleChange}
                    >
                      <option value="hour">Hourly</option>
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Condition</label>
                    <select
                      className="form-select"
                      name="condition"
                      value={editedProduct.condition}
                      onChange={handleChange}
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Categories</label>
                  <div
                    className="border p-2 rounded-2"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {categories.length > 0 ? (
                      renderCategories()
                    ) : (
                      <div className="text-muted">No categories available</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    name="location.country"
                    value={editedProduct.location.country}
                    onChange={handleChange}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.cca3} value={country.name.common}>
                        {country.name.common}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location.state"
                      value={editedProduct.location.state}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Area</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location.area"
                      value={editedProduct.location.area}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location.pincode"
                      value={editedProduct.location.pincode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="featured"
                      checked={editedProduct.featured}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Featured Product</label>
                  </div>
                </div>
                {/* Available Switch */}
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="available"
                    checked={editedProduct.available}
                    onChange={handleChange}
                    id="availableSwitch"
                  />
                  <label className="form-check-label" htmlFor="availableSwitch">
                    Available for Listing
                  </label>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isForSale"
                      checked={editedProduct.isForSale}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      Available for Sale
                    </label>
                  </div>
                  {editedProduct.isForSale && (
                    <div className="mt-2">
                      <label className="form-label">Selling Price</label>
                      <input
                        type="number"
                        className="form-control"
                        name="sellingPrice"
                        value={editedProduct.sellingPrice}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Update Images</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <div className="mt-2 d-flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={
                            preview.startsWith("blob:")
                              ? preview
                              :   `${baseUrl}${preview}`
                          }
                          alt={`preview-${index}`}
                          className="img-thumbnail"
                          style={{ width: "80px", height: "80px" }}
                          onClick={() =>
                            handleSwapImages(
                              index,
                              (index + 1) % imagePreviews.length
                            )
                          }
                        />
                        <button
                          type="button"
                          className="btn-close position-absolute top-0 end-0"
                          aria-label="Close"
                          onClick={() => handleRemoveImage(index)}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
