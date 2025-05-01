import "./NavBar.css";
import {useNavigate} from 'react-router-dom';
import { useState, useEffect } from 'react';

function NavBar(){
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    function handleAdmin(){
        navigate('/admin');
    }
    
    function handleLogout(){
        // Clear user authentication data
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        // Redirect to login page
        navigate('/login');
    }

    return (<>
        <div className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title">
                    <h2>LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    <div className="navbar-account">
                        <a href="" onClick={handleAdmin}>Admin</a>
                    </div>
                    {isLoggedIn && (
                        <div className="navbar-Logout">
                            <a href="" onClick={(e) => {e.preventDefault(); handleLogout();}}>Logout</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>);
}

export default NavBar;