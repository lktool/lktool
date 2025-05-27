import React from 'react';
import { Link } from 'react-router-dom';
import './BlankPage.css';

const BlankPage = () => {
  return (
    <div className="blank-page-container">
      <div className="blank-page-content">
        <h1>Thank You for Your Interest!</h1>
        <p>This feature is currently under development.</p>
        <p>We're working hard to bring you the best LinkedIn profile analysis experience.</p>
        <Link to="/signup" className="cta-button">Get Started with Free Plan</Link>
        <Link to="/pricing" className="back-link">Back to Pricing</Link>
      </div>
    </div>
  );
};

export default BlankPage;
