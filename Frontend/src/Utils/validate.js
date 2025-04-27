// Email validation with caching for repeated checks
const emailValidationCache = new Map();

/**
 * Validates if a string is a proper email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid or not
 */
export const validateEmail = (email) => {
    if (!email) return false;
    
    // Trim the email to remove any whitespace
    const trimmedEmail = email.trim();
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
};