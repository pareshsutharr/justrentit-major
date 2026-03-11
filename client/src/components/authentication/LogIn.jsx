import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FiEye, FiEyeOff, FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "react-toastify/dist/ReactToastify.css";
import mainLogo from "../../../images/jri-logo.png";

const GOOGLE_CLIENT_ID_FIELD = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
      if (!result.data.success) {
        toast.error(result.data.message || "Login failed. Please try again.");
        return;
      }

      const { token, user } = result.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(backendMessage || "Login failed. Please try again.");
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

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("user", JSON.stringify(user));
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
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 blur-[120px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-50 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Content Section */}
          <section className="hidden lg:block max-w-xl">
            <Link to="/" className="inline-block mb-12 transform hover:scale-105 transition-transform duration-300">
              <img src={mainLogo} alt="JustRentIt" className="h-10" />
            </Link>

            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100">
              Welcome Back
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] mb-8">
              Your rental network <br />
              <span className="text-indigo-600">is waiting for you.</span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
              Sign in to continue managing your listings, track active rentals, and connect with India's largest localized rental community.
            </p>

            <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 ring-2 ring-slate-50" />
                ))}
              </div>
              <span>Join 10k+ active users</span>
            </div>
          </section>

          {/* Form Section */}
          <section className="relative">
            <div className="lg:hidden flex justify-center mb-10">
              <Link to="/">
                <img src={mainLogo} alt="JustRentIt" className="h-8" />
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-premium p-8 sm:p-12 relative">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-50/50 blur-2xl rounded-full -z-10" />

              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sign In</h2>
                <p className="text-slate-500 font-medium">Access your premium rental workspace.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <FiMail className="w-5 h-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-4 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 px-1">
                    <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Password
                    </label>
                    <Link to="/forgot-password" size="sm" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <FiLock className="w-5 h-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-12 py-4 pr-14 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-medium text-slate-900 placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Authenticating..." : (
                    <>
                      Sign In <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-10 flex items-center gap-4">
                <div className="flex-grow h-px bg-slate-100" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow h-px bg-slate-100" />
              </div>

              <div className="flex justify-center transform hover:scale-[1.02] transition-transform">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID_FIELD}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google login failed")}
                    text="continue_with"
                    shape="pill"
                    size="large"
                    width="300px"
                  />
                </GoogleOAuthProvider>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-500 font-medium text-sm">
                  New to JustRentIt?{" "}
                  <Link to="/register" className="font-bold text-indigo-600 hover:underline transition-all">
                    Join the club
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

export default LogIn;
