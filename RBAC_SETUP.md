# Role-Based Access Control (RBAC) Setup

## Overview
This project now has role-based access control implemented in NestJS. Only ADMIN users can access certain protected endpoints.

## How It Works

### 1. **Roles Decorator** (`src/auth/decorators/roles.decorator.ts`)
- Custom decorator to specify which roles can access an endpoint
- Usage: `@Roles(UserRole.ADMIN)` or `@Roles(UserRole.ADMIN, UserRole.RESIDENT)`

### 2. **Roles Guard** (`src/auth/guard/roles.guard.ts`)
- Checks if the authenticated user has the required role
- Works together with JwtGuard (must be authenticated first)
- Throws `ForbiddenException` if user doesn't have required role

### 3. **JWT Guard** (`src/auth/guard/jwt.guard.ts`)
- Validates JWT token
- Extracts user data from token and sets `req.user`
- Must be applied before RolesGuard

## Protected Endpoints

### User Management (Admin Only)
- `POST /users/create` - Create new user (ADMIN only)
- `PUT /users/update` - Update user (ADMIN only)
- `DELETE /users/delete` - Delete user (ADMIN only)

## How to Use

### Protecting an Endpoint

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('example')
export class ExampleController {
  @Post('protected')
  @UseGuards(JwtGuard, RolesGuard)  // Must use both guards
  @Roles(UserRole.ADMIN)            // Specify required role(s)
  async protectedEndpoint() {
    // Only ADMIN users can access this
  }
}
```

### Multiple Roles
```typescript
@Roles(UserRole.ADMIN, UserRole.RESIDENT)  // Either ADMIN or RESIDENT
```

## Authentication Flow

1. **User logs in** → Receives JWT token with user data (including role)
2. **User makes request** → Includes JWT token in `Authorization: Bearer <token>` header
3. **JwtGuard validates token** → Extracts user data and sets `req.user`
4. **RolesGuard checks role** → Verifies user has required role
5. **Request proceeds** → If all checks pass

## Frontend Usage

The frontend already sends JWT tokens via the axios interceptor in `frontend/lib/api.ts`. 

When calling protected endpoints:
- Token is automatically included in headers
- If user doesn't have required role, API returns `403 Forbidden`
- Frontend should handle this error appropriately

## Testing

### Test as Admin:
1. Login with admin credentials (from seeder)
2. Make request to `/users/create` with admin JWT token
3. Should succeed ✅

### Test as Regular User:
1. Login with regular user credentials
2. Make request to `/users/create` with user JWT token
3. Should receive `403 Forbidden` ❌

## Error Responses

- **401 Unauthorized**: No token or invalid token (JwtGuard fails)
- **403 Forbidden**: Valid token but insufficient permissions (RolesGuard fails)

## Notes

- The JWT token includes the user's role (set in `auth.service.ts`)
- Guards are executed in order: JwtGuard → RolesGuard
- You can apply roles to any endpoint in any controller
- The `@Roles()` decorator can accept multiple roles

