# Sunset Memories Web Application

This is the monorepo for the "夕阳回忆" (Sunset Memories) web application, a platform designed to help seniors record, share, and preserve their life stories.

## Overview

The project consists of two main packages managed with pnpm workspaces:

-   `client/`: A React frontend built with TypeScript, Vite, and Tailwind CSS.
-   `server/`: A Node.js backend powered by the NestJS framework, currently configured for SQLite for development and TypeORM.

Refer to the `docs/PRD.md` for detailed product requirements and features.

## Prerequisites

-   **Node.js:** v18 or v20 recommended. Consider using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.
-   **pnpm:** Latest version (e.g., v8+). Install via `npm install -g pnpm`.
-   **Git:** For cloning the repository.
-   **(Optional) Docker:** If you prefer to run PostgreSQL and Redis via Docker for a more production-like setup.

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url> # Replace <repository-url> with the actual URL
    cd sunset-memories         # Or your chosen directory name
    ```

2.  **Install dependencies:**
    This command installs dependencies for the root workspace and all defined packages (`client`, `server`).
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables:**
    Example environment files are provided. Copy them to `.env` files and customize as needed.

    *   **Backend (`server/.env`):**
        ```bash
        cp server/.env.example server/.env
        ```
        Then edit `server/.env`. Key variables:
        -   `PORT`: The port the NestJS backend will run on (default: `3001`).
        -   `JWT_SECRET`: A strong, unique secret key for JWT signing. **Replace the default value.**
        -   `JWT_EXPIRES_IN`: Token expiration time (e.g., `1d`, `7d`).
        -   (Optional) `DATABASE_URL`: If switching to PostgreSQL, uncomment and configure this.

    *   **Frontend (`client/.env`):**
        ```bash
        cp client/.env.example client/.env
        ```
        Then edit `client/.env`. Key variables:
        -   `VITE_API_URL`: The full base URL for the backend API (default: `http://localhost:3001/api`). Ensure this matches the backend's running port and global prefix.

## Database Setup

*   **SQLite (Default for Development):**
    -   The application is configured to use SQLite by default.
    -   The database file (`db.sqlite`) will be automatically created in the `server/` directory when the backend starts.
    -   This file is included in `.gitignore` and should not be committed.
    -   TypeORM's `synchronize: true` option is enabled for SQLite in development (`server/src/app.module.ts`). This automatically creates/updates the schema based on entities. **This is not suitable for production.**

*   **PostgreSQL (Optional/Production):**
    -   To use PostgreSQL:
        1.  Ensure you have a running PostgreSQL instance (local or Docker).
        2.  Create a database for this application.
        3.  Update `server/.env` with your PostgreSQL `DATABASE_URL`.
        4.  Modify `server/src/app.module.ts` to use the PostgreSQL TypeORM configuration (an example might be commented out or you'd replace the SQLite config).
        5.  Disable `synchronize: true` and use TypeORM migrations for schema management in production.

## Development

To run both the client and server in development mode with hot reloading:

```bash
pnpm dev
```
This uses `npm-run-all` to start both development servers concurrently.
-   **Backend (NestJS):** Runs on `http://localhost:<PORT>` (default `http://localhost:3001`). API routes are prefixed with `/api`.
-   **Frontend (Vite):** Runs on `http://localhost:5173` (Vite's default, can vary).

You can also run them individually:

-   Start client development server: `pnpm --filter client dev` (or `pnpm dev:client` from root)
-   Start server development server: `pnpm --filter server dev` (or `pnpm dev:server` from root)

## Building for Production

To build both client and server for production:

```bash
pnpm build
```
This will create production-ready builds in `client/dist` and `server/dist`.

Individual build commands:

-   Build client: `pnpm --filter client build` (or `pnpm build:client` from root)
-   Build server: `pnpm --filter server build` (or `pnpm build:server` from root)

## Linting and Formatting

-   Lint all packages: `pnpm lint`
-   Format all packages: `pnpm format`
(These scripts might need further configuration in ESLint/Prettier for optimal monorepo behavior if not already set up.)

## Running Tests

(Test scripts need to be fully defined and implemented within each package.)

-   Run client tests: `pnpm --filter client test`
-   Run server tests: `pnpm --filter server test`
-   Run all tests: `pnpm test` (if configured at the root)


## Monorepo Structure

-   `pnpm-workspace.yaml`: Defines the workspace packages (`client`, `server`).
-   `client/`: Contains the frontend React application.
-   `server/`: Contains the backend NestJS application.
-   `docs/`: Contains project documentation, including the Product Requirements Document (`PRD.md`).
-   `package.json` (root): Contains shared development dependencies and root-level scripts.
