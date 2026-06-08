# Phase 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TeamSync project foundation without implementing Phase 1 business logic.

**Architecture:** Use the documented layered monolith with `frontend/` for React and `backend/` for Spring Boot. The frontend provides route, theme, service, context, and layout foundations; the backend provides package structure, configuration, response wrappers, and a health API.

**Tech Stack:** React 19, Vite, TypeScript, Material UI, Framer Motion, TanStack React Query, Axios, Java 21, Spring Boot 3, Maven, MySQL, JWT-ready security, Cloudinary-ready configuration.

---

### Task 1: Frontend Foundation

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/theme/theme.ts`
- Create: `frontend/src/services/api.ts`
- Create: `frontend/src/layouts/DashboardLayout.tsx`

- [x] Create Vite/TypeScript configuration and documented source folders.
- [x] Add MUI dark-first theme following `UI_UX_DESIGN_BRIEF.pdf`.
- [x] Add React Query provider, Axios instance, router, shell layout, and placeholder pages.

### Task 2: Backend Foundation

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/teamsync/TeamsyncApplication.java`
- Create: `backend/src/main/java/com/teamsync/config/*`
- Create: `backend/src/main/java/com/teamsync/dto/common/ApiResponse.java`
- Create: `backend/src/main/java/com/teamsync/exception/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/teamsync/controller/HealthController.java`

- [x] Add Spring Boot 3 Maven configuration with documented dependencies.
- [x] Add package structure from `SYSTEM_DESIGN.MD`.
- [x] Add environment-driven MySQL, JWT, CORS, and Cloudinary configuration.
- [x] Add response wrapper and global exception handler.

### Task 3: Git Foundation

**Files:**
- Create: `.gitignore`
- Create: `.editorconfig`

- [x] Initialize Git repository in `C:\Users\elvin\Desktop\TeamSync`.
- [x] Configure `origin` as `https://github.com/elvin-ux/TeamSync.git`.
- [x] Verify repository status.

### Task 4: Verification

**Commands:**
- `git -c safe.directory='C:/Users/elvin/Desktop/TeamSync' -C 'C:\Users\elvin\Desktop\TeamSync' remote -v`
- `node -e "JSON.parse(...frontend/package.json...)"`
- `python -c "xml.etree.ElementTree.parse(...backend/pom.xml...)"`

- [x] Confirm Git remote is configured.
- [x] Confirm frontend `package.json` is valid JSON.
- [x] Confirm backend `pom.xml` is valid XML.
- [x] Confirm backend `application.yml` has the expected top-level structure.
- [x] Record that `npm install` timed out before build tools were available.
