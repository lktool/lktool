import "./NavBar.css";
import {useNavigate} from 'react-router-dom';
function NavBar(){
    const navigate = useNavigate();

    function handleAdmin(){
        navigate('/formData');
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
                    <div className="navbar-Logout">
                        <a href="">Logout</a>
                    </div>
                </div>
            </div>
        </div>
    </>);
}

export default NavBar;