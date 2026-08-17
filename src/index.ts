/**
 * Main entry point for the claim system
 */

export { ClaimService } from "./services/claimService";
export { IClaim, ICreateClaimRequest, ClaimType, ClaimStatus } from "./types/claim";
export { ValidationError, validateClaimRequest } from "./utils/validation";

// Example usage
import { ClaimService } from "./services/claimService";
import { ClaimType } from "./types/claim";

const claimService = new ClaimService();

// Example: Create a claim
try {
  const claim = claimService.initiateClaim({
    claimantName: "John Doe",
    policyNumber: "POL-2024-001",
    claimType: ClaimType.AUTO,
    claimAmount: 5000,
  });

  console.log("✓ Claim initiated successfully:");
  console.log(claim);

  // Retrieve the claim
  const retrievedClaim = claimService.getClaimById(claim.claimId);
  console.log("\n✓ Claim retrieved:");
  console.log(retrievedClaim);
} catch (error) {
  if (error instanceof Error) {
    console.error("✗ Error:", error.message);
  }
}
