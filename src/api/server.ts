import express, { Express, Request, Response } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import { ClaimService } from "../services/claimService";
import { ClaimType, ClaimStatus } from "../types/claim";
import { ValidationError } from "../utils/validation";

const app: Express = express();
const PORT = process.env.PORT || 3000;
const claimService = new ClaimService();

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../public")));

// CORS middleware
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
    description: "API for managing insurance claims",
    version: "1.0.0",
  },
  servers: [
    {
      url: "",
      description: "Current server",
    },
  ],
  paths: {
    "/api/claims": {
      post: {
        summary: "Create a new claim",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "claimantName",
                  "policyNumber",
                  "claimType",
                  "claimAmount",
                ],
                properties: {
                  claimantName: {
                    type: "string",
                    example: "John Doe",
                    description: "Name of the claimant (min 2 characters)",
                  },
                  policyNumber: {
                    type: "string",
                    example: "POL-2024-001",
                    description: "Policy number",
                  },
                  claimType: {
                    type: "string",
                    enum: ["Auto", "Property", "Health"],
                    example: "Auto",
                    description: "Type of claim",
                  },
                  claimAmount: {
                    type: "number",
                    example: 5000,
                    description: "Claim amount (must be greater than 0)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Claim created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        claimId: { type: "string" },
                        claimantName: { type: "string" },
                        policyNumber: { type: "string" },
                        claimType: { type: "string" },
                        claimAmount: { type: "number" },
                        status: { type: "string" },
                        createdAt: { type: "string" },
                        updatedAt: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
          },
        },
      },
      get: {
        summary: "Get all claims",
        responses: {
          200: {
            description: "List of all claims",
          },
        },
      },
    },
    "/api/claims/{claimId}": {
      get: {
        summary: "Get claim by ID",
        parameters: [
          {
            name: "claimId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Claim found" },
          404: { description: "Claim not found" },
        },
      },
      put: {
        summary: "Update claim (edit details or status)",
        parameters: [
          {
            name: "claimId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: [
                      "Initiated",
                      "Pending",
                      "Approved",
                      "Rejected",
                      "Closed",
                    ],
                    description: "Update claim status",
                  },
                  claimantName: {
                    type: "string",
                    description: "Update claimant name",
                  },
                  policyNumber: {
                    type: "string",
                    description: "Update policy number",
                  },
                  claimAmount: {
                    type: "number",
                    description: "Update claim amount",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Claim updated successfully" },
          400: { description: "Validation error" },
          404: { description: "Claim not found" },
        },
      },
    },
    "/api/claims/{claimId}/approve": {
      put: {
        summary: "Approve a claim",
        parameters: [
          {
            name: "claimId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Claim approved successfully" },
          404: { description: "Claim not found" },
        },
      },
    },
    "/api/claims/{claimId}/reject": {
      put: {
        summary: "Reject a claim",
        parameters: [
          {
            name: "claimId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Claim rejected successfully" },
          404: { description: "Claim not found" },
        },
      },
    },
    "/api/claims/policy/{policyNumber}": {
      get: {
        summary: "Get claims by policy number",
        parameters: [
          {
            name: "policyNumber",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "List of claims for the policy" },
        },
      },
    },
    "/api/claims/claimant/{claimantName}": {
      get: {
        summary: "Get claims by claimant name",
        parameters: [
          {
            name: "claimantName",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "List of claims for the claimant" },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    urls: [
      {
        url: "/swagger.json",
        name: "Claim API"
      }
    ],
    deepLinking: true
  }
}));

// Serve swagger spec as JSON
app.get("/swagger.json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Routes

// Create a new claim
app.post("/api/claims", (req: Request, res: Response) => {
  try {
    const claim = claimService.initiateClaim(req.body);
    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

// Get all claims
app.get("/api/claims", (req: Request, res: Response) => {
  const claims = claimService.getAllClaims();
  res.json({ success: true, data: claims });
});

// Get claims by policy number (specific routes before generic :id route)
app.get("/api/claims/policy/:policyNumber", (req: Request, res: Response) => {
  const claims = claimService.getClaimsByPolicy(req.params.policyNumber);
  res.json({ success: true, data: claims });
});

// Get claims by claimant name (specific routes before generic :id route)
app.get("/api/claims/claimant/:claimantName", (req: Request, res: Response) => {
  const claims = claimService.getClaimsByClaimant(req.params.claimantName);
  res.json({ success: true, data: claims });
});

// Get claim by ID (generic route last)
app.get("/api/claims/:claimId", (req: Request, res: Response) => {
  const claim = claimService.getClaimById(req.params.claimId);
  if (!claim) {
    res.status(404).json({ success: false, error: "Claim not found" });
  } else {
    res.json({ success: true, data: claim });
  }
});

// Update claim (edit details or status)
app.put("/api/claims/:claimId", (req: Request, res: Response) => {
  try {
    // Check if it's a status update or an edit request
    const { status, claimantName, policyNumber, claimAmount } = req.body;

    let claim;
    if (status) {
      // Update status
      claim = claimService.updateClaimStatus(req.params.claimId, status as ClaimStatus);
    } else if (claimantName || policyNumber || claimAmount !== undefined) {
      // Edit claim details
      claim = claimService.editClaim(req.params.claimId, {
        claimantName,
        policyNumber,
        claimAmount,
      });
    } else {
      res
        .status(400)
        .json({
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
});

// Approve a claim
app.put("/api/claims/:claimId/approve", (req: Request, res: Response) => {
  const claim = claimService.approveClaim(req.params.claimId);
  if (!claim) {
    res.status(404).json({ success: false, error: "Claim not found" });
  } else {
    res.json({ success: true, data: claim, message: "Claim approved successfully" });
  }
});

// Reject a claim
app.put("/api/claims/:claimId/reject", (req: Request, res: Response) => {
  const claim = claimService.rejectClaim(req.params.claimId);
  if (!claim) {
    res.status(404).json({ success: false, error: "Claim not found" });
  } else {
    res.json({ success: true, data: claim, message: "Claim rejected successfully" });
  }
});

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
