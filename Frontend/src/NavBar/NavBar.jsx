import "./NavBar.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [isLandingPage, setIsLandingPage] = useState(false);
    const [isInputMain, setIsInputMain] = useState(false);
    const [isLoginPage, setIsLoginPage] = useState(false);
    const [isSignupPage, setIsSignupPage] = useState(false);
    const [isMySubmissionsPage, setIsMySubmissionsPage] = useState(false);

    // Check authentication state when component mounts or location changes
    useEffect(() => {
        // Check user login status and role using unified auth
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        setIsUserLoggedIn(!!token);
        setIsAdminUser(userRole === 'admin');
        
        // Check which page we're on
        setIsLandingPage(location.pathname === '/');
        setIsInputMain(location.pathname === '/inputMain');
        setIsLoginPage(location.pathname === '/login');
        setIsSignupPage(location.pathname === '/signup');
        setIsMySubmissionsPage(location.pathname === '/my-submissions');
        
    }, [location.pathname]);

    // Listen for authentication changes
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            
            setIsUserLoggedIn(!!token);
            setIsAdminUser(userRole === 'admin');
        };
        
        // Initial check
        checkAuthStatus();
        
        // Set up event listeners
        window.addEventListener('storage', checkAuthStatus);
        window.addEventListener('authChange', checkAuthStatus);
        
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
            window.removeEventListener('authChange', checkAuthStatus);
        };
    }, []);

    function handleAdmin() {
        navigate('/admin');
    }
    
    function handleHome() {
        navigate('/');
    }
    
    function handleFormData() {
        if (!isAdminUser) {
            navigate('/admin');
        } else {
            navigate('/admin/dashboard');
        }
    }
    
    function handleLogin() {
        navigate('/login');
    }
    
    function handleSignup() {
        navigate('/signup');
    }
    
    function handleUserLogout() {
        // Use unified auth service to logout
        unifiedAuthService.logout();
        setIsUserLoggedIn(false);
        setIsAdminUser(false);
        navigate('/login');
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authChange'));
    }

    function handleMySubmissions() {
        navigate('/my-submissions');
    }

    function handleInputMain() {
        navigate('/inputMain');
    }
    
    // Hide navbar on specific pages where it's not needed
    const hideNavbarPaths = ['/forgot-password'];
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

                    {/* Login/Signup pages - show ONLY Admin link */}
                    {(isLoginPage || isSignupPage) && (
                        <div className="navbar-account">
                            <a href="#" onClick={(e) => {e.preventDefault(); handleAdmin();}}>Admin</a>
                        </div>
                    )}

                    {/* Admin Login page - show Login, Signup options too */}
                    {location.pathname === '/admin' && !isAdminUser && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleLogin();}}>Login</a>
                            </div>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleSignup();}}>Signup</a>
                            </div>
                        </>
                    )}

                    {/* InputMain page - show ONLY Logout */}
                    {isInputMain && isUserLoggedIn && (
                        <div className="navbar-Logout">
                            <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                        </div>
                    )}
                    
                    {/* FormData page - show Form Data & Logout */}
                    {isUserLoggedIn && !isInputMain && !isLandingPage && !isMySubmissionsPage && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleFormData();}}>Form Data</a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                            </div>
                        </>
                    )}
                    
                    {/* My Submissions page - show InputMain & Logout */}
                    {isUserLoggedIn && isMySubmissionsPage && (
                        <>
                            <div className="navbar-account">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleInputMain();}}>Input Main</a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Logout</a>
                            </div>
                        </>
                    )}
                    
                    {/* Add My Submissions button for authenticated users on appropriate pages */}
                    {isUserLoggedIn && !isLandingPage && !isMySubmissionsPage && (
                        <div className="navbar-account">
                            <a href="#" onClick={(e) => {e.preventDefault(); handleMySubmissions();}}>
                                My Submissions
                            </a>
                        </div>
                    )}
                    
                    {/* Admin is logged in & on admin page - show Admin Dashboard & Admin Logout */}
                    {isAdminUser && (
                        <>
                            <div className="navbar-account active">
                                <a href="#" onClick={(e) => {e.preventDefault(); navigate('/admin/dashboard');}}>
                                    Admin Dashboard
                                </a>
                            </div>
                            <div className="navbar-Logout">
                                <a href="#" onClick={(e) => {e.preventDefault(); handleUserLogout();}}>Admin Logout</a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavBar;