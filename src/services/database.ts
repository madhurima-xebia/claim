import fs from "fs";
import path from "path";
import { IClaim } from "../types/claim";
import { IUser } from "../types/user";

/**
 * Database service for handling JSON file persistence
 */
export class Database {
  private usersFilePath: string;
  private claimsFilePath: string;

  constructor(dataDir: string = path.join(__dirname, "../../data")) {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.usersFilePath = path.join(dataDir, "users.json");
    this.claimsFilePath = path.join(dataDir, "claims.json");

    // Initialize files if they don't exist
    if (!fs.existsSync(this.usersFilePath)) {
      this.writeUsersFile([]);
    }
    if (!fs.existsSync(this.claimsFilePath)) {
      this.writeClaimsFile([]);
    }
  }

  // Users operations
  /**
   * Get all users
   */
  public getAllUsers(): IUser[] {
    try {
      const data = fs.readFileSync(this.usersFilePath, "utf-8");
      const users = JSON.parse(data);
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));
    } catch (error) {
      console.error("Error reading users file:", error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  public getUserById(userId: string): IUser | null {
    const users = this.getAllUsers();
    return users.find((u) => u.userId === userId) || null;
  }

  /**
   * Get user by username
   */
  public getUserByUsername(username: string): IUser | null {
    const users = this.getAllUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  /**
   * Get user by email
   */
  public getUserByEmail(email: string): IUser | null {
    const users = this.getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  /**
   * Save user
   */
  public saveUser(user: IUser): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex((u) => u.userId === user.userId);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    this.writeUsersFile(users);
  }

  /**
   * Delete user
   */
  public deleteUser(userId: string): void {
    const users = this.getAllUsers();
    const filtered = users.filter((u) => u.userId !== userId);
    this.writeUsersFile(filtered);
  }

  // Claims operations
  /**
   * Get all claims
   */
  public getAllClaims(): IClaim[] {
    try {
      const data = fs.readFileSync(this.claimsFilePath, "utf-8");
      const claims = JSON.parse(data);
      return claims.map((claim: any) => ({
        ...claim,
        createdAt: new Date(claim.createdAt),
        updatedAt: new Date(claim.updatedAt),
        approvalDate: claim.approvalDate ? new Date(claim.approvalDate) : undefined,
      }));
    } catch (error) {
      console.error("Error reading claims file:", error);
      return [];
    }
  }

  /**
   * Get claim by ID
   */
  public getClaimById(claimId: string): IClaim | null {
    const claims = this.getAllClaims();
    return claims.find((c) => c.claimId === claimId) || null;
  }

  /**
   * Get claims by policy number
   */
  public getClaimsByPolicy(policyNumber: string): IClaim[] {
    const claims = this.getAllClaims();
    return claims.filter(
      (c) => c.policyNumber.toLowerCase() === policyNumber.toLowerCase()
    );
  }

  /**
   * Get claims by user ID
   */
  public getClaimsByUserId(userId: string): IClaim[] {
    const claims = this.getAllClaims();
    return claims.filter((c) => c.userId === userId);
  }

  /**
   * Get claims by status
   */
  public getClaimsByStatus(status: string): IClaim[] {
    const claims = this.getAllClaims();
    return claims.filter((c) => c.status === status);
  }

  /**
   * Save claim
   */
  public saveClaim(claim: IClaim): void {
    const claims = this.getAllClaims();
    const existingIndex = claims.findIndex((c) => c.claimId === claim.claimId);

    if (existingIndex >= 0) {
      claims[existingIndex] = claim;
    } else {
      claims.push(claim);
    }

    this.writeClaimsFile(claims);
  }

  /**
   * Delete claim
   */
  public deleteClaim(claimId: string): void {
    const claims = this.getAllClaims();
    const filtered = claims.filter((c) => c.claimId !== claimId);
    this.writeClaimsFile(filtered);
  }

  // Private helper methods
  private writeUsersFile(users: IUser[]): void {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing users file:", error);
    }
  }

  private writeClaimsFile(claims: IClaim[]): void {
    try {
      fs.writeFileSync(this.claimsFilePath, JSON.stringify(claims, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing claims file:", error);
    }
  }
}

// Create a singleton instance
export const database = new Database();
