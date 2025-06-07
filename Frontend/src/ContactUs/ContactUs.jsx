import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>
        We’re here to help! Whether you have questions about our service, need
        help accessing your report, or want to share feedback - we’d love to
        hear from you.
      </p>

      <h2>Email Support</h2>
      <p>
        For all inquiries, please reach out to us at:{" "}
        <strong>lktoolb@gmail.com</strong>
      </p>

      <h2>Support Hours</h2>
      <p>Monday to Friday: 10 AM – 7 PM (USD)</p>
      <p>Closed on Saturday , Sundays and Public Holidays</p>

      <h2>Quick Help</h2>
      <p>
        Visit our{" "}
        <a href="#" target="_blank" rel="noopener noreferrer">
          Help Center / FAQ page
        </a>{" "}
        for answers to common questions.
      </p>
    </div>
  );
};

export default ContactUs;
