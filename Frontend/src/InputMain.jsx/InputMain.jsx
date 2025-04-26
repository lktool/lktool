import {useState} from "react";
import NavBar from "../NavBar/NavBar";
import "./InputMain.css";
import { contactService } from "../api/contactService";

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
            
            // Use contactService instead of direct axios call
            const response = await contactService.submitContactForm(url, message, email);
            
            // Show success message and clear form
            setSuccess(response.message || "Your message has been sent successfully!");
            setUrl("");
            setMessage("");
            setEmail("");
            
        } catch(err) {
            console.error("Error submitting contact form:", err);
            
            // Handle CORS-specific errors
            if (err.isCorsError) {
                setError("Server connection error. The server may be unreachable or not configured correctly.");
                return;
            }
            
            // Handle other error types
            if (typeof err === 'object') {
                if (err.linkedin_url) {
                    setError(err.linkedin_url[0]);
                } else if (err.message) {
                    setError(err.message[0]);
                } else if (err.email) {
                    setError(err.email[0]);
                } else if (err.error) {
                    setError(err.error);
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