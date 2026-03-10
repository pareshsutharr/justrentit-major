import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingForLocation from '../loadingpages/LoadingForLocation';
import { ChevronDown, Upload, Check } from 'lucide-react';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ─── Generic form field wrappers ───────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}{required && <span className="text-error ml-0.5">*</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 outline-none
      focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder-gray-400 ${props.className || ""}`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 outline-none
      focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none ${props.className || ""}`}
  >
    {children}
  </select>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-50">{title}</h3>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-gray-200"}`} />
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

/* ─── Main form ─────────────────────────────────────────────────── */
const RentProductForm = () => {
  const initialFormState = {
    name: '', description: '', rentalPrice: '', securityDeposit: '',
    rentalDuration: 'day', condition: 'good', category: [],
    images: [], available: false, isForSale: false, sellingPrice: '',
    location: { country: '', state: '', area: '', pincode: '' },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [imagePreviewCount, setImagePreviewCount] = useState(0);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${baseUrl}/api/categories`),
      axios.get("https://restcountries.com/v3.1/all?fields=name"),
    ]).then(([catResult, countryResult]) => {
      if (catResult.status === "fulfilled") {
        const payload = catResult.value?.data;
        setCategories(Array.isArray(payload) ? payload : payload?.categories || []);
      }
      if (countryResult.status === "fulfilled") {
        setCountries(
          (countryResult.value?.data || [])
            .map((c) => c?.name?.common)
            .filter(Boolean)
            .sort()
        );
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("location.")) {
      const [, child] = name.split(".");
      setFormData((prev) => ({ ...prev, location: { ...prev.location, [child]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleCategoryChange = (catId) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(catId)
        ? prev.category.filter((id) => id !== catId)
        : [...prev.category, catId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category.length === 0) return toast.error("Please select at least one category");
    setLoading(true);

    const data = new FormData();
    const token = localStorage.getItem("token");
    const { images, location, category, ...rest } = formData;
    Object.entries(rest).forEach(([k, v]) => data.append(k, v));
    Object.entries(location).forEach(([k, v]) => data.append(k, v));
    category.forEach((cat) => data.append("category", cat));
    Array.from(images).forEach((img) => data.append("images", img));

    try {
      await axios.post(`${baseUrl}/rentproduct/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product listed successfully!");
      setFormData(initialFormState);
      setImagePreviewCount(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryNames = categories
    .filter((c) => formData.category.includes(c._id))
    .map((c) => c.name)
    .join(", ") || "Select categories…";

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">List a Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details to list your item for rent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Product Info */}
        <SectionCard title="Product Information">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label required>Product Name</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Sony A7 III Camera" required />
            </div>
            <div>
              <Label required>Description</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Describe the item, its condition, what's included…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-900 outline-none
                  focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder-gray-400"
              />
            </div>
          </div>
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing &amp; Details">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>Rental Price (₹)</Label>
              <Input type="number" name="rentalPrice" value={formData.rentalPrice} onChange={handleInputChange} placeholder="0" required />
            </div>
            <div>
              <Label>Security Deposit (₹)</Label>
              <Input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} placeholder="0" />
            </div>
            <div>
              <Label required>Duration</Label>
              <div className="relative">
                <Select name="rentalDuration" value={formData.rentalDuration} onChange={handleInputChange} required>
                  {["hour", "day", "week", "month"].map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </Select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Label required>Condition</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {["new", "excellent", "good", "fair", "poor"].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, condition: cond }))}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all capitalize ${formData.condition === cond
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                    }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Categories */}
        <SectionCard title="Categories">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-700 outline-none hover:border-primary/50 transition-colors"
            >
              <span className="truncate pr-2 text-left">{selectedCategoryNames}</span>
              <ChevronDown size={16} className={`flex-shrink-0 text-gray-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-3 max-h-52 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => {
                    const isChecked = formData.category.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => handleCategoryChange(cat._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${isChecked ? "bg-primary-light text-primary font-medium" : "hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${isChecked ? "bg-primary border-primary" : "border-gray-300"}`}>
                          {isChecked && <Check size={10} className="text-white" />}
                        </div>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {formData.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {categories.filter((c) => formData.category.includes(c._id)).map((c) => (
                <span key={c._id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                  {c.name}
                  <button type="button" onClick={() => handleCategoryChange(c._id)} className="text-primary/60 hover:text-primary">×</button>
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Location */}
        <SectionCard title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Country</Label>
              <div className="relative">
                <Select name="location.country" value={formData.location.country} onChange={handleInputChange} required>
                  <option value="">Select country…</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label required>State / Province</Label>
              <Input name="location.state" value={formData.location.state} onChange={handleInputChange} placeholder="e.g. Maharashtra" required />
            </div>
            <div>
              <Label required>Area / Locality</Label>
              <Input name="location.area" value={formData.location.area} onChange={handleInputChange} placeholder="e.g. Andheri West" required />
            </div>
            <div>
              <Label required>Pincode</Label>
              <Input name="location.pincode" value={formData.location.pincode} onChange={handleInputChange} placeholder="6-digit pincode" pattern="\d{6}" required />
            </div>
          </div>
        </SectionCard>

        {/* Images */}
        <SectionCard title="Product Images">
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary-light/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
              <Upload size={22} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB each</p>
            </div>
            {imagePreviewCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-light text-success text-xs font-medium">
                <Check size={12} /> {imagePreviewCount} file{imagePreviewCount !== 1 ? "s" : ""} selected
              </span>
            )}
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              required
              className="sr-only"
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, images: e.target.files }));
                setImagePreviewCount(e.target.files?.length || 0);
              }}
            />
          </label>
        </SectionCard>

        {/* Availability & Sale */}
        <SectionCard title="Availability &amp; Sale Options">
          <div className="space-y-4">
            <Toggle
              checked={formData.available}
              onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
              label="Immediately available for rent"
            />
            <Toggle
              checked={formData.isForSale}
              onChange={(e) => setFormData((prev) => ({ ...prev, isForSale: e.target.checked }))}
              label="Also available for purchase"
            />
            {formData.isForSale && (
              <div className="pt-2">
                <Label>Selling Price (₹)</Label>
                <Input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} placeholder="0" className="max-w-xs" />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold
            transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : "List My Product →"}
        </button>
      </form>
    </div>
  );
};

export default RentProductForm;
