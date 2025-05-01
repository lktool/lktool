import "./NavBar.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation(); // Get current path
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

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
    
    // Hide navbar on specific pages where it's not needed
    const hideNavbarPaths = ['/login', '/signup', '/forgot-password'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <div className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title" onClick={handleHome}>
                    <h2>LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    <div className="navbar-account">
                        <a href="#" onClick={(e) => {e.preventDefault(); handleAdmin();}}>Admin</a>
                    </div>
                    {isLoggedIn && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleFormData();}}>Form Data</a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleLogout();}}>Logout</a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBar;