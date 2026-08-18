import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  IUser,
  IRegisterRequest,
  ILoginRequest,
  UserRole,
  Permission,
  rolePermissions,
} from "../types/user";
import { database } from "./database";
import { ValidationError } from "../utils/validation";

/**
 * UserService handles user authentication and management
 */
export class UserService {
  /**
   * Hash password using SHA-256
   */
  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Register a new user
   */
  public register(request: IRegisterRequest): IUser {
    // Validate input
    if (!request.username || request.username.trim().length < 3) {
      throw new ValidationError("Username must be at least 3 characters long");
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      throw new ValidationError("Invalid email address");
    }

    if (!request.password || request.password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }

    if (request.password !== request.confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    if (!request.fullName || request.fullName.trim().length < 2) {
      throw new ValidationError("Full name must be at least 2 characters long");
    }

    // Check if username already exists
    const existingUser = database.getUserByUsername(request.username);
    if (existingUser) {
      throw new ValidationError("Username already exists");
    }

    // Check if email already exists
    const existingEmail = database.getUserByEmail(request.email);
    if (existingEmail) {
      throw new ValidationError("Email already exists");
    }

    // Create new user
    const user: IUser = {
      userId: uuidv4(),
      username: request.username.trim(),
      email: request.email.toLowerCase().trim(),
      password: this.hashPassword(request.password),
      fullName: request.fullName.trim(),
      role: request.role || UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    // Save user
    database.saveUser(user);

    return user;
  }

  /**
   * Login user
   */
  public login(request: ILoginRequest): IUser {
    if (!request.username || !request.password) {
      throw new ValidationError("Username and password are required");
    }

    const user = database.getUserByUsername(request.username);
    if (!user) {
      throw new ValidationError("Invalid username or password");
    }

    if (!user.isActive) {
      throw new ValidationError("User account is disabled");
    }

    if (!this.verifyPassword(request.password, user.password)) {
      throw new ValidationError("Invalid username or password");
    }

    return user;
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): IUser | null {
    return database.getUserById(userId);
  }

  /**
   * Get user by username
   */
  public getUserByUsername(username: string): IUser | null {
    return database.getUserByUsername(username);
  }

  /**
   * Get all users
   */
  public getAllUsers(): IUser[] {
    return database.getAllUsers();
  }

  /**
   * Check if user has permission
   */
  public hasPermission(user: IUser, permission: Permission): boolean {
    const permissions = rolePermissions[user.role];
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the given roles
   */
  public hasRole(user: IUser, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  /**
   * Update user
   */
  public updateUser(userId: string, updates: Partial<IUser>): IUser {
    const user = database.getUserById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    const updatedUser: IUser = {
      ...user,
      ...updates,
      userId: user.userId, // Don't allow changing ID
      createdAt: user.createdAt, // Don't allow changing creation date
      updatedAt: new Date(),
    };

    database.saveUser(updatedUser);
    return updatedUser;
  }

  /**
   * Delete user
   */
  public deleteUser(userId: string): void {
    const user = database.getUserById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    database.deleteUser(userId);
  }

  /**
   * Deactivate user
   */
  public deactivateUser(userId: string): IUser {
    return this.updateUser(userId, { isActive: false });
  }

  /**
   * Change user password
   */
  public changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): IUser {
    const user = database.getUserById(userId);
    if (!user) {
      throw new ValidationError("User not found");
    }

    if (!this.verifyPassword(oldPassword, user.password)) {
      throw new ValidationError("Current password is incorrect");
    }

    if (newPassword.length < 6) {
      throw new ValidationError("New password must be at least 6 characters long");
    }

    return this.updateUser(userId, {
      password: this.hashPassword(newPassword),
    });
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Create a singleton instance
export const userService = new UserService();
