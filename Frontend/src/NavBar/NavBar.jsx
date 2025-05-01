import "./NavBar.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation(); // Get current location
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdminPath, setIsAdminPath] = useState(false);
    
    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        // Check if current path is admin
        setIsAdminPath(location.pathname === '/admin');
    }, [location]);

    function handleAdmin() {
        navigate('/admin');
    }
    
    function handleHome() {
        navigate('/');
    }
    
    function handleFormData() {
        navigate('/formData');
    }
    
    function handleLogout() {
        // Clear user authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
        // Redirect to login page
        navigate('/login');
    }

    // Don't show navbar on login, signup, and forgot password pages
    if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
        return null;
    }

    return (
        <div className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title">
                    <h2 onClick={handleHome} className="logo-text">LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    {!isAdminPath && (
                        <div className="navbar-account">
                            <a href="#" onClick={(e) => {e.preventDefault(); handleAdmin();}}>
                                Admin
                            </a>
                        </div>
                    )}
                    
                    {isLoggedIn && (
                        <>
                            {location.pathname !== '/formData' && (
                                <div className="navbar-form-data">
                                    <a href="#" onClick={(e) => {e.preventDefault(); handleFormData();}}>
                                        Form Data
                                    </a>
                                </div>
                            )}
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleLogout();}}>
                                    Logout
                                </a>
                            </div>
                        </>
                    )}
                    
                    {!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/' && (
                        <div className="navbar-login">
                            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}>
                                Login
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBar;