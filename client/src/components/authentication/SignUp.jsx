import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const GOOGLE_CLIENT_ID_FIELD = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Phone number validation
  const validatePhone = (phoneNumber) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phoneNumber);
  };

  // Form submission logic
  const handleSubmit = (e) => {
    e.preventDefault();

    // Password validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    // Profile photo validation (optional)
    if (profilePhoto) {
      if (!profilePhoto.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }

      const fileSizeInMB = profilePhoto.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        toast.error("Profile photo size must be less than 5MB.");
        return;
      }
    }

    // Create FormData for registration submission
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    if (profilePhoto) {
      formData.append("profilePhoto", profilePhoto);
    }

    axios
      .post(`${baseUrl}/register`, formData)
      .then((response) => {
        if (response.data.success) {
          Cookies.set('user', JSON.stringify({
            name: response.data.user.name,
            email: response.data.user.email
          }), { expires: 7 });

          toast.success("Registration successful! You can now log in.");
          navigate("/login");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch(() => {
        toast.error("Error occurred, please try again.");
      });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/google`, {
        credential: credentialResponse.credential
      });
  
      if (response.data.success) {
        const userDetails = response.data.user;
        // Add this line to store userId properly
        localStorage.setItem('userId', JSON.stringify(userDetails._id));
        localStorage.setItem('user', JSON.stringify(userDetails));
        Cookies.set('userDetails', JSON.stringify(userDetails), { expires: 7 });
        navigate('/home');
      }
    } catch (error) {
      toast.error('Google authentication failed');
    }
  };

   const handleGoogleError = () => {
      toast.error('Google login failed');
    };
    
  

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <img src="images/jri-logo.png" alt="Rentify Logo" style={styles.logo} />
        <div style={styles.textContent}>
          <h1 style={styles.welcomeText}>Join our community today</h1>
          <p style={styles.description}>
            Register now and start renting and sharing products easily.
          </p>
        </div>
      </div>
      <div style={styles.rightPanel}>
        <div style={styles.card} className="fade-in">
          <h2 style={styles.cardTitle}>Sign Up</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="name" style={styles.label}>Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                required
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="phone" style={styles.label}>Phone</label>
              <input
                type="text"
                id="phone"
                placeholder="Enter your phone"
                required
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
                <span
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeIcon}
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="profilePhoto" style={styles.label}>Profile Photo</label>
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.button}>Sign Up</button>
          </form>
          <br/>
          <div style={styles.socialLogin}>
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID_FIELD}>
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      text="continue_with"
      shape="pill"
      size="large"
    />
  </GoogleOAuthProvider>
</div>
          <div style={styles.linkContainer}>
            <p>
              Already have an account?{" "}
              <Link to="/login" style={styles.link}>Log In</Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
      <style>{animationsCSS}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Poppins', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(180deg, #6accc7, #00658b)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    textAlign: "center",
    padding: "40px",
  },
  logo: {
    width: "120px",
    height: "auto",
    marginBottom: "20px",
  },
  textContent: {
    maxWidth: "350px",
  },
  welcomeText: {
    fontSize: "2.4rem",
    marginBottom: "15px",
  },
  description: {
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#e0f7f5",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  cardTitle: {
    marginBottom: "25px",
    fontSize: "1.8rem",
    color: "#333",
  },
  form: {
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.95rem",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#555",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#51b59f",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "all 0.3s ease",
  },
  linkContainer: {
    marginTop: "15px",
  },
  link: {
    color: "#51b59f",
    textDecoration: "none",
    fontWeight: "500",
  },
};

const animationsCSS = `
  .fade-in {
    animation: fadeIn 1s ease-in-out;
  }

  button:hover {
    background-color: #00658b !important;
    transform: scale(1.05);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default SignUp;
