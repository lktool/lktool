import "./NavBar.css";
function NavBar(){
    return (<>
        <div className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-title">
                    <h2>LK Tool Box</h2>
                </div>
                <div className="navbar-profiles-controls">
                    <div className="navbar-account">
                        <a href="">Account</a>
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