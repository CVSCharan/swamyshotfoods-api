# Swamy's Hot Foods API

> Backend API for Swamy's Hot Foods - A pure vegetarian restaurant management system with real-time updates

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0-green.svg)](https://www.mongodb.com/)

## 🚀 Features

- **Real-time Updates** - Server-Sent Events (SSE) for instant status synchronization
- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Store Configuration** - Dynamic shop status, cooking status, and holiday management
- **Menu Management** - Full CRUD operations for menu items with ingredients
- **User Management** - Admin and customer user management
- **Order Management** - Order processing and tracking
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Logging** - Winston-based comprehensive logging system
- **API Documentation** - Swagger/OpenAPI documentation

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Real-Time Updates (SSE)](#real-time-updates-sse)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🔧 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0
- **Git**

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/CVSCharan/swamyshotfoods-api.git

# Navigate to project directory
cd swamyshotfoods-api

# Install dependencies
npm install

# Build the project
npm run build
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/swamyshotfoods

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://swamyshotfoods.in

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:5000` with hot-reload enabled.

### Production Mode
```bash
npm run build
npm start
```

### Testing SSE Connection
```bash
npm run test:sse
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Store Configuration
- `GET /api/store-config` - Get current store configuration
- `PUT /api/store-config` - Update store configuration (Admin only)
- `GET /api/store-config/sse` - SSE endpoint for real-time updates

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### API Documentation
- `GET /api-docs` - Swagger UI documentation

## ⚡ Real-Time Updates (SSE)

The API supports Server-Sent Events for real-time store configuration updates.

### Backend Implementation

The SSE endpoint (`/api/store-config/sse`) broadcasts updates to all connected clients when store configuration changes.

**Key Features**:
- Sends initial data immediately on connection
- Heartbeat every 30 seconds to keep connection alive
- Global EventBroadcast service for multi-client support
- Automatic reconnection handling

### Frontend Integration

#### Web (JavaScript/TypeScript)
```typescript
const eventSource = new EventSource('https://api.swamyshotfoods.in/api/store-config/sse');

eventSource.onmessage = (event) => {
  const config = JSON.parse(event.data);
  console.log('Store config updated:', config);
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
};
```

#### React Native (Admin App)
See [docs/sse-integration-guide.md](docs/sse-integration-guide.md) for detailed React Native implementation.

## 📁 Project Structure

```
swamyshotfoods-api/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection
│   │   ├── eventBroadcast.ts  # SSE event broadcaster
│   │   └── logger.ts     # Winston logger setup
│   ├── controllers/      # Route controllers
│   │   ├── AuthController.ts
│   │   ├── MenuController.ts
│   │   ├── OrderController.ts
│   │   └── StoreConfigController.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Menu.ts
│   │   ├── Order.ts
│   │   └── StoreConfig.ts
│   ├── repositories/    # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── MenuRepository.ts
│   │   ├── OrderRepository.ts
│   │   └── StoreConfigRepository.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── menu.routes.ts
│   │   ├── order.routes.ts
│   │   ├── storeConfig.routes.ts
│   │   └── user.routes.ts
│   ├── services/        # Business logic
│   │   ├── AuthService.ts
│   │   ├── MenuService.ts
│   │   ├── OrderService.ts
│   │   └── StoreConfigService.ts
│   ├── utils/           # Utility functions
│   │   └── validators.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── scripts/             # Utility scripts
│   ├── testSSE.ts       # SSE connection test
│   └── ...              # Other utility scripts
├── docs/                # Documentation
│   ├── api.md           # API documentation
│   └── sse-integration-guide.md  # SSE integration guide
├── logs/                # Application logs
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run test:sse` | Test SSE connection |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |

## 💻 Development

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting and formatting:
```bash
npm run lint:fix
npm run format
```

### Architecture

The project follows a **layered architecture**:

1. **Routes** - Define API endpoints
2. **Controllers** - Handle HTTP requests/responses
3. **Services** - Business logic
4. **Repositories** - Data access layer
5. **Models** - Database schemas

### Adding New Features

1. Create model in `src/models/`
2. Create repository in `src/repositories/`
3. Create service in `src/services/`
4. Create controller in `src/controllers/`
5. Add routes in `src/routes/`
6. Register routes in `src/app.ts`

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

Ensure production environment variables are set:
- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong secret key
- `ALLOWED_ORIGINS` - Production frontend URLs

### Nginx Configuration

For SSE to work properly with Nginx:

```nginx
location /api/store-config/sse {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding off;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 📄 License

ISC

## 👥 Authors

- **CVS Charan** - [GitHub](https://github.com/CVSCharan)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the database
- All contributors and supporters

---

**Made with ❤️ for Swamy's Hot Foods**
