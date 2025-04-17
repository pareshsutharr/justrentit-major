import React from 'react';

const PriceBreakdown = ({ totalPrice, securityDeposit }) => (
  <div className="price-breakdown mb-4">
    <div className="d-flex justify-content-between">
      <span>Rental Cost:</span>
      <span>₹{totalPrice}</span>
    </div>
    {securityDeposit > 0 && (
      <div className="d-flex justify-content-between">
        <span>Security Deposit:</span>
        <span>₹{securityDeposit}</span>
      </div>
    )}
    <div className="d-flex justify-content-between fw-bold">
      <span>Total Payable:</span>
      <span>₹{totalPrice + securityDeposit}</span>
    </div>
  </div>
);

export default PriceBreakdown;