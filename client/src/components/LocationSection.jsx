import React, { useState } from "react";
import { FaMapMarkerAlt, FaMap } from "react-icons/fa";
// Assume LoadingForLocation is already imported
import LoadingForLocation from "./loadingpages/LoadingForLocation";

const LocationSection = () => {
  const [location, setLocation] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualState, setManualState] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualPincode, setManualPincode] = useState("");
  const [streetName, setStreetName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const statesAndCities = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    Karnataka: ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    TamilNadu: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer"],
  };

  const handleGetCurrentLocation = () => {
    setLoading(true); // Start loading
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
            .then((response) => response.json())
            .then((data) => {
              const { address } = data;
              const state = address.state || "";
              const city = address.city || address.town || address.village || "";
              const area = address.suburb || address.neighbourhood || "";
              const postalCode = address.postcode || "";
              const fullAddress = `${state} ${city}, ${area} - ${postalCode}`;
              setLocation({ fullAddress });
              setLoading(false); // Stop loading
            })
            .catch(() => {
              setError("Unable to retrieve address.");
              setLoading(false); // Stop loading
            });
        },
        () => {
          setError("Unable to retrieve your location. | Provide Location Permission");
          setLoading(false); // Stop loading
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false); // Stop loading
    }
  };

  const handleManualSubmit = () => {
    if (!manualState || !manualCity || !manualPincode || !streetName || !landmark) {
      setError("Please fill all fields to set the location manually.");
      return;
    }

    setLocation({
      fullAddress: `${streetName}, ${landmark}, ${manualCity}, ${manualState} - ${manualPincode}`,
    });
    setError(null);
    setManualOpen(false);
  };

  return (
    <>
      <div
        className="bg-light"
        style={{
          width: "100%",
          borderBottom: "2px solid #ccc",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="container text-left align-items-center d-flex justify-content-between"
          style={{ fontSize: "12px" }}
        >
          {/* Current Location Section */}
          <div className="d-flex align-items-center m-0">
            {location ? (
              <span>
                <strong>
                  <FaMapMarkerAlt className="me-2 text-primary" />
                </strong>{" "}
                {location.fullAddress}
              </span>
            ) : loading ? (
              <LoadingForLocation />
            ) : (
              <button
                onClick={handleGetCurrentLocation}
                className="btn btn-none py-1 align-items-center justify-content-center"
                style={{ fontWeight: "500", fontSize: "12px" }}
              >
                <FaMapMarkerAlt className="me-2" /> Detect My Location
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger w-50 py-1 align-items-center m-0">
              {error}
            </div>
          )}

          {/* Manual Location Button */}
          <div className="align-items-center">
            <button
              className="btn btn-none py-1 align-items-center justify-content-center"
              onClick={() => setManualOpen(true)}
              style={{ fontWeight: "500", fontSize: "12px" }}
            >
              <FaMap className="me-2" /> Choose Manually
            </button>
          </div>
        </div>

        {/* Manual Form Popup */}
        {manualOpen && (
          <div
            className="manual-popup"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              fontSize: "8px",
            }}
          >
            <div
              className="manual-popup-content"
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "25px",
                width: "90%",
                maxWidth: "400px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                position: "relative",
              }}
            >
              <h5 className="text-center mb-4 text-primary" style={{ fontSize: "14px" }}>
                Set Location Manually
              </h5>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  style={{ fontSize: "14px" }}
                >
                  <option value="">Select State</option>
                  {Object.keys(statesAndCities).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <select
                  className="form-select"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  disabled={!manualState}
                  style={{ fontSize: "14px" }}
                >
                  <option value="">Select City</option>
                  {manualState &&
                    statesAndCities[manualState].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Street Name"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Pincode"
                  value={manualPincode}
                  onChange={(e) => setManualPincode(e.target.value)}
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-success px-4"
                  onClick={handleManualSubmit}
                  style={{ fontSize: "14px" }}
                >
                  Set Location
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={() => setManualOpen(false)}
                  style={{ fontSize: "14px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LocationSection;
