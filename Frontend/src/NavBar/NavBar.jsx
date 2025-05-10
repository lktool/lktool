import "./NavBar.css";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(unifiedAuthService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(unifiedAuthService.isAdmin());

    useEffect(() => {
        // Function to update authentication state
        const updateAuthState = () => {
            setIsAuthenticated(unifiedAuthService.isAuthenticated());
            setIsAdmin(unifiedAuthService.isAdmin());
        };

        // Add an event listener for auth changes
        window.addEventListener('authChange', updateAuthState);

        // Clean up on unmount
        return () => {
            window.removeEventListener('authChange', updateAuthState);
        };
    }, []);

    // Hide navbar on specific pages where it's not needed
    const hideNavbarPaths = ['/forgot-password'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title" onClick={() => navigate('/')}>
                    <h2>LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    {/* Common navigation links */}
                    <Link to="/">Home</Link>

                    {/* Authenticated user links */}
                    {isAuthenticated && !isAdmin && (
                        <>
                            <Link to="/inputMain">Submit Profile</Link>
                            <Link to="/my-submissions">My Submissions</Link>
                        </>
                    )}

                    {/* Admin links */}
                    {isAuthenticated && isAdmin && (
                        <Link to="/admin/dashboard">Admin Dashboard</Link>
                    )}

                    {/* Authentication links */}
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Sign Up</Link>
                        </>
                    ) : (
                        <button onClick={() => {
                            unifiedAuthService.logout();
                            window.dispatchEvent(new Event('authChange'));
                            navigate('/login');
                        }}>Logout</button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;