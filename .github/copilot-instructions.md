# Copilot Instructions for SDK Publish

## Repository Overview

This is the **SDK Publish** web application, part of the DAppNode Software Development Kit ecosystem. It's a React-based web app that allows developers to sign DAppNode package release transactions using wallet providers like MetaMask. The app is deployed at https://dappnode.github.io/sdk-publish/ and integrates with IPFS for package management.

### High-Level Repository Information

- **Type**: React web application (TypeScript + Tailwind CSS)
- **Size**: ~100 source files, built with Create React App
- **Framework**: React 18.3.1 with TypeScript 5.4.3
- **Styling**: Tailwind CSS with custom configuration
- **Build Tool**: React Scripts (Create React App)
- **Package Manager**: Yarn (yarn.lock present)
- **Target Runtime**: Modern browsers, deployed as static site

## Build Instructions

### Prerequisites

- Node.js 20+ (as specified in GitHub workflows)
- Yarn package manager

### Essential Commands - Execute in Order

1. **Install Dependencies** (ALWAYS run first)

   ```bash
   yarn install
   ```

   - Takes ~1-2 minutes
   - Produces warnings about missing peer dependencies (these are non-breaking)
   - May show license field warnings (non-breaking)

2. **Development Server**

   ```bash
   yarn start
   ```

   - Starts on localhost:3000
   - Takes ~30 seconds to start
   - Produces many source map warnings (non-breaking, from dependencies)
   - Shows babel deprecation warning (known issue with Create React App)

3. **Production Build**

   ```bash
   yarn build
   ```

   - Takes ~1 minute
   - Outputs to `build/` directory
   - Produces source map warnings (non-breaking)
   - Shows bundle size warning (expected for this app)
   - Sets REACT_APP_REOWN_PROJECT_ID environment variable in CI

4. **Code Formatting**

   ```bash
   npx prettier --write .
   ```

   - Fixes formatting issues (11 files currently need formatting)
   - ALWAYS run before committing
   - Configuration in `.prettierrc` with Tailwind plugin

5. **Testing**
   ```bash
   yarn test --watchAll=false
   ```
   - Currently no tests exist in src/ (this is expected)
   - Create React App test runner configured but unused

### Common Build Issues and Workarounds

- **Source Map Warnings**: Multiple dependencies have missing source maps. These are warnings only and don't break the build.
- **Babel Warning**: "@babel/plugin-proposal-private-property-in-object" warning appears due to Create React App maintenance status. Non-breaking.
- **Bundle Size Warning**: Expected due to Ethereum/IPFS dependencies. The app works correctly despite the warning.
- **TypeScript Version Warning**: Using TypeScript 5.4.3 with older @typescript-eslint. Non-breaking.

## Project Architecture and Layout

### Directory Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Main application pages
│   ├── publishing/     # Package publishing flow
│   └── ownership/      # Package ownership management
├── utils/              # Utility functions for IPFS, ENS, transactions
├── wallet/             # Wallet integration (Reown AppKit)
├── contracts/          # Ethereum contract ABIs
├── types.ts            # TypeScript type definitions
├── params.ts           # Application constants
└── App.tsx             # Main application component
```

### Key Files and Their Purpose

- **src/App.tsx**: Main application router and wallet connection logic
- **src/pages/publishing/Publishing.tsx**: Multi-step publishing flow
- **src/pages/ownership/Ownership.tsx**: Package ownership management
- **src/utils/signRelease.ts**: Core IPFS signing logic (contains TODO comment)
- **src/wallet/walletConfig.ts**: Reown AppKit configuration
- **src/params.ts**: IPFS gateways and application constants
- **tailwind.config.js**: Custom color scheme and font configuration
- **tsconfig.json**: TypeScript configuration with baseUrl set to src/

### Configuration Files

- **.prettierrc**: Prettier with Tailwind plugin
- **postcss.config.js**: PostCSS with Tailwind and Autoprefixer
- **package.json**: No tests defined, uses react-scripts
- **.gitignore**: Standard Create React App ignores plus .env

## GitHub Workflows and CI/CD

### Deployment Workflows

1. **deploy.yml** (Production - GitHub Pages)

   - Triggers on push to `master` branch
   - Uses Node.js 20
   - Runs: yarn install → yarn build → deploy to gh-pages
   - Requires REACT_APP_REOWN_PROJECT_ID environment variable
   - Uses peaceiris/actions-gh-pages@v4 for deployment

2. **netlify.yml** (PR Previews)
   - Triggers on pull requests
   - Builds and deploys to Netlify for preview
   - Uses nwtgck/actions-netlify@v3
   - Requires NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID secrets

### Code Quality Checks

- No automated linting in CI (manual prettier check required)
- No automated testing (no tests exist)
- Code formatting must be checked manually with prettier

## Validation Steps for Changes

1. **Always run these commands after making changes:**

   ```bash
   yarn install                    # If package.json changed
   npx prettier --write .         # Fix formatting
   yarn build                     # Verify build works
   ```

2. **For new components or pages:**

   - Follow existing patterns in src/components/ or src/pages/
   - Use Tailwind classes matching the existing color scheme
   - Import types from src/types.ts

3. **For IPFS/blockchain changes:**
   - Test with src/utils/signRelease.ts patterns
   - Verify contract ABIs in src/contracts/ are up to date
   - Check src/params.ts for IPFS gateway configurations

## Dependencies and Architecture Notes

### Key Dependencies

- **@reown/appkit**: Wallet connection (replaces WalletConnect v1)
- **ethers**: Ethereum interaction (v6.11.1)
- **ipfs-http-client**: IPFS API client (v56.0.1)
- **react-router-dom**: Client-side routing
- **tailwindcss**: Utility-first CSS framework

### Non-obvious Dependencies

- Reown AppKit requires REACT_APP_REOWN_PROJECT_ID environment variable in production
- IPFS operations depend on gateway availability (configured in src/params.ts)
- ENS resolution requires Ethereum mainnet connection
- Package signing requires specific IPFS directory structure

## Important Notes for Coding Agents

- **No breaking changes to wallet integration**: The app uses Reown AppKit with specific configuration
- **IPFS gateway reliability**: Default gateway is https://gateway-dev.ipfs.dappnode.io - test before changing
- **Environment variables**: REACT_APP_REOWN_PROJECT_ID is required for wallet functionality
- **Bundle size**: Large bundle is expected due to crypto/IPFS dependencies
- **Source maps**: Warnings about missing source maps from dependencies are normal and non-breaking
- **TypeScript strict mode**: Enabled - all new code must be type-safe
- **Formatting**: Always use prettier with Tailwind plugin before committing

**IMPORTANT**: Trust these instructions and only search/explore if the documented information is incomplete or found to be incorrect. These instructions are comprehensive and tested.
