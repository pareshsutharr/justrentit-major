import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiCamera, FiArrowRight } from "react-icons/fi";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";
import mainLogo from "../../../images/jri-logo.png";

const GOOGLE_CLIENT_ID_FIELD = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phoneNumber) => /^[0-9]{10}$/.test(phoneNumber);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfilePhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setProfilePhotoPreview(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePhone(phone)) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (profilePhoto && !profilePhoto.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    if (profilePhoto) formData.append("profilePhoto", profilePhoto);

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${baseUrl}/api/auth/register`, formData);
      if (!response.data.success) {
        toast.error(response.data.message || "Registration failed.");
        return;
      }

      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(backendMessage || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/google`, {
        credential: credentialResponse.credential,
      });
      if (!response.data.success) return;

      const { token, user: userDetails } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userDetails._id);
      localStorage.setItem("user", JSON.stringify(userDetails));
      navigate("/");
    } catch (error) {
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(backendMessage || "Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* Premium Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-50 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          <section className="hidden lg:block max-w-xl">
            <Link to="/" className="inline-block mb-12 transform hover:scale-105 transition-transform duration-300">
              <img src={mainLogo} alt="JustRentIt" className="h-10" />
            </Link>

            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100">
              Start Experiencing
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-8">
              Join the largest <br />
              <span className="text-indigo-600">rental eco-system.</span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
              Create your professional profile, list your high-value assets, and start earning or experiencing premium products today.
            </p>

            <div className="space-y-6">
              {['Verified Users Only', 'Secure Digital Contracts', 'Insta-Payouts'].map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  <span className="font-bold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div className="lg:hidden flex justify-center mb-10">
              <Link to="/">
                <img src={mainLogo} alt="JustRentIt" className="h-8" />
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-8 sm:p-12">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium">Set up your digital rental identity.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-100 border-dashed flex items-center justify-center overflow-hidden group-hover:border-indigo-200 transition-colors">
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FiCamera className="w-8 h-8 text-slate-300 group-hover:text-indigo-300 transition-colors" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95">
                      <FiCamera className="w-5 h-5" />
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Upload Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Full Name</label>
                    <div className="relative group">
                      <i className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <FiUser className="w-5 h-5" />
                      </i>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-3.5 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Phone</label>
                    <div className="relative group">
                      <i className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <FiPhone className="w-5 h-5" />
                      </i>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-3.5 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Email</label>
                  <div className="relative group">
                    <i className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <FiMail className="w-5 h-5" />
                    </i>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-3.5 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Password</label>
                  <div className="relative group">
                    <i className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <FiLock className="w-5 h-5" />
                    </i>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-3.5 pr-14 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {passwordVisible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? "Creating..." : (
                    <>
                      Build Profile <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-grow h-px bg-slate-100" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">or</span>
                <div className="flex-grow h-px bg-slate-100" />
              </div>

              <div className="flex justify-center transform hover:scale-[1.02] transition-transform">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID_FIELD}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google login failed")}
                    text="signup_with"
                    shape="pill"
                    size="large"
                    width="300px"
                  />
                </GoogleOAuthProvider>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-500 font-medium text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-indigo-600 hover:underline transition-all">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="light" />
    </div>
  );
}

export default SignUp;
