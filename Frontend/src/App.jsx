import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
// Update import to use the new API structure
import { authService } from './api';
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
import Pricing from "./Pricing/Pricing";  // Add this import at the top with the other imports

function App() {
  useEffect(() => {
    document.title = "LinkedIn Profile Analysis Tool";
    
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
          
          {/* Protected Routes - Only for authenticated users */}
          <Route path="/inputMain" element={<ProtectedRoute><InputMain /></ProtectedRoute>} />
          <Route path="/my-submissions" element={<ProtectedRoute><UserSubmissions /></ProtectedRoute>} />
          
          {/* Admin Routes */}
{/*           <Route path="/admin" element={
            <PublicOnlyRoute adminRedirect="/admin/dashboard" userRedirect="/inputMain">
              <Admin />
            </PublicOnlyRoute>
          } /> */}
          <Route path="/admin/dashboard" element={<AdminRoute><FormData /></AdminRoute>} />
          <Route path="/admin/reviewed" element={<AdminRoute><ReviewedSubmissions /></AdminRoute>} />
          
          {/* Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
