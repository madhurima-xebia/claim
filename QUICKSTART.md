# Quick Start Guide - New Authentication System

## 🎯 What's New?

Your Claim Management System now has:
✅ User authentication (login/register)
✅ Role-based access control (Admin, Claims Adjuster, Customer)
✅ Admin dashboard with claim management
✅ Claim approval, rejection, and adjustment functionality
✅ JSON-based persistent storage

## 🚀 Getting Started (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run server
```
Server will start on `http://localhost:3000`

### 3. Open in Browser
```
http://localhost:3000
```

### 4. Register Your First Account
- Click "Register here"
- Fill in your details:
  - **Username**: Choose any username (min 3 characters)
  - **Email**: Your email address
  - **Password**: At least 6 characters
  - **Full Name**: Your full name
  - **Role**: Choose your role:
    - `Customer` - For creating/viewing claims
    - `Claims Adjuster` - For managing claims
    - `Admin` - Full system access
- Click "Register"

### 5. Start Using the System

**If Customer:**
- Click "➕ New Claim" to create a claim
- Click "📊 View Claims" to see your claims

**If Admin/Claims Adjuster:**
- You'll automatically see the admin dashboard
- View statistics and manage all claims
- Approve, reject, or adjust claims as needed

## 📊 Testing the System

### Test Scenario 1: Create and Manage a Claim

1. **Register as Customer**
   - Username: `testcustomer`
   - Role: `Customer`

2. **Create a Test Claim**
   - Click "New Claim"
   - Claimant Name: `John Doe`
   - Policy Number: `POL-2024-001`
   - Claim Type: `Auto`
   - Amount: `5000`
   - Click Submit

3. **Switch to Admin Account**
   - Open incognito window or different browser
   - Register as Admin:
     - Username: `testadmin`
     - Role: `Admin`
   - View the dashboard with your test claim
   - Approve or adjust the claim

### Test Scenario 2: Test Different Roles

**Customer Capabilities:**
- ✅ Register and login
- ✅ Create claims
- ✅ View their own claims
- ❌ Cannot see other customers' claims
- ❌ Cannot approve/reject claims

**Claims Adjuster Capabilities:**
- ✅ View all claims
- ✅ Filter by status
- ✅ Approve pending claims
- ✅ Reject with reason
- ✅ Adjust amounts
- ❌ Cannot delete claims
- ❌ Cannot manage users

**Admin Capabilities:**
- ✅ Everything Claims Adjuster can do
- ✅ Full dashboard access
- ✅ View all statistics
- ✅ Manage users (future)
- ✅ System-wide reports (future)

## 💾 Data Storage

Your data is automatically stored in JSON files:
- `data/users.json` - User accounts
- `data/claims.json` - All claims

**Important:** These files are created automatically on first run.

## 🔑 Key Features

### Admin Dashboard
```
┌─────────────────────────────────────────────┐
│         Dashboard Statistics                 │
├─────────────────────────────────────────────┤
│ Total Claims: 10  │  Pending: 5             │
│ Approved: 3       │  Rejected: 2            │
│ Total Amount: $50,000                       │
├─────────────────────────────────────────────┤
│         Claims Management Table             │
├─────────────────────────────────────────────┤
│ Claim ID │ Name │ Amount │ Status │ Actions │
│ ---------|------|--------|--------|---------|
│ CLM-001  │ John │ $5000  │Pending │ [A][R] │
└─────────────────────────────────────────────┘
[A] = Approve  [R] = Reject
```

### Actions on Claims

**Approve Claim**
- Click "Approve" button
- Claim status changes to "Approved"
- Admin ID is recorded

**Reject Claim**
- Click "Reject" button
- Enter rejection reason in popup
- Claim status changes to "Rejected"
- Reason is recorded

**Adjust Amount**
- Click "Adjust" button
- Enter new amount
- Original and adjusted amounts are tracked
- Useful for partial approvals

## 🛠️ Troubleshooting

### "Cannot find module" error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run server
```

### Port 3000 already in use
```bash
# Change port in environment variable
PORT=3001 npm run server
```

### Data not saving
- Check that `data/` directory exists
- Check file permissions
- Look for errors in console

### Login not working
- Verify username and password are correct
- Check that user was registered in the system
- Try clearing browser cache/localStorage

### Admin dashboard not showing
- Make sure you registered with "Admin" or "ClaimsAdjuster" role
- Logout and login again
- Check browser console for errors

## 📋 API Testing (Optional)

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Get Dashboard Stats (use token from login):**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer {token}"
```

## 🎓 Learning Path

1. **Understand the System**
   - Read AUTHENTICATION_README.md for technical details
   - Review the API endpoints documentation

2. **Test User Flows**
   - Test customer registration and claim creation
   - Test admin claim management
   - Test different role permissions

3. **Customize (Optional)**
   - Modify claim types in `src/types/claim.ts`
   - Add new roles in `src/types/user.ts`
   - Update dashboard statistics
   - Add new permission types

4. **Production Deployment**
   - Switch to bcrypt for password hashing
   - Implement JWT with expiration
   - Add database layer (MongoDB/PostgreSQL)
   - Add email notifications
   - Implement audit logging

## 📞 Common Tasks

### Create an admin account programmatically
```typescript
import { userService } from "./src/services/userService";
import { UserRole } from "./src/types/user";

const admin = userService.register({
  username: "admin",
  email: "admin@example.com",
  password: "admin123",
  confirmPassword: "admin123",
  fullName: "System Admin",
  role: UserRole.ADMIN,
});
```

### View all users
```bash
# Open data/users.json file
cat data/users.json
```

### View all claims
```bash
# Open data/claims.json file
cat data/claims.json
```

### Reset the system
```bash
# Clear all data
rm data/users.json data/claims.json
npm run server
# System will recreate empty files
```

## ✅ Checklist

- [ ] Node.js and npm installed
- [ ] npm dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm run server`)
- [ ] Webpage loads at http://localhost:3000
- [ ] Can register a new account
- [ ] Can login with registered account
- [ ] Customer can create claims
- [ ] Admin can see dashboard
- [ ] Admin can approve/reject claims

## 🎉 Next Steps

1. **Explore the Admin Dashboard**
   - Create test claims as customer
   - Review them as admin
   - Try different actions

2. **Customize for Your Needs**
   - Modify claim types
   - Add custom fields
   - Update styling

3. **Plan for Production**
   - Choose a database
   - Implement better authentication
   - Add email notifications
   - Setup logging and monitoring

## 📚 Resources

- **Full Documentation**: See AUTHENTICATION_README.md
- **API Reference**: `/api-docs` (Swagger UI)
- **Type Definitions**: `src/types/` directory
- **Component Examples**: `src/ui/components/` directory

---

**Happy Claims Managing! 🎉**

For detailed technical documentation, see AUTHENTICATION_README.md
