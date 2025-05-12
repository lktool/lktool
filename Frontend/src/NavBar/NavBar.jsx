import "./NavBar.css";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
// Update import to use the new API structure
import { authService } from '../api';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isAdmin, setIsAdmin] = useState(authService.isAdmin());

    useEffect(() => {
        // Function to update authentication state
        const updateAuthState = () => {
            setIsAuthenticated(authService.isAuthenticated());
            setIsAdmin(authService.isAdmin());
        };

        // Check on component mount
        updateAuthState();

        // Add an event listener for auth changes
        window.addEventListener('authChange', updateAuthState);

        // Clean up on unmount
        return () => {
            window.removeEventListener('authChange', updateAuthState);
        };
    }, []);

    const handleLogout = () => {
        authService.logout();
        window.dispatchEvent(new Event('authChange'));
        navigate('/login');
    };

    // Hide navbar on specific pages where it's not needed
    const hideNavbarPaths = ['/forgot-password'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    // Home link destination based on authentication status and role
    const getHomeDestination = () => {
        if (!isAuthenticated) {
            return '/'; // Public landing page
        }

        return isAdmin ? '/admin/dashboard' : '/inputMain';
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title" onClick={() => navigate(getHomeDestination())}>
                    <h2>LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    {/* Dynamic Home Link - Points to role-appropriate destination */}
                    <Link to={getHomeDestination()}>Home</Link>

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
                        <button onClick={handleLogout}>Logout</button>
                    )}

                    {/* Contact link */}
                    <Link to="/contact" className="nav-link">Contact</Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;