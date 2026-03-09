import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
      const result = await axios.post(`${baseUrl}/login`, { email, password });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <section className="hidden lg:block">
            <img src={mainLogo} alt="JustRentIt" className="w-40 mb-8" />
            <p className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              Welcome Back
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Access your rental network in seconds.
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-xl">
              Continue managing listings, rental requests, and conversations from one clean dashboard.
            </p>
          </section>

          <section className="bg-white border border-gray-100 rounded-3xl shadow-xl p-6 sm:p-10">
            <div className="lg:hidden mb-6">
              <img src={mainLogo} alt="JustRentIt" className="w-32" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Log In</h2>
            <p className="mt-1 text-sm text-gray-500">Use your email or Google account.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3 transition-colors"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="mt-6 flex justify-center">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID_FIELD}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google login failed")}
                  text="continue_with"
                  shape="pill"
                  size="large"
                />
              </GoogleOAuthProvider>
            </div>

            <p className="mt-6 text-sm text-gray-600 text-center">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
                Create one
              </Link>
            </p>
          </section>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LogIn;
