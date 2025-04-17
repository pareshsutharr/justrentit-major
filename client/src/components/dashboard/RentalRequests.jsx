import React, { useState, useEffect, Suspense } from "react";
import {
  Tabs,
  Tab,
  Card,
  Button,
  Spinner,
  Alert,
  Image,
  Badge,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { format, formatDistance, differenceInHours } from "date-fns";
import "./RentalRequests.css";
import { MdDescription } from "react-icons/md";
import LoadingPage from "../loadingpages/LoadingPage";
import RatingPopup from "./RatingPopup";
// import { MantineProvider } from "@mantine/core";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

import FilterComponent from "./FilterComponent";
const RentalProgress = React.lazy(() => import("./RentalProgress"));

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  in_transit: "info",
  delivered: "primary",
  in_use: "secondary",
  return_in_transit: "info",
  returned: "success",
  completed: "dark",
};

const RentalRequests = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCompletedRequest, setSelectedCompletedRequest] =
    useState(null);
  const [filters, setFilters] = useState({
    productName: "",
    selectedStatuses: [],
    startDate: "",
    endDate: "",
    selectedCategories: [],
    minPrice: "",
    maxPrice: "",
    locationArea: "",
  });

  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
        `${baseUrl}/api/categories`
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      productName: "",
      selectedStatuses: [],
      startDate: "",
      endDate: "",
      selectedCategories: [],
      minPrice: "",
      maxPrice: "",
      locationArea: "",
    });
  };

  const fetchRequests = async (type) => {
    try {
      setLoading(true);
      const response = await axios.get(
  `${baseUrl}/api/rental-requests`,
        { params: { userId, type } }
      );
      const sortedRequests = response.data.requests.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRequests(sortedRequests);
      setError("");
    } catch (err) {
      setError("Failed to fetch requests");
      setRequests([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchRequests(activeTab);
  }, [activeTab, userId]);

  useEffect(() => {
    const filtered = requests.filter((request) => {
      const product = request.product || {};
      const requestStartDate = new Date(request.startDate);
      const requestEndDate = new Date(request.endDate);

      return (
        product.name
          ?.toLowerCase()
          .includes(filters.productName.toLowerCase()) &&
        (filters.selectedStatuses.length === 0 ||
          filters.selectedStatuses.includes(request.status)) &&
        (!filters.startDate ||
          requestStartDate >= new Date(filters.startDate)) &&
        (!filters.endDate || requestEndDate <= new Date(filters.endDate)) &&
        (filters.selectedCategories.length === 0 ||
          (product.category &&
            filters.selectedCategories.includes(product.category))) &&
        (!filters.minPrice ||
          product.rentalPrice >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice ||
          product.rentalPrice <= parseFloat(filters.maxPrice)) &&
        (!filters.locationArea ||
          product.location?.area
            ?.toLowerCase()
            .includes(filters.locationArea.toLowerCase()))
      );
    });
    setFilteredRequests(filtered);
  }, [requests, filters]);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const response = await axios.put(
         `${baseUrl}/api/rental-requests/${requestId}/status`,
        { status }
      );
      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? response.data : req))
      );
      Swal.fire("Success!", `Request ${status} successfully`, "success");
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.error || "Update failed",
        "error"
      );
    }
  };

  const renderRequests = () => {
    if (loading) return <LoadingPage />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    if (!filteredRequests.length)
      return <Alert variant="info">No requests found</Alert>;

    return filteredRequests.map((request) => {
      const product = request.product || {};
      const isNewRequest =
        differenceInHours(new Date(), new Date(request.createdAt)) < 24;
      const isCompleted = request.status === "completed";

      return (
        <Card
          key={request._id}
          className={`mb-4 shadow-sm ${
            isNewRequest ? "highlight-new-request" : ""
          }`}
          style={
            isCompleted ? { backgroundColor: "#f0f0f0", opacity: 0.6 } : {}
          }
        >
          <Card.Body>
            <Row>
              <Col md={4} className="mb-3">
                <div className="position-relative">
                  <Image
                    src={
                      product.images?.[0]
                        ?  `${baseUrl}${product.images[0]}`
                        : "/images/about-image.jpg"
                    }
                    thumbnail
                    className="rental-product-image"
                    style={{ height: "250px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "/images/about-image.jpg";
                    }}
                  />
                  <Badge
                    bg="info"
                    className="position-absolute top-0 start-0 m-2"
                  >
                    {request.product.condition}
                  </Badge>
                  {isNewRequest && (
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 end-0 m-2"
                    >
                      New
                    </Badge>
                  )}
                </div>
              </Col>

              <Col md={8}>
                <div className="d-flex flex-column h-100">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <h4>{request.product.name}</h4>
                      <div className="text-muted mb-2">
                        <span className="me-3">
                          ₹{request.product.rentalPrice}/day
                        </span>
                        <span>
                          Deposit: ₹{request?.product?.securityDeposit}
                        </span>
                      </div>
                      <div>
                        <MdDescription color="green" />{" "}
                        <span style={{ fontSize: "16px", fontWeight: 200 }}>
                          {request?.product?.description}
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <Image
                          src={
                            request.owner?.profilePhoto
                              ?  `${baseUrl}${request.owner.profilePhoto}`
                              : "/images/default-profile.png"
                          }
                          roundedCircle
                          width={40}
                          height={40}
                          className="me-2"
                        />

                        <div>
                          <h6 className="mb-0">{request.owner.name}</h6>
                          <small className="text-muted">
                            Rating: {request.owner.ratings || "N/A"}
                          </small>
                        </div>
                      </div>
                    </div>
                    <Badge
                      bg={statusColors[request.status]}
                      pill
                      className="align-self-start"
                    >
                      {request.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="rental-meta mb-3">
                    <Row>
                      <Col md={4}>
                        <div className="text-muted">
                          <small>Start Date</small>
                          <div className="fw-bold">
                            {format(new Date(request.startDate), "PP")}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-muted">
                          <small>End Date</small>
                          <div className="fw-bold">
                            {format(new Date(request.endDate), "PP")}
                          </div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="text-muted">
                          <small>Duration</small>
                          <div className="fw-bold">
                            {formatDistance(
                              new Date(request.startDate),
                              new Date(request.endDate)
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
              {request.status !== "rejected" && !isCompleted && (
                <Suspense fallback={<Spinner animation="border" />}>
                  <RentalProgress
                    request={request}
                    userId={userId}
                    onUpdate={(updatedRequest) => {
                      setRequests(
                        requests.map((req) =>
                          req._id === updatedRequest._id ? updatedRequest : req
                        )
                      );
                    }}
                  />
                </Suspense>
              )}
            </Row>
            <div className="mt-3">
              {request.status === "completed" && (
                <Button
                  variant="primary"
                  onClick={() => setSelectedCompletedRequest(request)}
                >
                  Rate Experience
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      );
    });
  };

  return (
    <div className="container px-4 " style={{ border: "1px" }}>
      {/* <h className="mb-4">Rental Management</h> */}
      <div>
        <FilterComponent
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      </div>
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4" fill>
        <Tab eventKey="received" title="Received Requests">
          {renderRequests()}
        </Tab>
        <Tab eventKey="sent" title="Sent Requests">
          {renderRequests()}
        </Tab>
      </Tabs>
      {/* {selectedCompletedRequest && (
        <RatingPopup
          request={selectedCompletedRequest}
          userId={userId}
          onClose={() => setSelectedCompletedRequest(null)}
        />
      )} */}
    </div>
  );
};

export default RentalRequests;
