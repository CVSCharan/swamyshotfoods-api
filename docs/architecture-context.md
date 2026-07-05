# API Implementation Context & Architecture

## Overview
This repository (`swamyshotfoods-api`) is the backend Node.js API. It acts as the central source of truth for the Swamy Hot Foods platform, connecting the Admin PWA and Customer Web App to MongoDB.

## Key Technologies
- **Node.js & Express**: Core server framework.
- **TypeScript**: Static typing.
- **MongoDB & Mongoose**: Database and ODM.
- **Server-Sent Events (SSE)**: For real-time state synchronization.

## System Architecture

### 1. Controllers & Services & Repositories
The API follows a strict 3-tier architecture:
- **Routes**: Define endpoints and apply middleware (Auth, Validation).
- **Controllers**: Handle HTTP req/res, extract payloads, format output.
- **Services**: Contain pure business logic (e.g., checking if shop status changes).
- **Repositories**: Handle direct database CRUD operations using Mongoose.

### 2. State Synchronization (SSE & StoreConfig)
- **StoreConfig**: Contains global settings like `isShopOpen`, `isCooking`, `menuFooterMessage`.
- **EventBroadcast.ts**: Emits Node.js events when `StoreConfig` is updated via PUT.
- **SSE Endpoint (`/api/store-config/sse`)**: Streams live updates to all connected clients (Web App, PWA).
  - *Note on Scaling*: The current `EventEmitter` is in-memory. If this API scales horizontally (multiple instances), it requires upgrading to MongoDB Change Streams to broadcast across instances.

### 3. Authentication
- Uses standard JWT authentication (`AuthService.ts`).
- Admin roles are required for `PUT` and `POST` actions to modify store configuration or menus.

## Context Retrieval for AI Assistants
- **Menu Resolution**: `MenuService.ts` dynamically resolves `TimingTemplates` to calculate if an item is available now. Time comparisons explicitly use IST (`Asia/Kolkata`) regardless of the server's local machine time to ensure synchronization with real-world restaurant hours.
- **Validation**: Strict express-validator rules reside in `utils/validators.ts`. Ensure fields are optional if they accept partial updates.
- **Persistence Bugs**: When updating Mongoose models with partial data, always use `Document.set()` rather than `Object.assign()` to ensure Mongoose change tracking marks the fields as dirty.
