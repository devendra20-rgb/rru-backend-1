# Ride Round Up - Backend Architecture

## Overview
The Ride Round Up backend is built using Node.js, TypeScript, Express, and MongoDB. It follows a modular monolith architecture.

## Modular Structure
Each business entity has its own module under `src/modules/` containing:
- `*.model.ts`: Mongoose schema and model.
- `*.types.ts`: TypeScript interfaces.
- `*.validation.ts`: Zod validation schemas.
- `*.repository.ts`: Database access logic.
- `*.service.ts`: Core business logic.
- `*.controller.ts`: HTTP request/response handling.
- `*.routes.ts`: Express route definitions.

## Global Middlewares
- **Error Handling**: `error.middleware.ts` centralizes error responses.
- **Validation**: `validate.middleware.ts` runs Zod schemas against requests.
- **Authentication**: `auth.middleware.ts` handles JWT verification and Role-Based Access Control (RBAC).

## Environment Configuration
Managed through `.env` and strictly validated using Zod in `src/config/env.ts`.

## Logging
Pino is used for structured logging. `pino-http` handles HTTP request logging.
