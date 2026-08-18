import { IClaim, ICreateClaimRequest, IEditClaimRequest, ClaimStatus, ClaimType, IRejectClaimRequest, IAdjustClaimRequest } from "../types/claim";
import { validateClaimRequest, validateEditClaimRequest, ValidationError } from "../utils/validation";
import { database } from "./database";

/**
 * ClaimService handles the creation and management of claims
 */
export class ClaimService {
  /**
   * Generate next claim ID based on existing claims
   */
  private generateClaimId(claimType: ClaimType): string {
    const claims = database.getAllClaims();
    const typePrefix = `CLM-${claimType.toUpperCase()}`;
    const typeClaims = claims.filter((c) => c.claimId.startsWith(typePrefix));
    const counter = typeClaims.length + 1;
    return `${typePrefix}-${String(counter).padStart(4, "0")}`;
  }

  /**
   * Initiates a new claim
   * @param request - The claim creation request
   * @param userId - The ID of the user creating the claim
   * @returns The created claim object
   * @throws ValidationError if validation fails or duplicate policy number exists
   */
  public initiateClaim(request: ICreateClaimRequest, userId?: string): IClaim {
    // Validate the request
    validateClaimRequest(request);

    // Check for duplicate policy number
    const trimmedPolicyNumber = request.policyNumber.trim();
    const existingClaim = database
      .getClaimsByPolicy(trimmedPolicyNumber)
      .find((c) => c.policyNumber.toLowerCase() === trimmedPolicyNumber.toLowerCase());

    if (existingClaim) {
      throw new ValidationError(
        `A claim already exists for policy number "${trimmedPolicyNumber}". Claim ID: ${existingClaim.claimId}, Status: ${existingClaim.status}`
      );
    }

    // Generate unique claim ID
    const claimId = this.generateClaimId(request.claimType);
    const now = new Date();

    // Create the claim object
    const claim: IClaim = {
      claimId,
      claimantName: request.claimantName.trim(),
      policyNumber: trimmedPolicyNumber,
      claimType: request.claimType,
      claimAmount: request.claimAmount,
      status: ClaimStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      userId: userId,
    };

    // Store the claim
    database.saveClaim(claim);

    return claim;
  }

  /**
   * Retrieves a claim by ID
   * @param claimId - The claim ID
   * @returns The claim object or undefined if not found
   */
  public getClaimById(claimId: string): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    return claim || undefined;
  }

  /**
   * Retrieves all claims for a specific policy
   * @param policyNumber - The policy number
   * @returns Array of claims for that policy
   */
  public getClaimsByPolicy(policyNumber: string): IClaim[] {
    return database.getClaimsByPolicy(policyNumber);
  }

  /**
   * Retrieves all claims for a specific claimant
   * @param claimantName - The claimant name
   * @returns Array of claims for that claimant
   */
  public getClaimsByClaimant(claimantName: string): IClaim[] {
    const claims = database.getAllClaims();
    const nameLower = claimantName.toLowerCase();
    return claims.filter(
      (claim) => claim.claimantName.toLowerCase() === nameLower
    );
  }

  /**
   * Retrieves all claims
   * @returns Array of all claims
   */
  public getAllClaims(): IClaim[] {
    return database.getAllClaims();
  }

  /**
   * Get claims by user ID
   * @param userId - The user ID
   * @returns Array of claims for that user
   */
  public getClaimsByUserId(userId: string): IClaim[] {
    return database.getClaimsByUserId(userId);
  }

  /**
   * Get claims by status
   * @param status - The claim status
   * @returns Array of claims with that status
   */
  public getClaimsByStatus(status: ClaimStatus): IClaim[] {
    return database.getClaimsByStatus(status);
  }

  /**
   * Updates the status of a claim
   * @param claimId - The claim ID
   * @param status - The new status
   * @returns The updated claim or undefined if not found
   */
  public updateClaimStatus(claimId: string, status: ClaimStatus): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return undefined;
    }

    claim.status = status;
    claim.updatedAt = new Date();
    database.saveClaim(claim);
    return claim;
  }

  /**
   * Edits claim details (claimant name, policy number, or claim amount)
   * @param claimId - The claim ID
   * @param request - The edit request with fields to update
   * @returns The updated claim or undefined if not found
   * @throws ValidationError if validation fails
   */
  public editClaim(claimId: string, request: IEditClaimRequest): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return undefined;
    }

    // Validate the edit request
    validateEditClaimRequest(request);

    // Update fields if provided
    if (request.claimantName !== undefined) {
      claim.claimantName = request.claimantName.trim();
    }

    if (request.policyNumber !== undefined) {
      claim.policyNumber = request.policyNumber.trim();
    }

    if (request.claimAmount !== undefined) {
      claim.claimAmount = request.claimAmount;
    }

    claim.updatedAt = new Date();
    database.saveClaim(claim);
    return claim;
  }

  /**
   * Approves a claim (sets status to APPROVED)
   * @param claimId - The claim ID
   * @param adminId - The ID of the admin approving the claim
   * @returns The approved claim or undefined if not found
   */
  public approveClaim(claimId: string, adminId?: string): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return undefined;
    }

    claim.status = ClaimStatus.APPROVED;
    claim.approvedBy = adminId;
    claim.approvalDate = new Date();
    claim.updatedAt = new Date();
    database.saveClaim(claim);
    return claim;
  }

  /**
   * Rejects a claim with reason (sets status to REJECTED)
   * @param claimId - The claim ID
   * @param request - The rejection request with reason
   * @returns The rejected claim or undefined if not found
   */
  public rejectClaim(claimId: string, request: IRejectClaimRequest): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return undefined;
    }

    if (!request.rejectionReason || request.rejectionReason.trim().length === 0) {
      throw new ValidationError("Rejection reason is required");
    }

    claim.status = ClaimStatus.REJECTED;
    claim.rejectionReason = request.rejectionReason;
    claim.updatedAt = new Date();
    database.saveClaim(claim);
    return claim;
  }

  /**
   * Adjusts a claim amount (for admin use)
   * @param claimId - The claim ID
   * @param request - The adjustment request
   * @returns The adjusted claim or undefined if not found
   */
  public adjustClaim(claimId: string, request: IAdjustClaimRequest): IClaim | undefined {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return undefined;
    }

    if (request.adjustedAmount <= 0) {
      throw new ValidationError("Adjusted amount must be greater than 0");
    }

    claim.adjustedAmount = request.adjustedAmount;
    claim.adjustmentNotes = request.adjustmentNotes;
    claim.updatedAt = new Date();
    database.saveClaim(claim);
    return claim;
  }

  /**
   * Deletes a claim
   * @param claimId - The claim ID
   * @returns true if deleted, false if not found
   */
  public deleteClaim(claimId: string): boolean {
    const claim = database.getClaimById(claimId);
    if (!claim) {
      return false;
    }
    database.deleteClaim(claimId);
    return true;
  }
}
