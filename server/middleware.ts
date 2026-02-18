/**
 * Middleware and Authorization Utilities
 * Reusable functions for auth, errors, and role-based access control
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "./constants";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware: Verify user is authenticated
 */
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: ERROR_MESSAGES.NOT_AUTHENTICATED 
    });
  }
  next();
};

/**
 * Middleware: Verify user has specific role(s)
 */
export const requireRole = (...allowedRoles: string[]) => 
  async (req: any, res: Response, next: NextFunction) => {
    if (!req.session?.userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        message: ERROR_MESSAGES.NOT_AUTHENTICATED 
      });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
          message: ERROR_MESSAGES.USER_NOT_FOUND 
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ 
          message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS 
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("Authorization error:", err);
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
        message: "Authorization failed" 
      });
    }
  };

/**
 * Middleware: Verify user is admin or officer
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN, USER_ROLES.OFFICER);

/**
 * Middleware: Verify user is student
 */
export const requireStudent = requireRole(USER_ROLES.STUDENT);

/**
 * Middleware: Verify user is employer
 */
export const requireEmployer = requireRole(USER_ROLES.EMPLOYER);

/**
 * Error Response Factory
 * Generates consistent error responses across the API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Validation error formatter
 * Formats Zod validation errors into a consistent structure
 */
export const formatValidationErrors = (errors: any[]) => {
  return errors.map(err => ({
    field: err.path?.join(".") || "unknown",
    message: err.message,
  }));
};
