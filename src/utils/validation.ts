import { ICreateClaimRequest, IEditClaimRequest, ClaimType } from "../types/claim";

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates claim creation request
 * @param request - The claim request to validate
 * @throws ValidationError if validation fails
 */
export function validateClaimRequest(request: ICreateClaimRequest): void {
  // Validate claimant name
  if (!request.claimantName || request.claimantName.trim().length === 0) {
    throw new ValidationError("Claimant name is required and cannot be empty");
  }

  if (request.claimantName.length < 2) {
    throw new ValidationError("Claimant name must be at least 2 characters long");
  }

  // Validate policy number
  if (!request.policyNumber || request.policyNumber.trim().length === 0) {
    throw new ValidationError("Policy number is required and cannot be empty");
  }

  // Validate claim type
  const validClaimTypes = Object.values(ClaimType);
  if (!validClaimTypes.includes(request.claimType)) {
    throw new ValidationError(
      `Invalid claim type. Must be one of: ${validClaimTypes.join(", ")}`
    );
  }

  // Validate claim amount
  if (typeof request.claimAmount !== "number") {
    throw new ValidationError("Claim amount must be a number");
  }

  if (request.claimAmount <= 0) {
    throw new ValidationError("Claim amount must be greater than 0");
  }

  if (request.claimAmount > Number.MAX_SAFE_INTEGER) {
    throw new ValidationError("Claim amount exceeds maximum allowed value");
  }
}

/**
 * Validates claim edit request
 * @param request - The edit claim request to validate
 * @throws ValidationError if validation fails
 */
export function validateEditClaimRequest(request: IEditClaimRequest): void {
  if (!request || Object.keys(request).length === 0) {
    throw new ValidationError("At least one field must be provided for editing");
  }

  // Validate claimant name if provided
  if (request.claimantName !== undefined) {
    if (request.claimantName.trim().length === 0) {
      throw new ValidationError("Claimant name cannot be empty");
    }

    if (request.claimantName.length < 2) {
      throw new ValidationError("Claimant name must be at least 2 characters long");
    }
  }

  // Validate policy number if provided
  if (request.policyNumber !== undefined) {
    if (request.policyNumber.trim().length === 0) {
      throw new ValidationError("Policy number cannot be empty");
    }
  }

  // Validate claim amount if provided
  if (request.claimAmount !== undefined) {
    if (typeof request.claimAmount !== "number") {
      throw new ValidationError("Claim amount must be a number");
    }

    if (request.claimAmount <= 0) {
      throw new ValidationError("Claim amount must be greater than 0");
    }

    if (request.claimAmount > Number.MAX_SAFE_INTEGER) {
      throw new ValidationError("Claim amount exceeds maximum allowed value");
    }
  }
}
