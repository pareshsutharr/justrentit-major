import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronDown, Upload, Check, Camera, DollarSign, MapPin, Tag, Shield, Info, Image as ImageIcon, X } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/productHelpers';

const baseUrl = getApiBaseUrl();

/* ─── Generic form field wrappers ───────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none
      focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all placeholder-slate-300 ${props.className || ""}`}
  />
);

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    <div className="pt-2">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white group cursor-pointer hover:border-indigo-100 transition-colors">
    <span className="text-sm font-bold text-slate-700 tracking-tight">{label}</span>
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-12 h-7 rounded-full transition-all duration-300 ${checked ? "bg-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-200"}`} />
      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? "translate-x-5" : ""}`} />
    </div>
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
      await axios.post(`${baseUrl}/api/rentproduct/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Asset live on the marketplace!");
      setFormData(initialFormState);
      setImagePreviewCount(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol failure while listing asset.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryNames = categories
    .filter((c) => formData.category.includes(c._id))
    .map((c) => c.name)
    .join(", ") || "Select categories…";

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <ToastContainer position="bottom-right" autoClose={4000} theme="dark" hideProgressBar />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">List New Asset</h1>
          <p className="text-base font-bold text-slate-400 mt-2 uppercase tracking-[0.15em] text-sm">Deployment Phase: Marketplace Listing</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Session</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Product Info */}
        <SectionCard title="Core Asset Identity" icon={Camera}>
          <div className="space-y-8">
            <div>
              <Label required>Asset Identity (Name)</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Hasselblad X2D 100C" required />
            </div>
            <div>
              <Label required>Asset Narrative (Description)</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                required
                placeholder="Detail the technical specifications, inclusion list, and current performance state…"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none
                  focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all resize-none placeholder-slate-300"
              />
            </div>
          </div>
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Monetization Strategy" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <Label required>Base Rental (₹)</Label>
              <Input type="number" name="rentalPrice" value={formData.rentalPrice} onChange={handleInputChange} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label>Security Bond (₹)</Label>
              <Input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleInputChange} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label required>Billing Interval</Label>
              <div className="relative group">
                <select
                  name="rentalDuration"
                  value={formData.rentalDuration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none
                    focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all appearance-none"
                >
                  {["hour", "day", "week", "month"].map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:rotate-180 transition-transform pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Label required>Performance State (Condition)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {["new", "excellent", "good", "fair", "poor"].map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, condition: cond }))}
                  className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.condition === cond
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 scale-105"
                    : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Categories */}
        <SectionCard title="Classification" icon={Tag}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none hover:border-indigo-200 transition-colors"
            >
              <span className="truncate pr-4">{selectedCategoryNames}</span>
              <ChevronDown size={20} className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${showCategoryDropdown ? "rotate-180" : ""}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-20 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((cat) => {
                    const isChecked = formData.category.includes(cat._id);
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => handleCategoryChange(cat._id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${isChecked
                          ? "bg-indigo-50 text-indigo-600 shadow-sm"
                          : "hover:bg-slate-50 text-slate-500"
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? "bg-indigo-600 border-indigo-600" : "border-slate-200 bg-white"}`}>
                          {isChecked && <Check size={12} className="text-white" />}
                        </div>
                        <span className="truncate font-black uppercase tracking-widest text-[9px]">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {formData.category.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.filter((c) => formData.category.includes(c._id)).map((c) => (
                <span key={c._id} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-sm">
                  {c.name}
                  <button type="button" onClick={() => handleCategoryChange(c._id)} className="hover:scale-125 transition-transform"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Location */}
        <SectionCard title="Geospatial Data" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label required>Nation (Country)</Label>
              <div className="relative group">
                <select
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none
                    focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all appearance-none"
                >
                  <option value="">Select country…</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>
            <div className="space-y-2">
              <Label required>Administrative Area (State)</Label>
              <Input name="location.state" value={formData.location.state} onChange={handleInputChange} placeholder="e.g. California" required />
            </div>
            <div className="space-y-2">
              <Label required>Sector (Area/City)</Label>
              <Input name="location.area" value={formData.location.area} onChange={handleInputChange} placeholder="e.g. Los Angeles" required />
            </div>
            <div className="space-y-2">
              <Label required>Postal Index (Pincode)</Label>
              <Input name="location.pincode" value={formData.location.pincode} onChange={handleInputChange} placeholder="Coordinates..." required />
            </div>
          </div>
        </SectionCard>

        {/* Images */}
        <SectionCard title="Visual Documentation" icon={ImageIcon}>
          <div className="space-y-6">
            <label className="group relative flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 cursor-pointer hover:border-indigo-400 hover:bg-slate-50/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Upload size={28} />
              </div>
              <div className="text-center">
                <p className="text-base font-black text-slate-900 tracking-tight">Deploy High-Resolution Mockups</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Supports PNG, JPG, WEBP • Max 10MB/unit</p>
              </div>
              {imagePreviewCount > 0 && (
                <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-right-2">
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                    <Check size={14} /> {imagePreviewCount} Units Secured
                  </span>
                </div>
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

            <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
                <Info size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 tracking-tight">Image Compliance</p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">High-quality visuals increase conversion velocity by up to 2.4x. Clear backgrounds and natural lighting are recommended.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Availability & Sale */}
        <SectionCard title="Availability Logic" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Toggle
              checked={formData.available}
              onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
              label="Instant Marketplace Activation"
            />
            <Toggle
              checked={formData.isForSale}
              onChange={(e) => setFormData((prev) => ({ ...prev, isForSale: e.target.checked }))}
              label="Enable Full Purchase Option"
            />
          </div>
          {formData.isForSale && (
            <div className="mt-8 pt-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-4">
              <div className="max-w-xs space-y-2">
                <Label>Legacy Acquisition Price (₹)</Label>
                <Input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} placeholder="0" />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full py-6 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl
            transition-all shadow-2xl shadow-indigo-100 disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-6"
        >
          {loading ? (
            <>
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="uppercase tracking-[0.2em] text-sm">Deploying Asset…</span>
            </>
          ) : (
            <>
              <span className="uppercase tracking-[0.2em] text-sm font-black">Finalize & Deploy Listing</span>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all">
                <Check size={28} />
              </div>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RentProductForm;
