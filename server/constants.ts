/**
 * Backend Constants
 * Centralized configuration for magic numbers and hardcoded values
 */

// Session Configuration (in milliseconds)
export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  CHECK_PERIOD: 24 * 60 * 60 * 1000, // 24 hours
};

// HTTP Status Codes (for clarity)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NOT_AUTHENTICATED: "Not authenticated",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  USERNAME_EXISTS: "Username already exists",
  EMAIL_EXISTS: "Email already exists",
  ONLY_STUDENTS_CAN_APPLY: "Only students can apply for jobs",
  ONLY_EMPLOYERS_CAN_POST: "Only employers can post jobs",
  ONLY_EMPLOYERS_CAN_UPDATE: "Only employers and admins can update applications",
  ALREADY_APPLIED: "Already applied to this job",
  INVALID_STATUS: "Invalid application status",
  APPLICATION_NOT_FOUND: "Application not found",
  JOB_NOT_FOUND: "Job not found",
  CANNOT_UPDATE_OTHERS_APPLICATIONS: "Cannot update applications for this job",
};

// User Roles (for authorization checks)
export const USER_ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  EMPLOYER: "employer",
  OFFICER: "officer",
};

// Application Statuses
export const APP_STATUSES = {
  APPLIED: "applied",
  SHORTLISTED: "shortlisted",
  SELECTED: "selected",
  REJECTED: "rejected",
};

// Authorization Groups
export const ADMIN_ROLES = [USER_ROLES.ADMIN, USER_ROLES.OFFICER];
export const EDIT_APPLICATION_ROLES = [USER_ROLES.ADMIN, USER_ROLES.OFFICER, USER_ROLES.EMPLOYER];
