import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import Cookies from "js-cookie"; // For handling cookies
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const GOOGLE_CLIENT_ID_FIELD = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const baseUrl = import.meta.env.VITE_API_BASE_URL;

function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const navigate = useNavigate();
  useEffect(() => {
    // console.log(GOOGLE_CLIENT_ID_FIELD); // Should print the correct value
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
  axios
    .post(`${baseUrl}/login`, { email, password })
    .then((result) => {
      if (result.data.success) {
        const { token, user } = result.data;
        localStorage.setItem('token', token); // Store the token
        localStorage.setItem('userId', user._id);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/home");
      } else {
          toast.error(result.data.message || "An error occurred. Please try again.");
        }
      })
      .catch((err) => {
        toast.error("An error occurred. Please try again.");
        console.log(err);
      });
  };
 
  
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${baseUrl}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token); // Store the token
        localStorage.setItem('userId', user._id);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/home');
      }
    }catch (error) {
      toast.error('Google authentication failed');
    }
  };
  
  const handleGoogleError = () => {
    toast.error('Google login failed');
  };
  


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <img src="images/jri-logo.png" alt="Rentify Logo" style={styles.logo} />
        <div style={styles.textContent}>
          <h1 style={styles.welcomeText}>Seamless Product Rentals</h1>
          <p style={styles.description}>
            Your go-to platform for sharing and renting products with ease.
          </p>
        </div>
      </div>
      <div style={styles.rightPanel}>
        <div style={styles.card} className="fade-in">
          <h2 style={styles.cardTitle}>Log In</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
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
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
                <span onClick={togglePasswordVisibility} style={styles.eyeIcon}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <button type="submit" style={styles.button}>
              Log In
            </button>

          </form>

          <div style={styles.linkContainer}>
            <p>
              Don't have an account?{" "}
              <Link to="/register" style={styles.link}>
                Register
              </Link>
            </p>
          </div>
          <div style={styles.socialLogin} >
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
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.95rem",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    backgroundColor: "#f9f9f9",
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
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#aaa",
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

export default LogIn;
