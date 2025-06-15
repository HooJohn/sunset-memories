# Sunset Memories Web Application

This is the monorepo for the "夕阳回忆" (Sunset Memories) web application, a platform designed to help seniors record, share, and preserve their life stories.

## Overview

The project consists of two main packages:

-   `client/`: A React frontend built with TypeScript, Vite, and Tailwind CSS.
-   `server/`: A Node.js backend powered by the NestJS framework, using PostgreSQL and Redis.

Refer to the `docs/PRD.md` for detailed product requirements and features.

## Prerequisites

-   Node.js (e.g., v18 or v20, consider adding a `.nvmrc` file)
-   pnpm (latest version)
-   Docker (for running PostgreSQL and Redis, or local installations)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd sunset-memories
    ```

2.  **Install dependencies:**
    This command will install dependencies for the root, client, and server packages defined in `pnpm-workspace.yaml`.
    ```bash
    pnpm install
    ```

3.  **Environment Variables:**
    Each package (`client` and `server`) will have its own `.env.example` file. Copy these to `.env` and fill in the required values:
    ```bash
    cp client/.env.example client/.env
    cp server/.env.example server/.env
    ```
    *(Note: These `.env.example` files will be created as part of their respective package setups.)*

4.  **Setup Database & Services (if not using a project-level Docker Compose):**
    Ensure PostgreSQL and Redis instances are running and accessible according to the server's `.env` configuration.

## Development

To run both client and server in development mode with hot reloading:

```bash
pnpm dev
```

Individual commands:

-   Start client development server: `pnpm --filter client dev` (or `pnpm dev:client` from root)
-   Start server development server: `pnpm --filter server dev` (or `pnpm dev:server` from root)

## Build

To build both client and server for production:

```bash
pnpm build
```

Individual commands:

-   Build client: `pnpm --filter client build` (or `pnpm build:client` from root)
-   Build server: `pnpm --filter server build` (or `pnpm build:server` from root)

## Linting and Formatting

-   Lint all packages: `pnpm lint` (will require configuration in ESLint to span workspaces or run per-package)
-   Format all packages: `pnpm format` (will require configuration in Prettier to span workspaces or run per-package)

## Running Tests

(Test scripts will be defined within each package)

-   Run client tests: `pnpm --filter client test`
-   Run server tests: `pnpm --filter server test`
-   Run all tests: `pnpm test` (if configured at the root to delegate to workspaces)


## Monorepo Structure

-   `pnpm-workspace.yaml`: Defines the workspace packages (`client`, `server`).
-   `client/`: Contains the frontend React application.
-   `server/`: Contains the backend NestJS application.
-   `docs/`: Contains project documentation, including the Product Requirements Document (`PRD.md`).

## Contributing

Please refer to `CONTRIBUTING.md` (to be created) for contribution guidelines.
