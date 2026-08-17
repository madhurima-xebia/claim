import { v4 as uuidv4 } from "uuid";
import { IClaim, ICreateClaimRequest, ClaimStatus, ClaimType } from "../types/claim";
import { validateClaimRequest, ValidationError } from "../utils/validation";

/**
 * ClaimService handles the creation and management of claims
 */
export class ClaimService {
  private claims: Map<string, IClaim> = new Map();

  /**
   * Initiates a new claim
   * @param request - The claim creation request
   * @returns The created claim object
   * @throws ValidationError if validation fails
   */
  public initiateClaim(request: ICreateClaimRequest): IClaim {
    // Validate the request
    validateClaimRequest(request);

    // Generate unique claim ID
    const claimId = `CLM-${uuidv4()}`;
    const now = new Date();

    // Create the claim object
    const claim: IClaim = {
      claimId,
      claimantName: request.claimantName.trim(),
      policyNumber: request.policyNumber.trim(),
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
