// Compatibility file - redirects to unifiedAuthService
import { unifiedAuthService } from './unifiedAuthService';

// Export the unified service under the old name for backward compatibility
export const authService = unifiedAuthService;

// Add a console warning
console.warn('authService.js is deprecated. Please update imports to use unifiedAuthService.js directly.');
