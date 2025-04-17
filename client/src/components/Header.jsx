import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Image,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import SearchModal from "./SearchModal";
import NotificationComponent from "./NotificationComponent";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const Header = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
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
      setUser(JSON.parse(storedUser));
    }
    console.log(user);
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
  return (
    <>
      <Navbar bg="light" expand="xxl" className="shadow">
        <Container>
          <Navbar.Brand href="/">
            <img src="images/jri-logo.png" alt="Logo" width="160" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbar-nav" />

          {/* <div className="mx-auto d-flex align-items-center justify-content-center w-50">
            <Form className="d-flex w-100 position-relative">
              <FormControl
                type="search"
                placeholder="Search..."
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                style={{ maxWidth: '300px', width: '100%' }}
              />
              <Button variant="outline-success" onClick={() => setShowModal(true)}>
                Search
              </Button>
            </Form>
          </div> */}

          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto" style={{alignItems:'center'}}>
              <NavLink
                to="/"
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                Home
              </NavLink>
              {/* <NavLink
                to="/products"
                className={`nav-link ${
                  location.pathname === "/products" ? "active" : ""
                }`}
              >
                Rent a Product
              </NavLink> */}
              <NavLink
                to="/about"
                className={`nav-link ${
                  location.pathname === "/about" ? "active" : ""
                }`}
              >
                About Us
              </NavLink>
                {user ? (
                <NavDropdown
                  title={
                    <span>
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
                          className="me-2"
                        />
                      ) : (
                        <Image
                          src="images/default-image.png"
                          alt="Default Avatar"
                          roundedCircle
                          width="40"
                          height="40"
                          className="me-2"
                        />
                      )}
                      {user.name}
                    </span>
                  }
                  id="user-dropdown"
                >
                  {/* <NavDropdown.Item href="/profile">Profile</NavDropdown.Item> */}
                  <NavDropdown.Item href="/dashboard">
                    Dashboard
                  </NavDropdown.Item>
                  {user.role === "Admin" && (
                    <NavDropdown.Item href="/admin">
                      Admin Dashboard
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link href="/login">Login</Nav.Link>
              )}
               {user && (
                <Nav.Item className="mx-2">
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
