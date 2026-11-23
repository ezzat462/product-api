# Product Management RESTful API

A clean, structured RESTful API for Product and User management built with **Node.js**, **Express.js**, and **TypeScript**, backed by **MongoDB** with **Mongoose**.

Engineered following modern backend best practices, including strict TypeScript typing, JWT authentication, Role-Based Access Control (RBAC), robust input validation, standardized JSend response formatting, centralized error handling, and automated integration tests.

---

## Architecture & Key Features

- **Strict TypeScript Architecture:** End-to-end type safety across controllers, models, middlewares, and route handlers.
- **JWT Authentication & Password Security:** Secure registration and login using salted `bcryptjs` password hashing and signed JSON Web Tokens. All newly registered accounts strictly receive the standard `user` role to prevent privilege escalation.
- **Role-Based Access Control (RBAC):** Granular authorization (`user` vs `admin`) protecting sensitive actions (e.g., only administrators can delete products).
- **Advanced Query Capabilities:**
  - **Pagination:** Offset/limit pagination with metadata (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`).
  - **Filtering:** Price range filtering (`minPrice`, `maxPrice`) and category filtering (`category`).
  - **Search:** Case-insensitive product name text search (`search`).
  - **Sorting:** Dynamic multi-field sorting (`sort=-createdAt`, `sort=price`).
- **Clean Code & Design Patterns:**
  - **MVC Architecture:** Strict separation between routing, business logic, data models, and utilities.
  - **Async Handler Pattern:** `catchAsync` wrapper eliminating redundant `try-catch` boilerplate.
  - **Centralized Error Handling:** Global error handler managing operational `AppError`, Mongoose `CastError`, duplicate key violations (`11000`), and JWT errors.
  - **JSend Standard Response Envelope:** Unified JSON responses (`success`, `fail`, `error`).
- **Automated Testing Suite:** 23 automated integration and unit tests using **Jest**, **Supertest**, and **mongodb-memory-server**.
- **Interactive API Documentation:** Live Swagger / OpenAPI 3.0 specification available at `/api-docs`.

---

## Project Structure

```text
product-api/
├── dist/                    # Compiled production JavaScript bundle
├── src/
│   ├── config/
│   │   ├── db.ts            # MongoDB connection manager
│   │   └── swagger.ts       # OpenAPI 3.0 specification & Swagger UI setup
│   ├── controllers/
│   │   ├── authController.ts    # User registration, login, and profile logic
│   │   └── productController.ts # Product CRUD with query features
│   ├── middlewares/
│   │   ├── auth.ts          # JWT verification & RBAC authorization
│   │   ├── errorHandler.ts  # Centralized global error handling
│   │   ├── notFound.ts      # 404 route-not-found middleware
│   │   └── validate.ts      # express-validator schemas & MongoId sanitizer
│   ├── models/
│   │   ├── productModel.ts  # Mongoose schema, indexes, and Product model
│   │   └── userModel.ts     # User schema, password hashing hook, and methods
│   ├── routes/
│   │   ├── authRoutes.ts    # Authentication routes (/api/auth)
│   │   ├── productRoutes.ts # Product routes (/api/products)
│   │   └── index.ts         # Central API route aggregator
│   ├── types/
│   │   └── express.d.ts     # Express Request interface extension (req.user)
│   ├── utils/
│   │   ├── appError.ts      # Operational error class
│   │   ├── catchAsync.ts    # Asynchronous error handling wrapper
│   │   └── sendResponse.ts  # JSend response formatter helpers
│   ├── app.ts               # Express application configuration
│   └── server.ts            # Server bootstrap and DB initialization
├── tests/
│   ├── auth.test.ts         # Authentication & authorization test suite
│   ├── notFound.test.ts     # Health check & 404 handler tests
│   ├── product.test.ts      # Product CRUD, pagination, and RBAC tests
│   └── setup.ts             # In-memory MongoDB testing environment
├── .env.example             # Template for environment variables
├── .gitignore               # Ignored files and directories
├── jest.config.js           # Jest and ts-jest configuration
├── package.json             # NPM dependencies, scripts, and metadata
└── tsconfig.json            # TypeScript compiler configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v20.19.0 or higher; v20.x, v22.x, or v24.x)
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ezzat462/product-api.git
cd product-api
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Example `.env` configuration:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*
MONGODB_URL=mongodb://localhost:27017
DB_NAME=store
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

### 3. Run in Development Mode
Starts the server with hot-reload via `ts-node-dev`:
```bash
npm run dev
```

### 4. Build and Run in Production Mode
Compiles TypeScript into clean JavaScript inside `./dist`:
```bash
npm run build
npm start
```

---

## Automated Testing

The project includes 23 automated integration and unit tests running against an isolated, in-memory MongoDB database (`mongodb-memory-server`).

Execute the test suite:
```bash
npm test
```

### Test Results Summary:
```text
PASS tests/product.test.ts
  Product Endpoints
    POST /api/products
      - should create a new product when user is authenticated
      - should fail with 401 when no token is provided
      - should fail with 400 when validation rules fail (missing price)
    GET /api/products (Pagination, Filtering, Sorting)
      - should retrieve all products with pagination metadata
      - should filter products by category
      - should filter products by price range
      - should search products by name
    GET /api/products/:id
      - should retrieve a single product by valid ID
      - should return 400 for an invalid Mongo ObjectId (bug fix verification)
      - should return 404 for a valid Mongo ObjectId that does not exist
    PATCH /api/products/:id
      - should update product fields when authenticated
    DELETE /api/products/:id (RBAC Authorization)
      - should forbid regular users from deleting a product with 403 Forbidden
      - should allow admin users to delete a product successfully (200)

PASS tests/auth.test.ts
  Authentication Endpoints
    POST /api/auth/register
      - should register a new user successfully and return JWT token
      - should reject registration attempts that include a role field (prevent privilege escalation)
      - should reject registration with already registered email
      - should fail with 400 when validation fails (short password)
    POST /api/auth/login
      - should login with valid credentials and return a token
      - should reject login with wrong password
    GET /api/auth/me
      - should return profile for authenticated user
      - should return 401 Unauthorized if no token is provided

PASS tests/notFound.test.ts
  Global Error & 404 Handling
    - should return 404 for undefined routes in standard error format
    - should respond to /health check with 200 OK

Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
```

---

## Interactive API Documentation

Once the server is running, the interactive Swagger / OpenAPI 3.0 documentation is accessible at:
**http://localhost:5000/api-docs**

---

## API Endpoints Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`). Accounts strictly receive the `user` role. |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Products (`/api/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Get paginated products (`page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, `sort`) |
| `GET` | `/api/products/:id` | Public | Get single product by valid 24-character ObjectId |
| `POST` | `/api/products` | Authenticated | Create a new product |
| `PUT` | `/api/products/:id` | Authenticated | Replace / update product by ID |
| `PATCH` | `/api/products/:id` | Authenticated | Partially update product fields |
| `DELETE` | `/api/products/:id` | **Admin Only** | Delete product by ID |

---

## Example Requests & Responses

### 1. User Registration (`POST /api/auth/register`)

> **Note on Roles & Security:** Public registration strictly assigns the default `user` role. The `role` field is intentionally disallowed in registration requests to prevent privilege escalation. Users cannot grant themselves the `admin` role through public registration.

**Request Body:**
```json
{
  "name": "Ezzat Sobhi",
  "email": "ezzat@example.com",
  "password": "Password123!"
}
```

**Response (`201 Created`):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "6741b2f4a5c9d23e8e111111",
      "name": "Ezzat Sobhi",
      "email": "ezzat@example.com",
      "role": "user",
      "createdAt": "2026-11-23T01:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get All Products with Pagination & Filtering (`GET /api/products?page=1&limit=2&category=Electronics`)
**Response (`200 OK`):**
```json
{
  "status": "success",
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 2,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": [
    {
      "_id": "6741b2f4a5c9d23e8e123456",
      "name": "Mechanical Gaming Keyboard",
      "price": 89.99,
      "category": "Electronics",
      "stock": 25,
      "createdAt": "2026-11-23T01:25:00.000Z",
      "updatedAt": "2026-11-23T01:25:00.000Z"
    }
  ]
}
```

### 3. Role-Based Forbidden Error (`DELETE /api/products/:id` with regular user token)
**Response (`403 Forbidden`):**
```json
{
  "status": "fail",
  "message": "You do not have permission to perform this action."
}
```

---

## Author

**Ezzat Sobhi**  
Computer Science Student (Class of 2027) | Aspiring Backend Developer  
- GitHub: [github.com/ezzat462](https://github.com/ezzat462)  
- LinkedIn: [linkedin.com/in/ezzat-sobhi-b277372a4/](https://www.linkedin.com/in/ezzat-sobhi-b277372a4/)
