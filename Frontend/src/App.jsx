import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { unifiedAuthService } from './api/unifiedAuthService';  // Add this import
import Landing from "./Landing/Landing";
import Admin from "./Admin/Admin";
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

function App() {
  useEffect(() => {
    document.title = "LinkedIn Profile Analysis Tool";
    
    // Check for token expiration on app load
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token is still valid
          const isValid = await unifiedAuthService.verifyToken();
          if (!isValid) {
            unifiedAuthService.logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          unifiedAuthService.logout();
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
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Auth callback routes */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          
          {/* Protected Routes - Only for authenticated users */}
          <Route path="/inputMain" element={<ProtectedRoute><InputMain /></ProtectedRoute>} />
          <Route path="/my-submissions" element={<ProtectedRoute><UserSubmissions /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><FormData /></AdminRoute>} />
          
          {/* Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
