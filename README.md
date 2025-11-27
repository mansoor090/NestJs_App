# Housing Management & Billing System

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

**A full-stack property management system with automated billing, payment processing, and role-based access control**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏢 About the Project

This is a comprehensive **Housing Society Management & Billing System** designed to streamline residential property management operations. The system automates invoice generation, manages resident accounts, processes payments through Stripe, and provides role-based dashboards for both administrators and residents.

### Key Use Cases

- **Property Administrators**: Manage houses, residents, generate invoices, and track payments
- **Residents**: View invoices, manage their houses, and make secure payments online
- **Automated Billing**: Monthly invoices are generated automatically with configurable amounts
- **Late Fee Management**: Automatic surcharge calculation for overdue payments
- **Payment Processing**: Secure payment processing via Stripe integration

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with Passport.js
- Role-based access control (RBAC) with Admin and Resident roles
- Secure password hashing with bcrypt
- Protected API endpoints with guards

### 🏠 House Management
- Create, update, and delete house records
- Associate houses with residents
- Admin-only house management endpoints
- Resident-specific house viewing

### 📄 Invoice Management
- Automated monthly invoice generation via scheduled tasks
- Configurable monthly bill amounts
- Automatic late surcharge calculation (applied after 5 days)
- Invoice tracking and history
- Resident-specific invoice viewing

### 💳 Payment Processing
- Stripe payment integration
- Secure payment session creation
- Webhook handling for payment status updates
- Transaction status tracking (PENDING, COMPLETED, FAILED)
- Payment history and receipts

### 👥 User Management
- Admin-only user creation, update, and deletion
- User role assignment (ADMIN/RESIDENT)
- User profile management

### 🎨 Frontend Features
- Modern UI with Material-UI and Tailwind CSS
- Responsive design for all devices
- Dark/light theme support
- Loading states and animations
- User-friendly dashboards for both roles

---

## 🛠 Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/) - Progressive Node.js framework
- **Language**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) - Next-generation ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport.js (Local & JWT strategies)
- **Validation**: class-validator, class-transformer
- **Scheduling**: @nestjs/schedule for automated tasks
- **Payment**: Stripe SDK

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 16.0.1 - React framework
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Tailwind CSS v4, Emotion
- **HTTP Client**: Axios
- **Payment**: Stripe React components


---

## 🏗 Architecture

This project follows a **monorepo structure** with clear separation between backend and frontend:

```
project_test/
├── src/                    # NestJS backend application
│   ├── auth/              # Authentication module
│   ├── user/              # User management module
│   ├── house/             # House management module
│   ├── invoice/           # Invoice management module
│   ├── transactions/     # Payment processing module
│   ├── stripe/            # Stripe integration module
│   └── prisma/            # Prisma service
├── frontend/              # Next.js frontend application
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── prisma/                # Database schema and migrations
└── test/                  # E2E tests
```

### Key Architectural Decisions

- **Modular Design**: Backend organized into feature modules (auth, user, house, invoice, etc.)
- **Guards & Decorators**: Custom guards for authentication and authorization
- **DTOs**: Data Transfer Objects for type-safe API communication
- **Service Layer**: Business logic separated into service classes
- **Scheduled Tasks**: Automated invoice generation using NestJS scheduler

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** (v12 or higher)
- **Stripe Account** (for payment processing)
- **Git** (for cloning the repository)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd yourfoldername
```

### 2. Install Dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
# Using psql
createdb property_management

# Or using SQL
psql -U postgres
CREATE DATABASE property_management;
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 5. Database Migration

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

### 6. Seed the Database

Populate the database with initial data (including admin user):

```bash
npm run seed
```

The seed script creates:
- An admin user (email: `admin@example.com`, password: `admin123`)
- Sample residents and houses
- Initial settings for monthly bills and surcharges

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | No (default: 7d) |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `PORT` | Backend server port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

### Database Configuration

The application uses Prisma ORM. Key configuration files:
- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Database migration files

### Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set up a webhook endpoint pointing to `http://your-domain/transactions/webhook`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### CORS Configuration

CORS is configured in `src/main.ts`. Update the `FRONTEND_URL` environment variable to match your frontend deployment URL.

---

## 🏃 Running the Application

### Development Mode

#### Backend Server

```bash
# Start backend in development mode (with hot reload)
npm run start:dev

# Backend will run on http://localhost:3001
```

#### Frontend Server

```bash
# Navigate to frontend directory
cd frontend

# Start frontend in development mode
npm run dev

# Frontend will run on http://localhost:3000
```

### Production Build

#### Build Backend

```bash
npm run build
npm run start:prod
```

#### Build Frontend

```bash
cd frontend
npm run build
npm run start
```

### Available Scripts

**Backend:**
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debug mode
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed the database

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}


// for Testing
email: junaid@gmail.com
password: Admin123$

for testing stripe:
Use stripe testcards e.g 4242 4242 4242 4242

```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "RESIDENT"
  }
}
```

#### Check Auth Status
```http
GET /auth/status
Authorization: Bearer <token>
```

---

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /admin/users/all
Authorization: Bearer <admin-token>
```

#### Create User
```http
POST /admin/users/create
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "RESIDENT"
}
```

#### Update User
```http
PUT /admin/users/update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "user-uuid",
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Delete User
```http
DELETE /admin/users/delete
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "user-uuid"
}
```

---

### House Management Endpoints

#### Get All Houses (Admin Only)
```http
GET /admin/houses/all
Authorization: Bearer <admin-token>
```

#### Create House (Admin Only)
```http
POST /admin/houses/create
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "houseNo": "A-101",
  "userId": "user-uuid"
}
```

#### Get User Houses (Resident)
```http
GET /user/houses
Authorization: Bearer <resident-token>
```

---

### Invoice Endpoints (Resident)

#### Get User Invoices
```http
GET /user/invoices
Authorization: Bearer <resident-token>
```

#### Get Invoice by ID
```http
GET /user/invoices/:id
Authorization: Bearer <resident-token>
```

---

### Transaction Endpoints

#### Create Payment Session
```http
POST /transactions/create-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "invoiceId": "invoice-uuid"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Stripe Webhook
```http
POST /transactions/webhook
Stripe-Signature: <signature>
Content-Type: application/json

<stripe-event-data>
```

---

## 🗄 Database Schema

### Key Models

#### User
- `id` (UUID) - Primary key
- `name` (String)
- `email` (String, unique)
- `password` (String, hashed)
- `role` (UserRole: ADMIN | RESIDENT)
- `createdAt`, `updatedAt` (DateTime)

#### House
- `id` (UUID) - Primary key
- `houseNo` (String)
- `userId` (UUID) - Foreign key to User
- Unique constraint on `(houseNo, userId)`

#### Invoice
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User
- `houseId` (UUID) - Foreign key to House
- `items` - One-to-many with Item
- `transaction` - One-to-one with Transaction

#### Item
- `id` (UUID) - Primary key
- `invoiceId` (UUID) - Foreign key to Invoice
- `productType` (ProductType: MONTHLY_BILL | LATE_SURCHARGE)
- `amount` (Float)

#### Transaction
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User
- `invoiceId` (UUID, unique) - Foreign key to Invoice
- `status` (TransactionStatus: PENDING | COMPLETED | FAILED)
- `amount` (Float)
- `stripeSessionId` (String, optional)
- `completedAt` (DateTime, optional)

#### Settings
- `id` (UUID) - Primary key
- `key` (ProductType, unique)
- `value` (String) - Configurable amount

### Relationships

- User → Houses (One-to-Many)
- User → Invoices (One-to-Many)
- User → Transactions (One-to-Many)
- House → Invoices (One-to-Many)
- Invoice → Items (One-to-Many)
- Invoice → Transaction (One-to-One)

---

## 🚢 Deployment

### Environment Setup

1. Set up production PostgreSQL database
2. Configure environment variables in your hosting platform
3. Set up Stripe webhook endpoint in production
4. Update `FRONTEND_URL` to production frontend URL

### Backend Deployment

The backend can be deployed to:
- **Heroku**: Use Node.js buildpack
- **AWS**: EC2, ECS, or Lambda
- **DigitalOcean**: App Platform or Droplets
- **Railway**: Direct deployment from Git
- **Vercel**: Serverless functions

### Frontend Deployment

The frontend can be deployed to:
- **Vercel**: Recommended for Next.js (automatic deployments)
- **Netlify**: Static site hosting
- **AWS Amplify**: Full-stack deployment
- **Any static hosting**: After `npm run build`

### Database Migrations

Run migrations in production:

```bash
npx prisma migrate deploy
```

### Security Considerations

- Use strong `JWT_SECRET` in production
- Enable HTTPS for all endpoints
- Configure CORS properly
- Use environment variables for all secrets
- Regularly update dependencies
- Set up proper logging and monitoring

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting PR

---

## 👤 Author

Mansoor Ahmad Khan

- GitHub: [@mansoor090](https://github.com/mansoor090)

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Material-UI](https://mui.com/) - React component library
- [Stripe](https://stripe.com/) - Payment processing

---

<div align="center">

**⭐ If you found this project helpful, please consider giving it a star! ⭐**

Made with ❤️ using NestJS and Next.js

</div>
