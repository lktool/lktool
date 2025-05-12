import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
// Update import to use the new API structure
import { authService } from './api';
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
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Contact from "./Contact/Contact";

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
          
          {/* Auth callback routes */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          
          {/* Protected Routes - Only for authenticated users */}
          <Route path="/inputMain" element={<ProtectedRoute><InputMain /></ProtectedRoute>} />
          <Route path="/my-submissions" element={<ProtectedRoute><UserSubmissions /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PublicOnlyRoute adminRedirect="/admin/dashboard" userRedirect="/inputMain">
              <Admin />
            </PublicOnlyRoute>
          } />
          <Route path="/admin/dashboard" element={<AdminRoute><FormData /></AdminRoute>} />
          
          {/* Contact route - publicly accessible */}
          <Route path="/contact" element={<Contact />} />
          
          {/* Not Found Route */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
