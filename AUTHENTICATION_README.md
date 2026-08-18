# User Authentication & Admin Dashboard Implementation Guide

## 📋 Overview

This guide explains the new authentication, role-based access control (RBAC), and admin dashboard features added to the Claim Management System.

## 🏗️ Architecture

### New Components

#### 1. **User Types & Roles** (`src/types/user.ts`)
- **User Roles:**
  - `Admin` - Full system access, can approve/reject/adjust claims
  - `ClaimsAdjuster` - Can review and modify claims
  - `Customer` - Can only create and view their own claims

- **Permissions:**
  - `CREATE_CLAIM` - Create new claims
  - `VIEW_CLAIM` - View claims
  - `EDIT_CLAIM` - Edit claim details
  - `APPROVE_CLAIM` - Approve pending claims
  - `REJECT_CLAIM` - Reject pending claims
  - `ADJUST_CLAIM` - Adjust claim amounts
  - `MANAGE_USERS` - Manage user accounts
  - `VIEW_ADMIN_DASHBOARD` - Access admin dashboard

#### 2. **Database Service** (`src/services/database.ts`)
- JSON-based persistence layer
- Stores users and claims in `data/users.json` and `data/claims.json`
- Provides CRUD operations for both entities
- Automatically creates data directory and files if missing

#### 3. **User Service** (`src/services/userService.ts`)
- Handles user registration and login
- Password hashing using SHA-256
- User validation and permission checking
- Role management

#### 4. **Authentication Middleware** (`src/middleware/auth.ts`)
- Token-based authentication (Base64 encoded userId:username)
- Permission-based authorization
- Role-based authorization
- Generates and validates authentication tokens

#### 5. **React Components**

**LoginRegister Component** (`src/ui/components/LoginRegister.tsx`)
- Combined login/register form
- Support for customer registration with role selection
- Form validation
- Error and success messages

**AdminDashboard Component** (`src/ui/components/AdminDashboard.tsx`)
- Dashboard statistics (total, pending, approved, rejected, closed claims)
- Claims by type breakdown
- Claims management table with filtering
- Action buttons:
  - Approve claims
  - Reject claims (with reason)
  - Adjust claim amounts
  - Real-time status updates

## 🔐 Authentication Flow

### Registration
```
1. User fills registration form
2. UserService validates input
3. Password is hashed (SHA-256)
4. User is saved to database
5. Auth token is generated
6. User is logged in automatically
```

### Login
```
1. User enters username and password
2. UserService looks up user by username
3. Password is verified against hash
4. Auth token is generated
5. User data is stored in localStorage
6. Token is sent with all subsequent API requests
```

### Token Format
```
Token = Base64(userId:username)
Header = "Authorization: Bearer {token}"
```

## 🔌 API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user

### Admin Dashboard
- **GET** `/api/admin/dashboard` - Get dashboard statistics
- **GET** `/api/admin/claims` - Get all claims (admin view)
- **GET** `/api/admin/claims/status/:status` - Get claims by status
- **PUT** `/api/admin/claims/:claimId/approve` - Approve claim
- **PUT** `/api/admin/claims/:claimId/reject` - Reject claim with reason
- **PUT** `/api/admin/claims/:claimId/adjust` - Adjust claim amount

### Claims (Protected)
- **POST** `/api/claims` - Create new claim (requires auth)
- **GET** `/api/claims` - Get user's claims or all claims (admin)
- **GET** `/api/claims/:claimId` - Get specific claim
- **PUT** `/api/claims/:claimId` - Edit claim details
- **GET** `/api/claims/policy/:policyNumber` - Get claims by policy
- **GET** `/api/claims/claimant/:claimantName` - Get claims by claimant

## 📊 Database Structure

### users.json
```json
[
  {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "password": "sha256-hash",
    "fullName": "string",
    "role": "Admin|ClaimsAdjuster|Customer",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "isActive": true
  }
]
```

### claims.json
```json
[
  {
    "claimId": "CLM-AUTO-0001",
    "claimantName": "string",
    "policyNumber": "string",
    "claimType": "Auto|Property|Health",
    "claimAmount": 5000,
    "status": "Pending|Approved|Rejected|Closed",
    "userId": "uuid",
    "approvedBy": "uuid",
    "approvalDate": "ISO-8601",
    "rejectionReason": "string",
    "adjustedAmount": 4500,
    "adjustmentNotes": "string",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
]
```

## 🚀 Usage Guide

### For Customers

1. **Register**
   - Go to registration page
   - Fill in username, email, password, full name
   - Select "Customer" role
   - Click Register

2. **Create Claim**
   - Click "➕ New Claim"
   - Fill in claimant name, policy number, claim type, amount
   - Submit
   - View confirmation message

3. **View Claims**
   - Click "📊 View Claims"
   - See list of your submitted claims
   - View status and details

### For Admins/Claims Adjusters

1. **Login**
   - Enter username and password
   - System automatically shows admin dashboard

2. **Dashboard**
   - View statistics:
     - Total claims
     - Pending, Approved, Rejected, Closed counts
     - Total and approved amounts
     - Claims by type

3. **Manage Claims**
   - View all claims in table
   - Filter by status (Pending, Approved, Rejected)
   - For pending claims:
     - **Approve** - Approve the claim
     - **Reject** - Reject with reason
     - **Adjust** - Change the claim amount

## 🔧 Setup & Configuration

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Development
```bash
npm run dev
```

### Start Server
```bash
npm run server
```

### Build & Start Production
```bash
npm run server:build
```

### Run Tests
```bash
npm test
```

## 📝 Example Test Credentials

After registration, you can create accounts with:

**Admin Account:**
- Username: admin
- Email: admin@example.com
- Password: admin123
- Role: Admin

**Customer Account:**
- Username: customer1
- Email: customer@example.com
- Password: customer123
- Role: Customer

**Claims Adjuster Account:**
- Username: adjuster1
- Email: adjuster@example.com
- Password: adjuster123
- Role: ClaimsAdjuster

## 🔒 Security Considerations

1. **Password Hashing** - Passwords are hashed using SHA-256
2. **Token-Based Auth** - Stateless authentication using Bearer tokens
3. **Permission Checks** - Every API endpoint validates user permissions
4. **Role-Based Access** - Routes are protected by role-based middleware
5. **Data Persistence** - Sensitive operations logged and tracked

### Future Enhancements:
- Use bcrypt for stronger password hashing
- Implement JWT with expiration
- Add rate limiting
- Implement audit logging
- Add email verification
- Two-factor authentication

## 📁 File Structure

```
src/
├── types/
│   ├── user.ts (new) - User and role types
│   └── claim.ts (updated) - Added user tracking fields
├── services/
│   ├── database.ts (new) - JSON persistence layer
│   ├── userService.ts (new) - User management
│   └── claimService.ts (updated) - Added admin operations
├── middleware/
│   └── auth.ts (new) - Authentication & authorization
├── api/
│   └── server.ts (updated) - New auth & admin routes
└── ui/
    ├── components/
    │   ├── LoginRegister.tsx (new) - Auth UI
    │   ├── AdminDashboard.tsx (new) - Admin UI
    │   └── App.tsx (updated) - Routing logic
    └── styles/
        ├── Auth.css (new)
        └── AdminDashboard.css (new)

data/
├── users.json (new) - User database
└── claims.json (new) - Claims database
```

## 🐛 Troubleshooting

### "Authentication token required"
- Make sure you're logged in
- Check browser console for errors
- Clear localStorage and login again

### "Insufficient permissions"
- Verify your user role
- Admin/Claims Adjuster accounts have all permissions
- Customers can only create/view claims

### Data not persisting
- Check if `data/` directory exists
- Verify file permissions
- Check console for write errors

### CORS errors
- Make sure Authorization header is included
- Check that server is running on correct port
- Verify CORS headers in server.ts

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [JWT Authentication](https://jwt.io/)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for error messages
4. Review server logs for backend errors
