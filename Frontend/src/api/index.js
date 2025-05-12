/**
 * API Module Exports
 * Central export point for all API services
 */

// Export all API services
export { authService } from './authService';
export { submissionService } from './submissionService';
export { adminService } from './adminService';

// Export config and interceptors for direct access if needed
export * from './config';
export * from './interceptors';

// Export all services
export { contactService } from './contactService';

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
