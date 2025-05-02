import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing/Landing";
import Admin from "./Admin/Admin";
import Login from './Login/Login';
import Signup from "./SignUp/Signup";
import InputMain from "./InputMain.jsx/InputMain";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
/* import ResetPassword from "./ResetPassword/ResetPassword"; */
import GoogleAuthCallback from "./components/GoogleAuthCallback";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./VerifyEmail/VerifyEmail";  
import FormData from "./FormData/FormDate";
import AdminRoute from "./components/AdminRoute";
import NavBar from "./NavBar/NavBar"; // Import NavBar component
import UserSubmissions from "./UserSubmissions/UserSubmissions"; // Import UserSubmissions component

function App() {
  return (
    <>
      <Router>
        {/* Add NavBar outside of Routes so it appears on ALL pages */}
        <NavBar />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
{/*           <Route path="/reset-password/:uid/:token" element={<ResetPassword />} /> */}
          
          {/* FIXED: Use wildcard matching for tokens with special characters like : */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* UPDATED: Make sure this path exactly matches Google Cloud Console */}
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          
          {/* Protected Routes */}
          <Route 
            path="/inputMain" 
            element={
              <ProtectedRoute>
                <InputMain />
              </ProtectedRoute>
            } 
          />
          
          {/* Add User Submissions Route */}
          <Route 
            path="/my-submissions" 
            element={
              <ProtectedRoute>
                <UserSubmissions />
              </ProtectedRoute>
            } 
          />

          {/* Admin Login (Public) */}
          <Route path="/admin" element={<Admin />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <FormData />
            </AdminRoute>
          } />
          
          {/* Regular User Protected Routes */}
          <Route path="/formData" element={
            <ProtectedRoute>
              <FormData/> 
            </ProtectedRoute>}>
            </Route>
          
          {/* Not Found Route - will redirect to home */}
          <Route path="/not-found" element={<NotFound />} />
          
          {/* Catch All Route - redirects to Not Found */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
