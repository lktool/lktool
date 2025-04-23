// Email validation with caching for repeated checks
const emailValidationCache = new Map();

export const validateEmail = (email) => {
    // Quick check for empty value
    if (!email || email.trim() === '') return false;
    
    // Check if we've validated this email before
    if (emailValidationCache.has(email)) {
        return emailValidationCache.get(email);
    }
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = regex.test(email);
    
    // Cache the result for future checks
    emailValidationCache.set(email, result);
    
    return result;
};

// Password strength validation
export const validatePasswordStrength = (password) => {
    if (!password) return { valid: false, message: 'Password is required' };
    
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    
    // Check for at least one uppercase, one lowercase, one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
        return { 
            valid: false, 
            message: 'Password must include uppercase, lowercase letters and numbers'
        };
    }
    
    return { valid: true, message: '' };
};

// Add more validation functions as needed