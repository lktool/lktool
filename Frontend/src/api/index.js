/**
 * API Module Exports
 * Central export point for all API services
 */

import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

// Import services from individual files
import { authService } from './authService';
import { submissionService } from './submissionService';
import { adminService } from './adminService';

// Export services - make sure each one is exported only once
export {
  authService,
  submissionService,
  adminService
};

// Export config
export * from './config';
