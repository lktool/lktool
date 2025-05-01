import "./NavBar.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation(); // Get current path
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isLandingPage, setIsLandingPage] = useState(false);
    const [isAdminPage, setIsAdminPage] = useState(false);
    const [isInputMain, setIsInputMain] = useState(false);
    
    // Check authentication state when component mounts or location changes
    useEffect(() => {
        // Check user login status
        const userToken = localStorage.getItem('token');
        setIsUserLoggedIn(!!userToken);
        
        // Check admin login status
        const adminToken = localStorage.getItem('adminToken');
        setIsAdminLoggedIn(!!adminToken);
        
        // Check if we're on landing page
        setIsLandingPage(location.pathname === '/');
        
        // Check if we're on admin pages
        setIsAdminPage(location.pathname.startsWith('/admin'));
        
        // Check if we're on inputMain page
        setIsInputMain(location.pathname === '/inputMain');
        
    }, [location.pathname]);

    function handleAdmin() {
        navigate('/admin');
    }
    
    function handleHome() {
        navigate('/');
    }
    
    function handleFormData() {
        navigate('/formData');
    }
    
    function handleLogin() {
        navigate('/login');
    }
    
    function handleSignup() {
        navigate('/signup');
    }
    
    function handleUserLogout() {
        // Clear user authentication data only
        localStorage.removeItem('token');
        setIsUserLoggedIn(false);
        navigate('/login');
    }
    
    function handleAdminLogout() {
        // Clear admin authentication data only
        localStorage.removeItem('adminToken');
        setIsAdminLoggedIn(false);
        navigate('/admin');
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
                    {/* Landing page - show Admin, Login, Signup */}
                    {isLandingPage && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleAdmin();}}>Admin</a>
                            </div>
                            
                            {!isUserLoggedIn && (
                                <>
                                    <div className="navbar-account">
                                        <a href="#" onClick={(e) => {e.preventDefault(); handleLogin();}}>Login</a>
                                    </div>
                                    <div className="navbar-account">
                                        <a href="#" onClick={(e) => {e.preventDefault(); handleSignup();}}>Signup</a>
                                    </div>
                                </>
                            )}
                            
                            {isUserLoggedIn && (
                                <div className="navbar-Logout">
                                    <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                                </div>
                            )}
                        </>
                    )}

                    {/* InputMain page - show ONLY Logout */}
                    {isInputMain && isUserLoggedIn && (
                        <div className="navbar-Logout">
                            <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                        </div>
                    )}
                    
                    {/* FormData page - show Form Data & Logout */}
                    {isUserLoggedIn && !isInputMain && !isAdminPage && !isLandingPage && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleFormData();}}>Form Data</a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                            </div>
                        </>
                    )}
                    
                    {/* Admin is logged in & on admin page - show Admin Dashboard & Admin Logout */}
                    {isAdminLoggedIn && isAdminPage && (
                        <>
                            <div className="navbar-account active">
                                <a href="#" onClick={(e) => {e.preventDefault(); navigate('/admin/dashboard');}}>
                                    Admin Dashboard
                                </a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleAdminLogout();}}>Admin Logout</a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBar;