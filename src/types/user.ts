/**
 * User roles enumeration
 */
export enum UserRole {
  ADMIN = "Admin",
  CLAIMS_ADJUSTER = "ClaimsAdjuster",
  CUSTOMER = "Customer",
}

/**
 * Permissions enumeration
 */
export enum Permission {
  // Claim permissions
  CREATE_CLAIM = "create_claim",
  VIEW_CLAIM = "view_claim",
  EDIT_CLAIM = "edit_claim",
  DELETE_CLAIM = "delete_claim",
  APPROVE_CLAIM = "approve_claim",
  REJECT_CLAIM = "reject_claim",
  ADJUST_CLAIM = "adjust_claim",

  // User management permissions
  MANAGE_USERS = "manage_users",
  VIEW_USERS = "view_users",

  // Admin dashboard
  VIEW_ADMIN_DASHBOARD = "view_admin_dashboard",
  VIEW_REPORTS = "view_reports",
}

/**
 * Role to permission mapping
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.CREATE_CLAIM,
    Permission.VIEW_CLAIM,
    Permission.EDIT_CLAIM,
    Permission.DELETE_CLAIM,
    Permission.APPROVE_CLAIM,
    Permission.REJECT_CLAIM,
    Permission.ADJUST_CLAIM,
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.CLAIMS_ADJUSTER]: [
    Permission.VIEW_CLAIM,
    Permission.EDIT_CLAIM,
    Permission.APPROVE_CLAIM,
    Permission.REJECT_CLAIM,
    Permission.ADJUST_CLAIM,
  ],
  [UserRole.CUSTOMER]: [
    Permission.CREATE_CLAIM,
    Permission.VIEW_CLAIM,
  ],
};

/**
 * Interface representing a user
 */
export interface IUser {
  userId: string;
  username: string;
  email: string;
  password: string; // hashed
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Interface for user registration
 */
export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role?: UserRole;
}

/**
 * Interface for user login
 */
export interface ILoginRequest {
  username: string;
  password: string;
}

/**
 * Interface for authentication response
 */
export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  token?: string;
}
