import express, { Express, Request, Response } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { ClaimService } from "../services/claimService";
import { UserService } from "../services/userService";
import { ClaimType, ClaimStatus } from "../types/claim";
import { UserRole, Permission } from "../types/user";
import { ValidationError } from "../utils/validation";
import {
  authMiddleware,
  requirePermission,
  requireRole,
  generateAuthToken,
  AuthenticatedRequest,
} from "../middleware/auth";

const app: Express = express();
const PORT = process.env.PORT || 3000;
const claimService = new ClaimService();
const userService = new UserService();

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../public")));

// CORS middleware
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Swagger documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Claim Management API",
    description: "API for managing insurance claims with authentication and admin features",
    version: "2.0.0",
  },
  servers: [
    {
      url: "",
      description: "Current server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
  paths: {},
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve swagger spec as JSON
app.get("/swagger.json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// ==================== Authentication Routes ====================

// Register
app.post("/api/auth/register", (req: Request, res: Response) => {
  try {
    const user = userService.register(req.body);
    const token = generateAuthToken(user.userId, user.username);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

// Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const user = userService.login(req.body);
    const token = generateAuthToken(user.userId, user.username);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(401).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

// ==================== Admin Routes ====================

// Get admin dashboard stats
app.get(
  "/api/admin/dashboard",
  authMiddleware,
  requireRole([UserRole.ADMIN, UserRole.CLAIMS_ADJUSTER]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const allClaims = claimService.getAllClaims();

      const stats = {
        totalClaims: allClaims.length,
        pendingClaims: allClaims.filter((c) => c.status === ClaimStatus.PENDING).length,
        approvedClaims: allClaims.filter((c) => c.status === ClaimStatus.APPROVED).length,
        rejectedClaims: allClaims.filter((c) => c.status === ClaimStatus.REJECTED).length,
        closedClaims: allClaims.filter((c) => c.status === ClaimStatus.CLOSED).length,
        totalClaimAmount: allClaims.reduce((sum, c) => sum + c.claimAmount, 0),
        approvedAmount: allClaims
          .filter((c) => c.status === ClaimStatus.APPROVED)
          .reduce((sum, c) => sum + (c.adjustedAmount || c.claimAmount), 0),
        claimsByType: {
          auto: allClaims.filter((c) => c.claimType === ClaimType.AUTO).length,
          property: allClaims.filter((c) => c.claimType === ClaimType.PROPERTY).length,
          health: allClaims.filter((c) => c.claimType === ClaimType.HEALTH).length,
        },
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Get all claims (admin view)
app.get(
  "/api/admin/claims",
  authMiddleware,
  requireRole([UserRole.ADMIN, UserRole.CLAIMS_ADJUSTER]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claims = claimService.getAllClaims();
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Get claims by status (admin)
app.get(
  "/api/admin/claims/status/:status",
  authMiddleware,
  requireRole([UserRole.ADMIN, UserRole.CLAIMS_ADJUSTER]),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = req.params.status as ClaimStatus;
      const claims = claimService.getClaimsByStatus(status);
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Approve claim (admin only)
app.put(
  "/api/admin/claims/:claimId/approve",
  authMiddleware,
  requirePermission(Permission.APPROVE_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claim = claimService.approveClaim(req.params.claimId, req.user?.userId);
      if (!claim) {
        res.status(404).json({ success: false, error: "Claim not found" });
      } else {
        res.json({ success: true, data: claim, message: "Claim approved successfully" });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Reject claim (admin only)
app.put(
  "/api/admin/claims/:claimId/reject",
  authMiddleware,
  requirePermission(Permission.REJECT_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claim = claimService.rejectClaim(req.params.claimId, req.body);
      if (!claim) {
        res.status(404).json({ success: false, error: "Claim not found" });
      } else {
        res.json({ success: true, data: claim, message: "Claim rejected successfully" });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  }
);

// Adjust claim (admin only)
app.put(
  "/api/admin/claims/:claimId/adjust",
  authMiddleware,
  requirePermission(Permission.ADJUST_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claim = claimService.adjustClaim(req.params.claimId, req.body);
      if (!claim) {
        res.status(404).json({ success: false, error: "Claim not found" });
      } else {
        res.json({ success: true, data: claim, message: "Claim adjusted successfully" });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  }
);

// ==================== Claim Routes ====================

// Create a new claim
app.post(
  "/api/claims",
  authMiddleware,
  requirePermission(Permission.CREATE_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claim = claimService.initiateClaim(req.body, req.user?.userId);
      res.status(201).json({ success: true, data: claim });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  }
);

// Get all claims
app.get(
  "/api/claims",
  authMiddleware,
  requirePermission(Permission.VIEW_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      let claims;

      // If user is admin/adjuster, show all claims. Otherwise show only their claims.
      if (
        userService.hasRole(req.user!, [UserRole.ADMIN, UserRole.CLAIMS_ADJUSTER])
      ) {
        claims = claimService.getAllClaims();
      } else {
        claims = claimService.getClaimsByUserId(req.user!.userId);
      }

      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Get claims by policy number
app.get(
  "/api/claims/policy/:policyNumber",
  authMiddleware,
  requirePermission(Permission.VIEW_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claims = claimService.getClaimsByPolicy(req.params.policyNumber);
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Get claims by claimant name
app.get(
  "/api/claims/claimant/:claimantName",
  authMiddleware,
  requirePermission(Permission.VIEW_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claims = claimService.getClaimsByClaimant(req.params.claimantName);
      res.json({ success: true, data: claims });
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Get claim by ID
app.get(
  "/api/claims/:claimId",
  authMiddleware,
  requirePermission(Permission.VIEW_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const claim = claimService.getClaimById(req.params.claimId);
      if (!claim) {
        res.status(404).json({ success: false, error: "Claim not found" });
      } else {
        res.json({ success: true, data: claim });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// Update claim (edit details)
app.put(
  "/api/claims/:claimId",
  authMiddleware,
  requirePermission(Permission.EDIT_CLAIM),
  (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, claimantName, policyNumber, claimAmount } = req.body;

      let claim;
      if (status) {
        claim = claimService.updateClaimStatus(req.params.claimId, status as ClaimStatus);
      } else if (claimantName || policyNumber || claimAmount !== undefined) {
        claim = claimService.editClaim(req.params.claimId, {
          claimantName,
          policyNumber,
          claimAmount,
        });
      } else {
        res.status(400).json({
          success: false,
          error:
            "Either status or claim details (claimantName, policyNumber, claimAmount) must be provided",
        });
        return;
      }

      if (!claim) {
        res.status(404).json({ success: false, error: "Claim not found" });
      } else {
        res.json({ success: true, data: claim });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    }
  }
);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Claim API is running" });
});

// Serve React app on root
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`✓ Health Check: http://localhost:${PORT}/health`);
});

export default app;
