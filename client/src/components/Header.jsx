import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Image,
} from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import SearchModal from "./SearchModal";
import NotificationComponent from "./NotificationComponent";
import "./Header.css";
import mainLogo from "../../images/jri-logo.png";
import defaultProfileImage from "../../images/default-image.png";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const Header = () => {
  const [user, setUser] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  // const handleSearchChange = async (e) => {
  //   const query = e.target.value;
  //   setSearchQuery(query);

  //   if (!query.trim()) {
  //     setFilteredProducts([]);
  //     setFilteredCategories([]);
  //     setShowModal(false);
  //     return;
  //   }

  //   try {
  //     const response = await axios.get('http://localhost:3001/api/products/search', {
  //       params: { query },
  //     });

  //     if (response.data.success) {
  //       setFilteredProducts(response.data.products || []);
  //       setFilteredCategories(response.data.categories || []);
  //       setShowModal(true);
  //     } else {
  //       console.error('API response failed:', response.data);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching products:', err);
  //   }
  // };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);


  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId"); // Retrieve stored userId
      if (!userId) return;

      try {
        const response = await axios.get(`${baseUrl}/api/user/${userId}`);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
  ];

  return (
    <>
      <Navbar expand="xxl" className="app-navbar-wrap sticky-top">
        <Container fluid className="app-navbar-shell">
          <Navbar.Brand as={NavLink} to="/" className="brand-wrap">
            <img src={mainLogo} alt="JustRentIt" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" className="app-navbar-toggle" />

          <Navbar.Collapse id="navbar-nav" className="app-navbar-collapse">
            <Nav className="app-center-nav">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="app-nav-link">
                  {item.label}
                </NavLink>
              ))}
            </Nav>

            <Nav className="app-right-nav align-items-center">
              {user ? (
                <NavDropdown
                  className="profile-dropdown"
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      {user.profilePhoto ? (
                        <Image
                          src={
                            user.profilePhoto.startsWith("http")
                              ? user.profilePhoto
                              : `${baseUrl}${user.profilePhoto}`
                          }
                          alt="User"
                          roundedCircle
                          width="35"
                          height="35"
                          className="me-1"
                        />
                      ) : (
                        <Image
                          src={defaultProfileImage}
                          alt="Default Avatar"
                          roundedCircle
                          width="40"
                          height="40"
                          className="me-1"
                        />
                      )}
                      <span>{user.name}</span>
                    </span>
                  }
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={NavLink} to="/dashboard">
                    Dashboard
                  </NavDropdown.Item>
                  {user.role === "Admin" && (
                    <NavDropdown.Item as={NavLink} to="/admin">
                      Admin Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <NavLink to="/login" className="app-btn-outline">
                    Sign in
                  </NavLink>
                  <NavLink to="/register" className="app-primary-cta">
                    Get Started
                  </NavLink>
                </>
              )}

              <NavLink to={user ? "/dashboard" : "/register"} className="app-list-btn">
                List Product
              </NavLink>

              {user && (
                <Nav.Item className="app-bell-wrap ms-1">
                  <NotificationComponent userId={user._id} />
                </Nav.Item>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <SearchModal
        show={showModal}
        onHide={() => setShowModal(false)}
        products={filteredProducts}
        categories={filteredCategories}
      />
    </>
  );
};

export default Header;
