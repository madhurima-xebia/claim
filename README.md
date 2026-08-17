# Claim Management System

A TypeScript-based insurance claim management system with modules for initiating and managing claims.

## Modules

### Claim Initiation Module
Handles the creation and management of insurance claims with support for multiple claim types.

**Features:**
- Create claims with claimant name, policy number, claim type (Auto/Property/Health), and claim amount
- Track claim status through multiple stages (Initiated → Pending → Approved/Rejected → Closed)
- Retrieve claims by ID, policy number, or claimant name
- Comprehensive input validation
- Full TypeScript type safety

**See [CLAIM_MODULE_README.md](./CLAIM_MODULE_README.md) for detailed documentation.**

## Quick Start

### Installation
```bash
npm install
```

### Building
```bash
npm run build
```

### Running
```bash
npm run dev    # Development mode with ts-node
npm start      # Production mode
npm test       # Run tests
```

## Project Structure

```
├── src/
│   ├── types/          # TypeScript interfaces and enums
│   ├── services/       # Business logic (ClaimService)
│   ├── utils/          # Utilities (validation)
│   └── __tests__/      # Unit tests
├── dist/               # Compiled output
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Technologies

- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **Jest** - Testing framework
- **UUID** - Unique claim ID generation