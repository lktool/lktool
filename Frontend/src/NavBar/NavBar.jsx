import "./NavBar.css";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../api';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Function to update auth state
    const updateAuthState = () => {
        const authStatus = authService.isAuthenticated();
        setIsAuthenticated(authStatus);
        setIsAdmin(authStatus && authService.isAdmin());
    };

    useEffect(() => {
        // Check auth state on mount and location change
        updateAuthState();
        
        // Add event listener for auth changes
        window.addEventListener('authChange', updateAuthState);
        
        // Additional check for localStorage changes
        const handleStorageChange = (event) => {
            if (event.key === 'token' || event.key === null) {
                updateAuthState();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Clean up
        return () => {
            window.removeEventListener('authChange', updateAuthState);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location.pathname]); // Re-check when route changes

    // Force auth check on every render as backup
    useEffect(() => {
        updateAuthState();
    });

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setIsAdmin(false);
        // Always navigate to the login page regardless of user role
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Hide navbar on specific pages
    const hideNavbarPaths = ['/forgot-password'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    // Home link destination based on authentication status and role
    const getHomeDestination = () => {
        if (!isAuthenticated) {
            return '/';
        }
        return isAdmin ? '/admin/dashboard' : '/inputMain';
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title" onClick={() => navigate(getHomeDestination())}>
                    <h2>LK Tool Kit</h2>
                </div>
                
                <div className={`navbar-profiles-controls ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    {/* Remove the FAQ link and keep just the Pricing link */}
                    <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                    
                    {isAuthenticated && !isAdmin && (
                        <>
                            <Link to="/inputMain" onClick={() => setIsMobileMenuOpen(false)}>Submit Profile</Link>
                            <Link to="/my-submissions" onClick={() => setIsMobileMenuOpen(false)}>My Submissions</Link>
                        </>
                    )}

                    {isAuthenticated && isAdmin && (
                        <>
                            <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
{/*                             <Link to="/admin/reviewed" onClick={() => setIsMobileMenuOpen(false)}>Reviewed Submissions</Link> */}
                            <Link to="/admin/subscriptions" onClick={() => setIsMobileMenuOpen(false)}>Manage Subscriptions</Link>
                        </>
                    )}

                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </>
                    ) : (
                        <button onClick={handleLogout}>Logout</button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
