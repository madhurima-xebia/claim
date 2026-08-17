import { IClaim, ICreateClaimRequest, IEditClaimRequest, ClaimStatus, ClaimType } from "../types/claim";
import { validateClaimRequest, validateEditClaimRequest, ValidationError } from "../utils/validation";

/**
 * ClaimService handles the creation and management of claims
 */
export class ClaimService {
  private claims: Map<string, IClaim> = new Map();
  private claimCounters: Map<ClaimType, number> = new Map([
    [ClaimType.AUTO, 0],
    [ClaimType.PROPERTY, 0],
    [ClaimType.HEALTH, 0],
  ]);

  /**
   * Initiates a new claim
   * @param request - The claim creation request
   * @returns The created claim object
   * @throws ValidationError if validation fails or duplicate policy number exists
   */
  public initiateClaim(request: ICreateClaimRequest): IClaim {
    // Validate the request
    validateClaimRequest(request);

    // Check for duplicate policy number
    const trimmedPolicyNumber = request.policyNumber.trim();
    const existingClaim = Array.from(this.claims.values()).find(
      (claim) => claim.policyNumber.toLowerCase() === trimmedPolicyNumber.toLowerCase()
    );

    if (existingClaim) {
      throw new ValidationError(
        `A claim already exists for policy number "${trimmedPolicyNumber}". Policy number: ${existingClaim.claimId}, Status: ${existingClaim.status}`
      );
    }

    // Generate unique claim ID with format: CLM-{TYPE}-{runningNumber}
    const counter = this.claimCounters.get(request.claimType) || 0;
    this.claimCounters.set(request.claimType, counter + 1);
    const claimId = `CLM-${request.claimType.toUpperCase()}-${String(counter + 1).padStart(4, "0")}`;
    const now = new Date();

    // Create the claim object
    const claim: IClaim = {
      claimId,
      claimantName: request.claimantName.trim(),
      policyNumber: trimmedPolicyNumber,
      claimType: request.claimType,
      claimAmount: request.claimAmount,
      status: ClaimStatus.INITIATED,
      createdAt: now,
      updatedAt: now,
    };

    // Store the claim
    this.claims.set(claimId, claim);

    return claim;
  }

  /**
   * Retrieves a claim by ID
   * @param claimId - The claim ID
   * @returns The claim object or undefined if not found
   */
  public getClaimById(claimId: string): IClaim | undefined {
    return this.claims.get(claimId);
  }

  /**
   * Retrieves all claims for a specific policy
   * @param policyNumber - The policy number
   * @returns Array of claims for that policy
   */
  public getClaimsByPolicy(policyNumber: string): IClaim[] {
    const policyLower = policyNumber.toLowerCase();
    return Array.from(this.claims.values()).filter(
      (claim) => claim.policyNumber.toLowerCase() === policyLower
    );
  }

  /**
   * Retrieves all claims for a specific claimant
   * @param claimantName - The claimant name
   * @returns Array of claims for that claimant
   */
  public getClaimsByClaimant(claimantName: string): IClaim[] {
    const nameLower = claimantName.toLowerCase();
    return Array.from(this.claims.values()).filter(
      (claim) => claim.claimantName.toLowerCase() === nameLower
    );
  }

  /**
   * Updates the status of a claim
   * @param claimId - The claim ID
   * @param status - The new status
   * @returns The updated claim or undefined if not found
   */
  public updateClaimStatus(claimId: string, status: ClaimStatus): IClaim | undefined {
    const claim = this.claims.get(claimId);
    if (!claim) {
      return undefined;
    }

    claim.status = status;
    claim.updatedAt = new Date();
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
    const claim = this.claims.get(claimId);
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
    return claim;
  }

  /**
   * Approves a claim (sets status to APPROVED)
   * @param claimId - The claim ID
   * @returns The approved claim or undefined if not found
   */
  public approveClaim(claimId: string): IClaim | undefined {
    const claim = this.claims.get(claimId);
    if (!claim) {
      return undefined;
    }

    claim.status = ClaimStatus.APPROVED;
    claim.updatedAt = new Date();
    return claim;
  }

  /**
   * Rejects a claim (sets status to REJECTED)
   * @param claimId - The claim ID
   * @returns The rejected claim or undefined if not found
   */
  public rejectClaim(claimId: string): IClaim | undefined {
    const claim = this.claims.get(claimId);
    if (!claim) {
      return undefined;
    }

    claim.status = ClaimStatus.REJECTED;
    claim.updatedAt = new Date();
    return claim;
  }

  /**
   * Gets all claims
   * @returns Array of all claims
   */
  public getAllClaims(): IClaim[] {
    return Array.from(this.claims.values());
  }

  /**
   * Deletes a claim
   * @param claimId - The claim ID
   * @returns true if deleted, false if not found
   */
  public deleteClaim(claimId: string): boolean {
    return this.claims.delete(claimId);
  }
}
