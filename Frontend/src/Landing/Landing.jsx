import {useNavigate} from "react-router-dom";
import { MdOutlineLogin } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import "./Landing.css";

function Landing() {
    const navigate = useNavigate();

    function handleLogin() {
        navigate('/login');
    }

    function handleSignin() {
        navigate('/signup');
    }

    return (
        <div className="landing-container">
            <div className="landing-content">
                <h2>Welcome to LK Tool Box</h2>
                <p>Please make sure signin or login successfull before continue</p>
            </div>
            <div className="landing-controls">
                <button onClick={handleLogin}><MdOutlineLogin className="landing-login-icon" />Login</button>
                <button onClick={handleSignin}><CiUser className="landing-singin-icon"/>SignUp</button>
            </div>
        </div>
    );
}

export default Landing;
