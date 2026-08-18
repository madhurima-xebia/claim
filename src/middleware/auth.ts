import { Request, Response, NextFunction } from "express";
import { IUser, Permission, UserRole } from "../types/user";
import { userService } from "../services/userService";

/**
 * Extended Express Request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  token?: string;
}

/**
 * Simple token-based authentication middleware
 * Token is in the format: {userId}:{username}
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    // Decode simple token (userId:username)
    const [userId, username] = Buffer.from(token, "base64").toString().split(":");

    if (!userId || !username) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // Get user from database
    const user = userService.getUserById(userId);
    if (!user || user.username !== username || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

/**
 * Authorization middleware - checks if user has required permission
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!userService.hasPermission(req.user, permission)) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`,
      });
    }

    next();
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!userService.hasRole(req.user, roles)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Generate authentication token
 */
export const generateAuthToken = (userId: string, username: string): string => {
  const tokenString = `${userId}:${username}`;
  return Buffer.from(tokenString).toString("base64");
};
