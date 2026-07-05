# Swamy's Hot Foods - API & Backend

The Node.js/Express backend powering Swamy's Hot Foods. Handles the real-time Store Configuration (via SSE), Menu Management, Timing Templates, and Administrative Authentication, backed by a MongoDB Atlas database.

## 🚀 Key Features

*   **Real-Time Sync (SSE)**: Streams live store status (Open/Close, "Closing Soon"), custom notices, and holiday states to both the Customer Web App and Admin PWA.
*   **Timezone-Aware Timings**: Robust time-checking logic against IST (`Asia/Kolkata`) to handle Saturday night transitions and Sunday holidays dynamically.
*   **Menu & Templates System**: Stores complex daily menus with morning/evening specials and predefined timing templates.
*   **Centralized Error Handling**: Standardized error responses to prevent client-side crashes across Web and PWA.

## 🛠 Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js (TypeScript)
*   **Database**: MongoDB via Mongoose
*   **Authentication**: JWT-based Admin auth
*   **Real-time Comm**: Server-Sent Events (SSE)

## 📦 Setup

1. **Environment Config** (`.env`):
```env
PORT=5001
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

2. **Install & Run**:
```bash
npm install
npm run dev
```

## 📅 Recent Updates (July 2026)
*   Updated "Closing soon" and holiday transition logic for Saturday evenings.
*   Introduced robust handling for malformed timing strings and standardized database configurations.
*   Implemented SSE connection lifecycle enhancements and optimized Mongoose partial updates.
