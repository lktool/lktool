import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import NavBar from "./NavBar/NavBar"; // Import NavBar component

function App() {
  return (
    <>
      <Router>
        {/* Add NavBar outside of Routes so it appears on all pages */}
        <NavBar />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
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
          
          {/* Admin Route - separate from regular users */}
          <Route path="/admin" element={<Admin />} />
          
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
