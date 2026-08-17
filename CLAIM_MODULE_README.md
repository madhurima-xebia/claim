# Claim Initiation Module

A TypeScript-based module for initiating and managing insurance claims with support for multiple claim types (Auto, Property, Health).

## Features

- ✅ Create new claims with validation
- ✅ Track claim status (Initiated, Pending, Approved, Rejected, Closed)
- ✅ Support for multiple claim types (Auto, Property, Health)
- ✅ Retrieve claims by ID, policy number, or claimant name
- ✅ Update claim status
- ✅ Comprehensive input validation
- ✅ Full TypeScript type support
- ✅ Unit tests included

## Project Structure

```
claim/
├── src/
│   ├── types/
│   │   └── claim.ts           # TypeScript interfaces and enums
│   ├── services/
│   │   └── claimService.ts    # Core claim management service
│   ├── utils/
│   │   └── validation.ts      # Validation logic
│   ├── __tests__/
│   │   └── claimService.test.ts # Unit tests
│   └── index.ts               # Main entry point
├── dist/                       # Compiled JavaScript output
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── .gitignore                # Git ignore rules
```

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

## Usage

### Basic Example

```typescript
import { ClaimService, ClaimType } from './src/index';

const claimService = new ClaimService();

// Create a new claim
const claim = claimService.initiateClaim({
  claimantName: "John Doe",
  policyNumber: "POL-2024-001",
  claimType: ClaimType.AUTO,
  claimAmount: 5000
});

console.log(claim);
// Output:
// {
//   claimId: "CLM-550e8400-e29b-41d4-a716-446655440000",
//   claimantName: "John Doe",
//   policyNumber: "POL-2024-001",
//   claimType: "Auto",
//   claimAmount: 5000,
//   status: "Initiated",
//   createdAt: 2024-01-15T10:30:00.000Z,
//   updatedAt: 2024-01-15T10:30:00.000Z
// }
```

### Available Methods

#### `initiateClaim(request: ICreateClaimRequest): IClaim`
Creates and returns a new claim with validation.

**Parameters:**
- `claimantName` (string): Name of the claimant (required, min 2 characters)
- `policyNumber` (string): Policy number (required)
- `claimType` (ClaimType): Type of claim - `Auto`, `Property`, or `Health`
- `claimAmount` (number): Claim amount in currency units (required, must be > 0)

**Throws:**
- `ValidationError` if any validation fails

#### `getClaimById(claimId: string): IClaim | undefined`
Retrieves a claim by its ID.

#### `getClaimsByPolicy(policyNumber: string): IClaim[]`
Retrieves all claims for a specific policy number.

#### `getClaimsByClaimant(claimantName: string): IClaim[]`
Retrieves all claims for a specific claimant.

#### `updateClaimStatus(claimId: string, status: ClaimStatus): IClaim | undefined`
Updates the status of an existing claim.

#### `getAllClaims(): IClaim[]`
Retrieves all claims in the system.

#### `deleteClaim(claimId: string): boolean`
Deletes a claim by ID.

## Claim Types

```typescript
enum ClaimType {
  AUTO = "Auto",
  PROPERTY = "Property",
  HEALTH = "Health"
}
```

## Claim Status

```typescript
enum ClaimStatus {
  INITIATED = "Initiated",
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CLOSED = "Closed"
}
```

## Validation Rules

- **Claimant Name**: Required, must be at least 2 characters long
- **Policy Number**: Required, cannot be empty
- **Claim Type**: Must be one of the predefined types (Auto, Property, Health)
- **Claim Amount**: Must be a positive number, cannot exceed `Number.MAX_SAFE_INTEGER`

## Testing

Run the test suite:

```bash
npm test
```

Tests are located in `src/__tests__/` and cover:
- Successful claim creation
- Validation error handling
- Claim retrieval operations
- Status updates

## Running the Example

To run the example in the index file:

```bash
npm run dev
```

Or after building:

```bash
npm start
```

## Interfaces

### IClaim
```typescript
interface IClaim {
  claimId: string;
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimAmount: number;
  status: ClaimStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### ICreateClaimRequest
```typescript
interface ICreateClaimRequest {
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimAmount: number;
}
```

## Error Handling

The module provides a `ValidationError` class for validation-related errors:

```typescript
import { ClaimService, ValidationError } from './src/index';

try {
  claimService.initiateClaim({
    claimantName: "",
    policyNumber: "POL-2024-001",
    claimType: ClaimType.AUTO,
    claimAmount: 5000
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.message);
  }
}
```

## License

ISC
