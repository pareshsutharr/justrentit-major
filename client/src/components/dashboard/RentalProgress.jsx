// src/components/dashboard/RentalProgress.jsx
import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Alert,
} from "@mui/material";
import {
  HourglassTop,
  TaskAlt,
  LocalShipping,
  Inventory,
  CheckCircle,
  AssignmentReturn,
  DoneAll,
  Cancel,
} from "@mui/icons-material";
import axios from "axios";
import Swal from "sweetalert2";
import "./RentalRequests.css";
import RatingPopup from "./RatingPopup";
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const statusSteps = [
  { label: "Pending", status: "pending", icon: <HourglassTop /> },
  { label: "Approved", status: "approved", icon: <TaskAlt /> },
  { label: "Shipped", status: "in_transit", icon: <LocalShipping /> },
  { label: "Delivered", status: "delivered", icon: <Inventory /> },
  { label: "In Use", status: "in_use", icon: <CheckCircle /> },
  {
    label: "Returning",
    status: "return_in_transit",
    icon: <AssignmentReturn />,
  },
  { label: "Returned", status: "returned", icon: <TaskAlt /> },
  { label: "Completed", status: "completed", icon: <DoneAll /> },
];

const RentalProgress = ({ request, userId, onUpdate }) => {
  const [otp, setOtp] = React.useState("");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState(null);
  const [showRating, setShowRating] = React.useState(false);

  const activeStep = statusSteps.findIndex(
    (step) => step.status === request.status
  );
  const isOwner = request?.owner?._id && userId === request.owner._id;
  const isRenter = request?.requester?._id && userId === request.requester._id;
  

  const handleOTPVerification = async () => {
    try {
      const response = await axios.put(
        `${baseUrl}/api/rental-requests/${request._id}/status`,
        { status: currentAction.targetStatus, otp }
      );
      onUpdate(response.data);
      setOpenDialog(false);
      setOtp("");
      Swal.fire("Success!", "Action completed successfully", "success");
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.error || "Verification failed",
        "error"
      );
    }
  };

  const sendOTPNotification = async (phoneNumber, otp) => {
    try {
      // Implement SMS integration here
      console.log(`Sending OTP ${otp} to ${phoneNumber}`);
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const handleStatusUpdate = async (targetStatus) => {
    try {
      const response = await axios.put(
         `${baseUrl}/api/rental-requests/${request._id}/status`,
        { status: targetStatus }
      );

      const updatedRequest = response.data;

      if (targetStatus === "in_transit") {
        await sendOTPNotification(
          request.owner.phone,
          updatedRequest.deliveryOTP
        );
      }

      if (targetStatus === "return_in_transit") {
        await sendOTPNotification(
          request.owner.phone,
          updatedRequest.returnOTP
        );
      }

      onUpdate(updatedRequest);
      Swal.fire("Success!", `Status updated to ${targetStatus}`, "success");
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response?.data?.error || "Update failed",
        "error"
      );
    }
  };

  const renderActionButton = () => {
    const actions = [];

    if (isOwner) {
      switch (request.status) {
        case "pending":
          actions.push(
            { label: "Approve", targetStatus: "approved" },
            { label: "Reject", targetStatus: "rejected" }
          );
          break;
        case "approved":
          actions.push({
            label: "Mark Shipped",
            targetStatus: "in_transit",
          });
          break;
        case "delivered":
          actions.push({ label: "Mark In Use", targetStatus: "in_use" });
          break;
        case "returned":
          actions.push({ label: "Complete Rental", targetStatus: "completed" });
          break;
        case "return_in_transit":
          actions.push({
            label: "Confirm Return",
            targetStatus: "returned",
            needsOTP: true,
          });
          break;
      }
    }

    if (isRenter) {
      switch (request.status) {
        case "in_transit":
          actions.push({
            label: "Confirm Delivery",
            targetStatus: "delivered",
            needsOTP: true,
          });
          break;
        case "in_use":
          actions.push({
            label: "Return Now",
            targetStatus: "return_in_transit",
          });
          break;
      }
    }

    return actions.map((action, index) => (
      <Button
        key={index}
        variant="contained"
        color="primary"
        onClick={() => {
          if (action.needsOTP) {
            setCurrentAction(action);
            setOpenDialog(true);
          } else {
            handleStatusUpdate(action.targetStatus);
          }
        }}
        sx={{ mt: 2, mx: 1 }}
      >
        {action.label}
      </Button>
    ));
  };

  if (request.status === "rejected") {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        This request has been rejected.
      </Alert>
    );
  }

  return (
    <Box
      sx={{ width: "100%", p: 3, backgroundColor: "#f8f9fa", borderRadius: 2 }}
    >
      <Stepper activeStep={activeStep} alternativeLabel>
        {statusSteps.map((step) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    color:
                      step.status === request.status
                        ? "primary.main"
                        : "grey.500",
                    fontSize: "2rem",
                  }}
                >
                  {step.icon}
                </Box>
              )}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {step.label}
              </Typography>
              {request.currentStatus.find((s) => s.stage === step.status)
                ?.timestamp && (
                <Typography variant="caption" display="block">
                  {new Date(
                    request.currentStatus.find(
                      (s) => s.stage === step.status
                    ).timestamp
                  ).toLocaleDateString()}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Delivery OTP shown to owner */}
      {request.status === "in_transit" && request.deliveryOTP && isOwner && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Delivery OTP: {request.deliveryOTP}
          <Button
            size="small"
            sx={{ ml: 2 }}
            onClick={() => navigator.clipboard.writeText(request.deliveryOTP)}
          >
            Copy
          </Button>
        </Alert>
      )}

      {/* Return OTP shown to owner */}
      {request.status === "return_in_transit" &&
        request.returnOTP &&
        isOwner && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Return OTP: {request.returnOTP}
            <Button
              size="small"
              sx={{ ml: 2 }}
              onClick={() => navigator.clipboard.writeText(request.returnOTP)}
            >
              Copy
            </Button>
          </Alert>
        )}
      {/* <RatingPopup 
    request={request} 
    userId={userId} 
    onClose={() => setShowRating(false)} 
  /> */}
      {/* 
{request.status === 'completed' && isRenter && (
  <Box sx={{ textAlign: 'center', mt: 2 }}>
    <Button
      variant="contained"
      color="secondary"
      onClick={() => setShowRating(true)}
    >
      Rate Experience
    </Button>
  </Box>
)} */}

      {/* {showRating && (
  <RatingPopup 
    request={request} 
    userId={userId} 
    onClose={() => setShowRating(false)} 
  />
)} */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Enter Verification Code
          </Typography>
          <TextField
            fullWidth
            label="4-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 4 }}
          />
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleOTPVerification}
            disabled={otp.length !== 4}
          >
            Verify & Continue
          </Button>
        </DialogContent>
      </Dialog>

      <Box sx={{ textAlign: "center", mt: 3 }}>{renderActionButton()}</Box>
    </Box>
  );
};

export default RentalProgress;
