import { ClaimService } from "../services/claimService";
import { ClaimType, ClaimStatus } from "../types/claim";
import { ValidationError } from "../utils/validation";

describe("ClaimService", () => {
  let claimService: ClaimService;

  beforeEach(() => {
    claimService = new ClaimService();
  });

  describe("initiateClaim", () => {
    it("should create a claim with valid data", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      expect(claim).toBeDefined();
      expect(claim.claimantName).toBe("John Doe");
      expect(claim.policyNumber).toBe("POL-2024-001");
      expect(claim.claimType).toBe(ClaimType.AUTO);
      expect(claim.claimAmount).toBe(5000);
      expect(claim.status).toBe(ClaimStatus.INITIATED);
      expect(claim.claimId).toMatch(/^CLM-/);
    });

    it("should throw error for empty claimant name", () => {
      expect(() => {
        claimService.initiateClaim({
          claimantName: "",
          policyNumber: "POL-2024-001",
          claimType: ClaimType.AUTO,
          claimAmount: 5000,
        });
      }).toThrow(ValidationError);
    });

    it("should throw error for invalid claim type", () => {
      expect(() => {
        claimService.initiateClaim({
          claimantName: "John Doe",
          policyNumber: "POL-2024-001",
          claimType: "Invalid" as any,
          claimAmount: 5000,
        });
      }).toThrow(ValidationError);
    });

    it("should throw error for invalid claim amount", () => {
      expect(() => {
        claimService.initiateClaim({
          claimantName: "John Doe",
          policyNumber: "POL-2024-001",
          claimType: ClaimType.AUTO,
          claimAmount: -100,
        });
      }).toThrow(ValidationError);
    });
  });

  describe("getClaimById", () => {
    it("should retrieve a claim by ID", () => {
      const createdClaim = claimService.initiateClaim({
        claimantName: "Jane Doe",
        policyNumber: "POL-2024-002",
        claimType: ClaimType.PROPERTY,
        claimAmount: 10000,
      });

      const retrievedClaim = claimService.getClaimById(createdClaim.claimId);
      expect(retrievedClaim).toEqual(createdClaim);
    });

    it("should return undefined for non-existent claim", () => {
      const claim = claimService.getClaimById("CLM-non-existent");
      expect(claim).toBeUndefined();
    });
  });

  describe("getClaimsByPolicy", () => {
    it("should retrieve all claims for a policy", () => {
      claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      claimService.initiateClaim({
        claimantName: "Jane Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 3000,
      });

      const claims = claimService.getClaimsByPolicy("POL-2024-001");
      expect(claims.length).toBe(2);
    });
  });

  describe("updateClaimStatus", () => {
    it("should update claim status", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const updated = claimService.updateClaimStatus(claim.claimId, ClaimStatus.APPROVED);
      expect(updated?.status).toBe(ClaimStatus.APPROVED);
    });
  });
});
