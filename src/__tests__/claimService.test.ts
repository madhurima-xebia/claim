import { describe, beforeEach, it } from "node:test";
import { ClaimService } from "../services/claimService";
import { ClaimType, ClaimStatus, IClaim } from "../types/claim";
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
      expect(claim.claimId).toMatch(/^CLM-AUTO-\d{4}$/);
    });

    it("should increment running numbers per claim type", () => {
      const claim1 = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const claim2 = claimService.initiateClaim({
        claimantName: "Jane Doe",
        policyNumber: "POL-2024-002",
        claimType: ClaimType.AUTO,
        claimAmount: 7000,
      });

      const claim3 = claimService.initiateClaim({
        claimantName: "Bob Smith",
        policyNumber: "POL-2024-003",
        claimType: ClaimType.PROPERTY,
        claimAmount: 15000,
      });

      expect(claim1.claimId).toBe("CLM-AUTO-0001");
      expect(claim2.claimId).toBe("CLM-AUTO-0002");
      expect(claim3.claimId).toBe("CLM-PROPERTY-0001");
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

    it("should throw error for duplicate policy number", () => {
      claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      // Attempt to create another claim with the same policy number
      expect(() => {
        claimService.initiateClaim({
          claimantName: "Jane Doe",
          policyNumber: "POL-2024-001",
          claimType: ClaimType.PROPERTY,
          claimAmount: 7000,
        });
      }).toThrow(ValidationError);
    });

    it("should throw error for duplicate policy number (case insensitive)", () => {
      claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      // Attempt with different case
      expect(() => {
        claimService.initiateClaim({
          claimantName: "Jane Doe",
          policyNumber: "pol-2024-001",
          claimType: ClaimType.AUTO,
          claimAmount: 3000,
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

  describe("editClaim", () => {
    it("should edit claim claimant name", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const edited = claimService.editClaim(claim.claimId, {
        claimantName: "Jane Doe",
      });

      expect(edited?.claimantName).toBe("Jane Doe");
      expect(edited?.claimAmount).toBe(5000); // Unchanged
    });

    it("should edit claim policy number", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const edited = claimService.editClaim(claim.claimId, {
        policyNumber: "POL-2024-999",
      });

      expect(edited?.policyNumber).toBe("POL-2024-999");
      expect(edited?.claimantName).toBe("John Doe"); // Unchanged
    });

    it("should edit claim amount", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const edited = claimService.editClaim(claim.claimId, {
        claimAmount: 7500,
      });

      expect(edited?.claimAmount).toBe(7500);
      expect(edited?.claimantName).toBe("John Doe"); // Unchanged
    });

    it("should edit multiple claim fields", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const edited = claimService.editClaim(claim.claimId, {
        claimantName: "Jane Doe",
        claimAmount: 10000,
      });

      expect(edited?.claimantName).toBe("Jane Doe");
      expect(edited?.claimAmount).toBe(10000);
      expect(edited?.policyNumber).toBe("POL-2024-001"); // Unchanged
    });

    it("should throw error for invalid claimant name in edit", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      expect(() => {
        claimService.editClaim(claim.claimId, {
          claimantName: "",
        });
      }).toThrow(ValidationError);
    });

    it("should throw error for invalid claim amount in edit", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      expect(() => {
        claimService.editClaim(claim.claimId, {
          claimAmount: -1000,
        });
      }).toThrow(ValidationError);
    });

    it("should return undefined for non-existent claim", () => {
      const edited = claimService.editClaim("CLM-AUTO-9999", {
        claimantName: "Jane Doe",
      });

      expect(edited).toBeUndefined();
    });
  });

  describe("approveClaim", () => {
    it("should approve a claim", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const approved = claimService.approveClaim(claim.claimId);

      expect(approved?.status).toBe(ClaimStatus.APPROVED);
      expect(approved?.claimId).toBe(claim.claimId);
      expect(approved?.claimantName).toBe("John Doe"); // Other fields unchanged
    });

    it("should return undefined for non-existent claim", () => {
      const approved = claimService.approveClaim("CLM-AUTO-9999");
      expect(approved).toBeUndefined();
    });
  });

  describe("rejectClaim", () => {
    it("should reject a claim", () => {
      const claim = claimService.initiateClaim({
        claimantName: "John Doe",
        policyNumber: "POL-2024-001",
        claimType: ClaimType.AUTO,
        claimAmount: 5000,
      });

      const rejected = claimService.rejectClaim(claim.claimId);

      expect(rejected?.status).toBe(ClaimStatus.REJECTED);
      expect(rejected?.claimId).toBe(claim.claimId);
      expect(rejected?.claimantName).toBe("John Doe"); // Other fields unchanged
    });

    it("should return undefined for non-existent claim", () => {
      const rejected = claimService.rejectClaim("CLM-AUTO-9999");
      expect(rejected).toBeUndefined();
    });
  });
});

function expect(claim: IClaim) {
  throw new Error("Function not implemented.");
}

