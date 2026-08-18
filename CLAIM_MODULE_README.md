# Claim Management System

A comprehensive TypeScript-based insurance claim management system with user authentication, role-based access control, and admin dashboard. Features support for multiple claim types (Auto, Property, Health) with complete API integration.

## ✨ Features

### Core Claim Management
- ✅ Create new claims with validation
- ✅ Track claim status (Initiated, Pending, Approved, Rejected, Closed)
- ✅ Support for multiple claim types (Auto, Property, Health)
- ✅ Retrieve claims by ID, policy number, or claimant name
- ✅ Update claim status
- ✅ Comprehensive input validation
- ✅ Full TypeScript type support
- ✅ Unit tests included

### Authentication & Authorization
- ✅ User registration with validation
- ✅ User login with secure password verification
- ✅ Token-based authentication (Base64 encoded)
- ✅ Three user roles: Admin, Claims Adjuster, Customer
- ✅ Granular permission-based access control
- ✅ Role-based UI rendering
- ✅ Session management with localStorage

### Admin Features
- ✅ Admin dashboard with real-time statistics
- ✅ Claims approval workflow
- ✅ Claims rejection with reason tracking
- ✅ Claims adjustment with amount and notes
- ✅ Admin action audit trail
- ✅ Claims filtering by status
- ✅ User management capabilities

### Data Persistence
- ✅ JSON file-based database (no external DB required)
- ✅ User account storage
- ✅ Claims with admin tracking metadata
- ✅ Automatic data directory creation
- ✅ Human-readable JSON format

## Project Structure

```
claim/
├── src/
│   ├── types/
│   │   ├── claim.ts                      # Claim interfaces and enums
│   │   └── user.ts (NEW)                 # User roles and permissions
│   │
│   ├── services/
│   │   ├── claimService.ts               # Core claim management
│   │   ├── userService.ts (NEW)          # User auth and validation
│   │   ├── database.ts (NEW)             # JSON file persistence
│   │   └── validation.ts                 # Validation logic
│   │
│   ├── middleware/
│   │   └── auth.ts (NEW)                 # Auth and permission middleware
│   │
│   ├── api/
│   │   └── server.ts                     # Express.js API server
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── App.tsx                   # Main app (UPDATED)
│   │   │   ├── LoginRegister.tsx (NEW)   # Auth forms
│   │   │   ├── AdminDashboard.tsx (NEW)  # Admin panel
│   │   │   ├── ClaimForm.tsx             # Claim submission form
│   │   │   ├── ClaimsList.tsx            # Claims list view
│   │   │   └── Dashboard.tsx             # Customer dashboard
│   │   │
│   │   ├── styles/
│   │   │   ├── App.css (UPDATED)
│   │   │   ├── Auth.css (NEW)
│   │   │   ├── AdminDashboard.css (NEW)
│   │   │   ├── ClaimForm.css
│   │   │   ├── ClaimsList.css
│   │   │   ├── Dashboard.css
│   │   │   └── global.css
│   │   │
│   │   ├── index.tsx                     # React entry point
│   │   └── README.md
│   │
│   ├── __tests__/
│   │   └── claimService.test.ts          # Unit tests
│   │
│   └── index.ts                          # Main entry point
│
├── data/ (NEW)
│   ├── users.json                        # User database
│   └── claims.json                       # Claims database
│
├── public/
│   ├── index.html
│   └── bundle.js
│
├── dist/                                 # Compiled JavaScript output
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
├── jest.config.js                        # Jest testing config
├── webpack.config.js                     # Webpack bundling config
│
├── README.md                             # Original project documentation
├── CLAIM_MODULE_README.md                # This file
├── AUTHENTICATION_README.md (NEW)        # Auth system documentation
├── QUICKSTART.md (NEW)                   # Quick start guide
├── IMPLEMENTATION_SUMMARY.md (NEW)       # What was implemented
├── PROJECT_STRUCTURE.md (NEW)            # Detailed structure guide
│
└── .gitignore                            # Git ignore rules
```

## Installation

```bash
npm install
```

## Quick Start

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

3. **Register an account:**
   - Click "Register here"
   - Choose a role: Admin, Claims Adjuster, or Customer
   - Create your account

4. **Start using:**
   - Customers: Submit and manage claims
   - Admins: Approve/reject/adjust claims from dashboard
   - Claims Adjusters: Similar access to admins

## API Endpoints

### Authentication Routes

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "fullName": "John Doe",
  "role": "Customer|ClaimsAdjuster|Admin"
}

Response: { success: true, token: "...", user: {...} }
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}

Response: { success: true, token: "...", user: {...} }
```

### Claim Management Routes (All require Authorization header)

#### Create Claim
```
POST /api/claims
Authorization: Bearer {token}
Content-Type: application/json

{
  "claimantName": "John Doe",
  "policyNumber": "POL-2024-001",
  "claimType": "Auto|Property|Health",
  "claimAmount": 5000
}

Response: { success: true, data: {...claim} }
```

#### Get All Claims
```
GET /api/claims
Authorization: Bearer {token}

Response: { success: true, data: [{...claim}, ...] }
```

#### Get Claim by ID
```
GET /api/claims/:claimId
Authorization: Bearer {token}

Response: { success: true, data: {...claim} }
```

#### Get Claims by Policy
```
GET /api/claims/policy/:policyNumber
Authorization: Bearer {token}

Response: { success: true, data: [{...claim}, ...] }
```

#### Get Claims by Claimant Name
```
GET /api/claims/claimant/:claimantName
Authorization: Bearer {token}

Response: { success: true, data: [{...claim}, ...] }
```

#### Update Claim Status
```
PUT /api/claims/:claimId
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "Pending|Approved|Rejected|Closed"
}

Response: { success: true, data: {...updated_claim} }
```

### Admin Routes (Require Admin/ClaimsAdjuster role)

#### Get Dashboard Statistics
```
GET /api/admin/dashboard
Authorization: Bearer {token}

Response: { 
  success: true, 
  data: {
    totalClaims: number,
    pendingClaims: number,
    approvedClaims: number,
    rejectedClaims: number,
    closedClaims: number,
    totalAmount: number,
    claimsByType: { Auto: number, Property: number, Health: number }
  }
}
```

#### Get All Claims (Admin View)
```
GET /api/admin/claims
Authorization: Bearer {token}

Response: { success: true, data: [{...claim_with_admin_fields}, ...] }
```

#### Get Claims by Status
```
GET /api/admin/claims/status/:status
Authorization: Bearer {token}

Response: { success: true, data: [{...claim}, ...] }
```

#### Approve Claim
```
PUT /api/admin/claims/:claimId/approve
Authorization: Bearer {token}

Response: { 
  success: true, 
  data: {
    ...claim,
    status: "Approved",
    approvedBy: "admin_id",
    approvalDate: "2024-01-15T10:30:00Z"
  }
}
```

#### Reject Claim
```
PUT /api/admin/claims/:claimId/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "rejectionReason": "Insufficient documentation"
}

Response: { 
  success: true, 
  data: {
    ...claim,
    status: "Rejected",
    rejectionReason: "Insufficient documentation"
  }
}
```

#### Adjust Claim Amount
```
PUT /api/admin/claims/:claimId/adjust
Authorization: Bearer {token}
Content-Type: application/json

{
  "adjustedAmount": 4500,
  "adjustmentNotes": "Partial coverage approval"
}

Response: { 
  success: true, 
  data: {
    ...claim,
    adjustedAmount: 4500,
    adjustmentNotes: "Partial coverage approval"
  }
}
```

### Health Check
```
GET /health
Response: { status: "ok" }
```

### Swagger Documentation
```
GET /swagger.json
Response: OpenAPI/Swagger specification
```

## User Roles & Permissions

### Role Capabilities

| Feature | Admin | Claims Adjuster | Customer |
|---------|-------|-----------------|----------|
| Create Claims | ✅ | ✅ | ✅ |
| View Own Claims | ✅ | ✅ | ✅ |
| View All Claims | ✅ | ✅ | ❌ |
| Approve Claims | ✅ | ✅ | ❌ |
| Reject Claims | ✅ | ✅ | ❌ |
| Adjust Amounts | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ❌ |
| Access Admin Panel | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

### Permissions System

Each role has the following permissions:

**Admin:** 
- CREATE_CLAIM, VIEW_CLAIM, EDIT_CLAIM, DELETE_CLAIM
- APPROVE_CLAIM, REJECT_CLAIM, ADJUST_CLAIM
- MANAGE_USERS, VIEW_ADMIN_DASHBOARD

**Claims Adjuster:**
- CREATE_CLAIM, VIEW_CLAIM, EDIT_CLAIM
- APPROVE_CLAIM, REJECT_CLAIM, ADJUST_CLAIM
- VIEW_ADMIN_DASHBOARD

**Customer:**
- CREATE_CLAIM, VIEW_CLAIM, EDIT_CLAIM

## Core Service Methods

### ClaimService Methods
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

### IClaim (Updated)
```typescript
interface IClaim {
  claimId: string;
  claimantName: string;
  policyNumber: string;
  claimType: ClaimType;
  claimAmount: number;
  status: ClaimStatus;
  userId?: string;                    // User who created claim
  approvedBy?: string;                // Admin who approved
  approvalDate?: Date;                // When approved
  rejectionReason?: string;           // If rejected
  adjustedAmount?: number;            // Admin-adjusted amount
  adjustmentNotes?: string;           // Adjustment notes
  createdAt: Date;
  updatedAt: Date;
}
```

### IUser (New)
```typescript
interface IUser {
  userId: string;
  username: string;
  email: string;
  password: string;                   // SHA-256 hashed
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

### UserRole Enum (New)
```typescript
enum UserRole {
  ADMIN = "Admin",
  CLAIMS_ADJUSTER = "ClaimsAdjuster",
  CUSTOMER = "Customer"
}
```

### Permission Enum (New)
```typescript
enum Permission {
  CREATE_CLAIM = "CREATE_CLAIM",
  VIEW_CLAIM = "VIEW_CLAIM",
  EDIT_CLAIM = "EDIT_CLAIM",
  DELETE_CLAIM = "DELETE_CLAIM",
  APPROVE_CLAIM = "APPROVE_CLAIM",
  REJECT_CLAIM = "REJECT_CLAIM",
  ADJUST_CLAIM = "ADJUST_CLAIM",
  MANAGE_USERS = "MANAGE_USERS",
  VIEW_ADMIN_DASHBOARD = "VIEW_ADMIN_DASHBOARD"
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

### IRegisterRequest (New)
```typescript
interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
}
```

### ILoginRequest (New)
```typescript
interface ILoginRequest {
  username: string;
  password: string;
}
```

### IAuthResponse (New)
```typescript
interface IAuthResponse {
  success: boolean;
  token: string;
  user: IUser;
  error?: string;
}
```

## Authentication

### Token Format
- **Type:** Base64 encoded string
- **Format:** `Base64(userId:username)`
- **Location:** HTTP `Authorization` header as `Bearer {token}`
- **Expiration:** Session-based (stored in localStorage)

### Password Security
- **Algorithm:** SHA-256 hashing
- **Storage:** Hashed passwords in `data/users.json`
- **Validation:** Minimum 6 characters
- **Future Enhancement:** bcrypt recommended for production

### Session Management
- Tokens stored in browser localStorage
- Automatic logout on 401 response
- Session cleared on browser close
- Auto-login if token still valid

## Database

### Storage Format
- **Type:** JSON files
- **Location:** `data/` directory (auto-created)
- **Files:**
  - `data/users.json` - User accounts
  - `data/claims.json` - Insurance claims

### Data Persistence
- All data persisted to JSON files
- Automatic file creation on first run
- Human-readable format for debugging
- Easy migration to MongoDB/PostgreSQL

## Error Handling

### Common Error Responses

#### 400 - Bad Request
- Invalid request body
- Missing required fields
- Validation errors

#### 401 - Unauthorized
- Invalid or missing token
- Expired session
- User not authenticated

#### 403 - Forbidden
- User lacks required permission
- Insufficient role privileges
- Access denied

#### 404 - Not Found
- Claim ID not found
- Resource doesn't exist

#### 500 - Server Error
- Unexpected server error
- Database connection issues

### Error Response Format
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
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

## UI Components

### LoginRegister Component
**File:** `src/ui/components/LoginRegister.tsx`

**Features:**
- User registration form with validation
- User login form
- Role selection (Admin, Claims Adjuster, Customer)
- Error and success messages
- Form state management

**Props:**
```typescript
interface LoginRegisterProps {
  onAuthSuccess: (token: string, user: any) => void;
}
```

### AdminDashboard Component
**File:** `src/ui/components/AdminDashboard.tsx`

**Features:**
- Real-time statistics display
- Claims management table
- Filter by status (Pending, Approved, Rejected, Closed)
- Approve claim action
- Reject claim with reason modal
- Adjust claim amount modal
- Responsive grid layout

**Props:**
```typescript
interface AdminDashboardProps {
  token: string;
  user: IUser;
  onLogout: () => void;
}
```

### ClaimForm Component
**File:** `src/ui/components/ClaimForm.tsx`

**Features:**
- Form validation
- Claim type selection
- Amount validation
- Loading state
- Error handling

### ClaimsList Component
**File:** `src/ui/components/ClaimsList.tsx`

**Features:**
- Display all user claims
- Status badges
- Expandable claim details
- Refresh button
- Status update actions

## Security Considerations

### Authentication
✅ Token-based (stateless) authentication
✅ Password hashing (SHA-256)
✅ CORS enabled with Authorization header
✅ 401 response for invalid tokens
✅ User.isActive flag prevents inactive user access

### Authorization
✅ Role-based access control
✅ Permission-based endpoint protection
✅ Middleware enforcement
✅ User data isolation

### Best Practices
⚠️ **Development Only:** Current implementation uses SHA-256
✅ **Production:** Use bcrypt for password hashing
✅ **Production:** Use JWT with expiration
✅ **Production:** Implement rate limiting
✅ **Production:** Use HTTPS/TLS
✅ **Production:** Add audit logging
✅ **Production:** Migrate to production database

## Environment Setup

### Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run server and watch
npm run server
```

### Production
```bash
# Build TypeScript
npm run build

# Start compiled server
npm start

# Or build and start
npm run server
```

### Configuration
- **Port:** 3000 (default)
- **Database:** `data/` directory (auto-created)
- **CORS:** Allows all origins (for development)
- **API Base:** `http://localhost:3000/api`

## Troubleshooting

### Can't login
- Verify username and password are correct
- Check if user account is active (isActive: true)
- Check browser console for detailed error message

### Claims not appearing
- Verify you're logged in with correct token
- Check browser localStorage for token
- Customer sees only their own claims
- Admin/Adjuster sees all claims

### Admin dashboard not loading
- Verify you're logged in as Admin or Claims Adjuster
- Check user role in browser localStorage
- Verify authorization header is sent

### Port 3000 already in use
- Change port in server configuration
- Or kill the process using port 3000

### Data not persisting
- Verify `data/` directory exists with read/write permissions
- Check `data/users.json` and `data/claims.json` exist
- Look for errors in server console

## Documentation References

- **AUTHENTICATION_README.md** - Detailed authentication system documentation
- **QUICKSTART.md** - Quick setup and testing guide
- **IMPLEMENTATION_SUMMARY.md** - What was implemented and why
- **PROJECT_STRUCTURE.md** - Detailed project structure guide

## Support

For issues or questions:
1. Check the QUICKSTART.md for common solutions
2. Review AUTHENTICATION_README.md for detailed technical info
3. Check browser console for error messages
4. Review server logs for backend errors

## License

ISC
