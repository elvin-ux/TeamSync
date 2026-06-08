# Phase 1 Authentication System - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete authentication for TeamSync. Users can register, login, and be protected by JWT-based route guards.

**Architecture:** Backend uses Spring Security + JJWT + BCrypt. Frontend uses React Hook Form + Yup + TanStack Query + Framer Motion.

**APIs:** POST /api/v1/auth/register, POST /api/v1/auth/login

---

### Task 1: Backend – Entity & Repository

**Files:**
- Create: `backend/src/main/java/com/teamsync/entity/Role.java`
- Create: `backend/src/main/java/com/teamsync/entity/User.java`
- Create: `backend/src/main/java/com/teamsync/repository/UserRepository.java`

- [x] Create `Role` enum (ADMIN, LEAD, MEMBER)
- [x] Create `User` JPA entity implementing `UserDetails`
- [x] Create `UserRepository` with `findByEmail` and `existsByEmail`

### Task 2: Backend – Security Layer

**Files:**
- Modify: `backend/src/main/java/com/teamsync/security/JwtService.java`
- Create: `backend/src/main/java/com/teamsync/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/teamsync/security/CustomUserDetailsService.java`
- Modify: `backend/src/main/java/com/teamsync/config/SecurityConfig.java`

- [x] Upgrade `JwtService` to full token generation, validation, and claims extraction using JJWT 0.12.x
- [x] Create `JwtAuthenticationFilter` (OncePerRequestFilter)
- [x] Create `CustomUserDetailsService` (loads user by email)
- [x] Update `SecurityConfig` to: permit `/api/v1/auth/**`, add `JwtAuthenticationFilter`, configure `DaoAuthenticationProvider`, expose `AuthenticationManager` bean

### Task 3: Backend – DTOs

**Files:**
- Create: `backend/src/main/java/com/teamsync/dto/auth/RegisterRequest.java`
- Create: `backend/src/main/java/com/teamsync/dto/auth/LoginRequest.java`
- Create: `backend/src/main/java/com/teamsync/dto/auth/AuthResponse.java`

- [x] Create `RegisterRequest` record with Bean Validation
- [x] Create `LoginRequest` record with Bean Validation
- [x] Create `AuthResponse` record (token, role, name, email)

### Task 4: Backend – Service & Controller

**Files:**
- Create: `backend/src/main/java/com/teamsync/service/AuthService.java`
- Create: `backend/src/main/java/com/teamsync/controller/AuthController.java`
- Create: `backend/src/main/java/com/teamsync/exception/EmailAlreadyExistsException.java`
- Modify: `backend/src/main/java/com/teamsync/exception/GlobalExceptionHandler.java`

- [x] Create `AuthService` with `register` (BCrypt + default MEMBER role) and `login` (delegates to AuthenticationManager)
- [x] Create `AuthController` at `/api/v1/auth`
- [x] Create `EmailAlreadyExistsException` → HTTP 409
- [x] Update `GlobalExceptionHandler` for auth-specific errors (409, 401, 403)

### Task 5: Backend – Configuration

**Files:**
- Modify: `backend/src/main/resources/application.yml`

- [x] Change `ddl-auto: validate` → `ddl-auto: update` for Phase 1 development
- [x] Replace placeholder JWT secret with valid BASE64-encoded default for local dev

### Task 6: Frontend – Types & Services

**Files:**
- Create: `frontend/src/types/auth.ts`
- Create: `frontend/src/services/authService.ts`

- [x] Create `auth.ts` types (RegisterFormValues, LoginFormValues, AuthResponse)
- [x] Create `authService.ts` (register, login API calls using Axios)

### Task 7: Frontend – Auth Context Enhancement

**Files:**
- Modify: `frontend/src/context/AuthContext.tsx`

- [x] Add `userName` and `userEmail` to AuthState
- [x] Persist name/email to localStorage alongside token/role
- [x] Update `setSession` signature to accept name and email

### Task 8: Frontend – Components

**Files:**
- Create: `frontend/src/components/common/ProtectedRoute.tsx`

- [x] Create `ProtectedRoute` component
  - Redirects to `/login` if no token
  - Redirects to `/access-denied` if wrong role (when `allowedRoles` specified)
  - Uses `Outlet` for nested route rendering

### Task 9: Frontend – Pages

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/pages/ForgotPasswordPage.tsx`

- [x] Upgrade `LoginPage` with React Hook Form, Yup validation, TanStack Query mutation, Framer Motion animation, error display
- [x] Upgrade `RegisterPage` with React Hook Form, Yup validation including password confirmation, TanStack Query mutation
- [x] Create `ForgotPasswordPage` (UI complete, API stub for Phase 3)

### Task 10: Frontend – Routing & Layout

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/layouts/DashboardLayout.tsx`
- Modify: `frontend/src/package.json`

- [x] Update `App.tsx` to wrap all dashboard routes in `ProtectedRoute`
- [x] Add admin-only route guard with `allowedRoles={["ADMIN"]}`
- [x] Update `DashboardLayout` with real user avatar initial, logout button
- [x] Add `@hookform/resolvers` to package.json

### Task 11: Verification

- [x] `mvn compile -q` → SUCCESS (0 errors)
- [x] `npm run typecheck` → SUCCESS (0 type errors)
- [x] `npm install` → SUCCESS (@hookform/resolvers installed)

### Acceptance Criteria Status

| Criteria | Status |
|---|---|
| User can register via POST /auth/register | ✅ |
| User can login via POST /auth/login | ✅ |
| JWT token returned on success | ✅ |
| BCrypt password hashing | ✅ |
| Role stored in database | ✅ |
| Auth context in frontend | ✅ |
| Token persisted in localStorage | ✅ |
| Protected routes work | ✅ |
| Role-based route protection | ✅ |
