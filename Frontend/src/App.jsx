import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home/Home';
import Login from './Login/Login';
import Signup from './SignUp/Signup'; // Fixed case sensitivity issue
import Admin from './Admin/Admin';
import AdminDashboard from './FormData/FormDate';
import InputMain from './InputMain/InputMain';
import UserSubmissions from './UserSubmissions/UserSubmissions';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="admin" element={<Admin />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          {/* Protected routes with role-based access */}
          <Route 
            path="inputMain" 
            element={
              <ProtectedRoute>
                <InputMain />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="my-submissions" 
            element={
              <ProtectedRoute>
                <UserSubmissions />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
