import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { authService } from './api';
// Remove the UserProvider import as we're only using SubscriptionProvider for now
import { SubscriptionProvider } from './context/SubscriptionContext';
import Landing from "./Landing/Landing";
/* import Admin from "./Admin/Admin"; */
import Login from './Login/Login';
import Signup from "./SignUp/Signup";
import InputMain from "./InputMain.jsx/InputMain";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./VerifyEmail/VerifyEmail";  
import FormData from "./FormData/FormDate";
import AdminRoute from "./components/AdminRoute";
import NavBar from "./NavBar/NavBar"; 
import UserSubmissions from "./UserSubmissions/UserSubmissions";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ResetPassword from "./ResetPassword/ResetPassword";
import ReviewedSubmissions from "./Admin/ReviewedSubmissions";
import Pricing from "./Pricing/Pricing"; 
import BlankPage from "./BlankPage/BlankPage";
import UserSubscriptionManager from "./Admin/UserSubscriptionManager"; // Add this import
import SubmissionDetails from "./UserSubmissions/SubmissionDetails";
import CancellationRefundPolicy from "./CancellationRefundPolicy/CancellationRefundPolicy"
import ContactUs from "./ContactUs/ContactUs"
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy"
import ShippingDeliveryPolicy from "./ShippingDeliveryPolicy/ShippingDeliveryPolicy"
import TermsAndConditions from "./TermsAndConditions/TermsAndConditions"
import Footer from "./components/Footer"; // Add Footer import

function App() {
  useEffect(() => {
    document.title = "LK Tool Kit";
    
    // Check for token expiration on app load
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token is still valid
          const isValid = await authService.verifyToken();
          if (!isValid) {
            authService.logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      }
    };
    
    checkToken();
  }, []);

  return (
    <>
      <SubscriptionProvider>
        <Router>
          <NavBar />
          
          <Routes>
            {/* Public Routes - redirect authenticated users */}
            <Route path="/" element={
              <PublicOnlyRoute>
                <Landing />
              </PublicOnlyRoute>
            } />
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/signup" element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Add the pricing route - accessible to all */}
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Add the password reset route */}
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            
            {/* Auth callback routes */}
            {/* Update this route to match the backend format with uid-token */}
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            
            {/* This route handles the Google OAuth callback - matches the redirect URI */}
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            <Route path="/terms_and_conditions" element={<TermsAndConditions/>}/>
            <Route path="/privacy_policy" element={<PrivacyPolicy/>}/>
            <Route path="/shipping_delivery_policy" element={<ShippingDeliveryPolicy/>}/>
            <Route path="/contact_us" element={<ContactUs/>}/>
            <Route path="/cancellation_refund_policy" element={<CancellationRefundPolicy/>}/>
            
            {/* Protected Routes - Only for authenticated users */}
            <Route path="/inputMain" element={<ProtectedRoute><InputMain /></ProtectedRoute>} />
            <Route path="/my-submissions" element={<ProtectedRoute><UserSubmissions /></ProtectedRoute>} />
            <Route path="/submission/:id" element={<ProtectedRoute><SubmissionDetails /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><FormData /></AdminRoute>} />
            <Route path="/admin/reviewed" element={<AdminRoute><ReviewedSubmissions /></AdminRoute>} />
            <Route path="/admin/subscriptions" element={<AdminRoute><UserSubscriptionManager /></AdminRoute>} />
            
            {/* Blank Page Route - for testing or empty state */}
            <Route path="/blank-page" element={<BlankPage />} />
            
            {/* Not Found Route */}
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
          <Footer /> {/* Add Footer below Routes */}
        </Router>
      </SubscriptionProvider>
    </>
  );
}

export default App;
