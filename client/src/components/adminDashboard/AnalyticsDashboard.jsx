import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
Chart.register(...registerables);

const AnalyticsDashboard = () => {
  const [userStats, setUserStats] = useState({});
  const [productStats, setProductStats] = useState({});
  const [rentalStats, setRentalStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, productsRes, rentalsRes] = await Promise.all([
          axios.get(`${baseUrl}/api/analytics/users`),
          axios.get(`${baseUrl}/api/analytics/products`),
          axios.get(`${baseUrl}/api/analytics/rentals`),
        ]);

        setUserStats(usersRes.data);
        setProductStats(productsRes.data);
        setRentalStats(rentalsRes.data);
        console.log(rentalStats);
      } catch (error) {
        toast.error("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);
  useEffect(() => {
    console.log("Rental Stats:", rentalStats);
  }, [rentalStats]);
  // User Analytics Charts
  const userSignupData = {
    labels: userStats.signups?.map((s) =>
      new Date(s.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "User Signups",
        data: userStats.signups?.map((s) => s.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const userRoleData = {
    labels: ["Users", "Admins"],
    datasets: [
      {
        data: [
          userStats.totalUsers - userStats.adminCount,
          userStats.adminCount,
        ],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Product Analytics Charts
  const productCategoryData = {
    labels: productStats.categories?.map((c) => c._id),
    datasets: [
      {
        label: "Products per Category",
        data: productStats.categories?.map((c) => c.count),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const productStatusData = {
    labels: ["Available", "Rented", "For Sale"],
    datasets: [
      {
        data: [
          productStats.availableCount,
          productStats.rentedCount,
          productStats.forSaleCount,
        ],
        backgroundColor: ["#4BC0C0", "#FF9F40", "#9966FF"],
      },
    ],
  };
  const totalRevenue = rentalStats.totalRevenue || 0; // Default to 0 if no data

  // Rental Analytics Charts
  const rentalStatusData = {
    labels: Object.keys(rentalStats.statusDistribution || {}),
    datasets: [
      {
        label: "Rental Status",
        data: Object.values(rentalStats.statusDistribution || {}),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };

  const rentalRevenueData = {
    labels: rentalStats.monthlyRevenue?.map((r) => r.month),
    datasets: [
      {
        label: "Monthly Revenue (USD)",
        data: rentalStats.monthlyRevenue?.map((r) => r.revenue),
        borderColor: "#32CD32",
        fill: false,
      },
    ],
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <ToastContainer />
      <h2 className="my-4 text-center text-primary">
        Platform Analytics Dashboard
      </h2>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <Card.Text className="display-6 text-primary">
                {userStats.totalUsers}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <Card.Text className="display-6 text-success">
                {productStats.totalProducts}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Active Rentals</Card.Title>
              <Card.Text className="display-6 text-warning">
                {rentalStats.activeRentals}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
       
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>User Signups Trend</Card.Title>
              <Line data={userSignupData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>User Roles Distribution</Card.Title>
              <Doughnut data={userRoleData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>Products by Category</Card.Title>
              <Bar data={productCategoryData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>Product Availability</Card.Title>
              <Pie data={productStatusData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>Rental Status Distribution</Card.Title>
              <Bar data={rentalStatusData} options={{ indexAxis: "y" }} />
            </Card.Body>
          </Card>
        </Col>
      
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;
