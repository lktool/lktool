import {useState} from "react";
import NavBar from "../NavBar/NavBar";
import "./InputMain.css";
import axios from "axios";

function InputMain(){
    const [url, setUrl] = useState("");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    function handleUrlChange(event){
        setUrl(event.target.value);
    }

    function handleMessageChange(event){
        setMessage(event.target.value);
    }

    function handleEmailChange(event){
        setEmail(event.target.value);
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateLinkedInUrl(url) {
        return url.includes("linkedin.com");
    }

    async function handleSubmit(event){
        event.preventDefault();
        
        // Reset messages
        setError("");
        setSuccess("");
        
        // Validate all fields
        if(!url){
            setError("Please enter LinkedIn URL");
            return;
        }
        
        if(!validateLinkedInUrl(url)){
            setError("Please enter a valid LinkedIn URL");
            return;
        }
        
        if(!message){
            setError("Please enter a message");
            return;
        }
        
        if(!email){
            setError("Please enter an email address");
            return;
        }
        
        if(!validateEmail(email)){
            setError("Please enter a valid email address");
            return;
        }

        try{
            setLoading(true);
            
            // Get the token from local storage
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setError("You must be logged in to submit the form");
                setLoading(false);
                return;
            }
            
            // Make API call to our new endpoint
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/contact/submit/`, 
                {
                    linkedin_url: url,
                    message: message,
                    email: email
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Show success message and clear form
            setSuccess(response.data.message || "Your message has been sent successfully!");
            setUrl("");
            setMessage("");
            setEmail("");
            
        } catch(err) {
            console.error("Error submitting contact form:", err);
            
            if (err.response && err.response.data) {
                // Handle validation errors
                if (err.response.data.linkedin_url) {
                    setError(err.response.data.linkedin_url[0]);
                } else if (err.response.data.message) {
                    setError(err.response.data.message[0]);
                } else if (err.response.data.email) {
                    setError(err.response.data.email[0]);
                } else if (err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError("Failed to process your request. Please try again.");
                }
            } else {
                setError("Failed to process your request. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }
    
    return (<>
        <NavBar/>
        <div className="inputMain-container">
            <div className="inputMain-content">
                <h2>Welcome to LK Tool Box</h2>
                <p>Enter your information</p>
            </div>
            <div className="inputMain-form">
                <div className="input-group">
                    <label htmlFor="url">LinkedIn URL</label>
                    <input 
                        id="url"
                        type="text" 
                        placeholder="Enter LinkedIn URL" 
                        value={url}
                        onChange={handleUrlChange}
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="message">Message</label>
                    <textarea 
                        id="message"
                        placeholder="Enter your message" 
                        value={message}
                        onChange={handleMessageChange}
                        rows="4"
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        id="email"
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>
                
                <button 
                    className="inputMain-add-button" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Submit"}
                </button>
            </div>
            
            {error && (
                <div className="inputMain-display-error">
                    <p>{error}</p>
                </div>
            )}
            
            {success && (
                <div className="inputMain-display-success">
                    <p>{success}</p>
                </div>
            )}
        </div>
    </>);
}

export default InputMain;