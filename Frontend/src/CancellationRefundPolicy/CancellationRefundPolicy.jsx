import React from "react";
import "./CancellationRefundPolicy.css";

const CancellationRefundPolicy = () => {
  return (
    <div className="policy-container">
      <h1>Cancellation and Refund Policy</h1>

      <p>
        LK Tool Kit offers three service plans that deliver LinkedIn profile
        analysis at different speeds:
      </p>
      <ul>
        <li>$599 – Express Delivery (Immediate access)</li>
        <li>$899 – Standard Delivery (Within 6 hours)</li>
        <li>$1299 – Priority Delivery (Immediate, with priority handling)</li>
      </ul>

      <p>
        As all services are digitally delivered and begin processing
        immediately upon purchase, we do not offer cancellations, refunds, or
        exchanges for any of the plans.
      </p>

      <p>
        Please ensure you select the appropriate plan that meets your needs
        before completing your purchase. If you face any technical issues or
        require support, our team is here to assist you.
      </p>
    </div>
  );
};

export default CancellationRefundPolicy;
