import React from "react";
import "./ShippingDeliveryPolicy.css";

const ShippingDeliveryPolicy = () => {
  return (
    <div className="policy-container">
      <h1>Shipping and Delivery Policy</h1>
      <p><strong>Effective Date:</strong> 05/06/2025</p>
      <p>
        At LK Tool Kit, all services are digital and accessible directly through
        our website. There is no physical shipping or email delivery involved.
      </p>

      <h2>1. Service Delivery Options</h2>
      <p>LK Tool Kit offers three service plans:</p>
      <ul>
        <li>$599 – Standard Delivery: Results available immediately</li>
        <li>$899 – Express Delivery: Results available within 6 hours</li>
        <li>$1299 – Priority Delivery: Instant access with priority processing</li>
      </ul>
      <p>Your selected plan determines how quickly your profile analysis will be ready.</p>

      <h2>2. Delivery Method</h2>
      <p>
        Once your analysis is processed, your results will be accessible only
        through your user dashboard on our website. You must be logged in to
        view your report.
      </p>
      <p>No email, download, or physical delivery is provided.</p>

      <h2>3. No Physical or Email Delivery</h2>
      <p>
        All services are digital and web-based. We do not send reports via email,
        and there is no option for physical shipping or downloadable files.
      </p>

      <h2>4. Support</h2>
      <p>
        If you experience any issues accessing your report, please reach out to
        us at: <strong>lktoolb@gmail.com</strong>
      </p>
    </div>
  );
};

export default ShippingDeliveryPolicy;
