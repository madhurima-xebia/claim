/**
 * Enumeration for claim types
 */
export enum ClaimType {
  AUTO = "Auto",
  PROPERTY = "Property",
  HEALTH = "Health",
}

/**
 * Claim status enumeration
 */
export enum ClaimStatus {
  INITIATED = "Initiated",
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

/**
 * Interface representing a claim
 */
export interface IClaim {
  claimId: string;
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimAmount: number;
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new claim (input data)
 */
export interface ICreateClaimRequest {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimAmount: number;
}

/**
 * Interface for editing/updating claim details
 */
export interface IEditClaimRequest {
  claimantName?: string;
  policyNumber?: string;
  claimAmount?: number;
}

/**
 * Interface for updating claim status
 */
export interface IUpdateClaimStatusRequest {
  status: ClaimStatus;
}

/**
 * Interface for approving a claim
 */
export interface IApprovClaimRequest {
  approvalNotes?: string;
}
