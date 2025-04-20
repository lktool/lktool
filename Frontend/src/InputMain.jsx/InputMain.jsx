import {useState} from "react";
import NavBar from "../NavBar/NavBar";
import "./InputMain.css";
function InputMain(){
    const [url,setUrl] = useState("");
    const [error,setError] = useState("");

    function handleInputChange(event){
        setUrl(event.target.value);
    }

    async function handleSubmit(event){
        event.preventDefault();
        if(!url){
            setError("Please enter URL");
        }

        try{
            //handle api response
        }catch{

        }
        setError("");
    }
    return (<>
        <NavBar/>
        <div className="inputMain-container">
            <div className="inputMain-content">
                <h2>Welcome to LK Tool Box</h2>
                <p>Enter the linkedIn URL</p>
            </div>
            <div className="inputMain-inputs">
                <input type="text" placeholder="Enter URL" onChange={handleInputChange}/>
                <button className="inputMain-add-button" onClick={handleSubmit}>Show</button>
            </div>
            <div className="inputMain-display-error">
                <p>{error}</p>
            </div>
        </div>
    </>);
}

export default InputMain;