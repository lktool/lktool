/**
 * API Module Exports
 * Central export point for all API services
 */

// Export configuration
export * from './config';

// Export interceptors and clients
export { apiClient, createAuthClient } from './interceptors';

// Export all services
export { authService } from './authService';
export { submissionService } from './submissionService';
export { contactService } from './contactService';
export { adminService } from './adminService';

// Re-export as a combined API object
import { authService } from './authService';
import { submissionService } from './submissionService';
import { contactService } from './contactService';
import { adminService } from './adminService';

export const api = {
  auth: authService,
  submissions: submissionService,
  contact: contactService,
  admin: adminService
};

export default api;
