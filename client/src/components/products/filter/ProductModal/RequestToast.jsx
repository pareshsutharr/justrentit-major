import React, { useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const RequestToast = () => {
  const [showToast, setShowToast] = useState(false);

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
      >
        <Toast.Header className="bg-success text-white">
          <strong className="me-auto">Success!</strong>
        </Toast.Header>
        <Toast.Body>Rental request sent successfully!</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default RequestToast;