# Project Overview: User SaaS Platform

## 🚀 Introduction
The **User SaaS Platform** is a modern, full-stack web application built with the **Next.js 15+ App Router**. It serves as a foundation for a Software-as-a-Service (SaaS) product, featuring robust authentication, Enterprise-grade Role-Based Access Control (RBAC), and a modular multi-tenant architecture.

---

## 🛠 Tech Stack (Enhanced)
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon Serverless Postgres (with Recursive CTEs for Role Hierarchy)
- **Authentication**: JWT-based sessions with secure HTTP-only cookies
- **Audit Logging**: Comprehensive action tracking for compliance and security
- **Hierarchical RBAC**: Granular permission-based system with Role Inheritance

---

## ✨ Key Features (SaaS Ready)

### 1. Enterprise RBAC & IAM
- **Hierarchical Roles**: Roles can inherit permissions from parent roles (e.g., Senior Manager inherits Manager permissions).
- **Granular Permissions**: Fine-grained control at the resource and action level (e.g., `user:manage`, `audit:view`).
- **Dynamic Permission Mapping**: Admins can modify role-permission mappings in real-time without code changes.

### 2. User & Access Management
- **Full User CRUD**: Add, Delete, and Modify user details and roles.
- **Account Status Control**: Activate or deactivate users instantly to revoke access.
- **System-Default Roles**: Pre-configured roles (Super Admin, HR Manager, PM, Consultant) ready for use.

### 3. Audit & Compliance
- **Audit Trails**: Every administrative action is logged with user ID, action type, and detailed metadata.
- **Audit Monitoring Dashboard**: Dedicated UI for Super Admins to review system activity.

### 4. Multi-Tenant Architecture
- Roles and data are scoped to **Organizations**, ensuring strict isolation between clients.

---

## 👥 Usage Guide by Role

| Role | Access Level | Primary Actions |
| :--- | :--- | :--- |
| **Super Admin** | **System-wide** | Full control over users, roles, permissions, and system-wide audit logs. |
| **HR Manager** | **Organization** | Manage team members, update roles, and view organization reports. |
| **Project Manager** | **Project-scoped** | Manage specific projects, team assignments, and timesheet approvals. |
| **Consultant** | **Self-service** | Manage profile, submit timesheets, and view personal productivity reports. |

---

## 📁 Project Structure (Modular)

```text
user_saas/
├── app/                  
│   ├── (auth)/           # Login, Register, Password Reset
│   ├── api/              # Secure API routes (Hierarchical fetching)
│   ├── dashboard/        # Role-aware dashboards (Users, Roles, Audit)
│   └── layout.tsx        
├── components/           # UI library (Shadcn UI)
├── lib/                  
│   ├── auth.ts           # Session & JWT encryption
│   ├── permissions.ts    # Centralized RBAC logic
│   ├── audit.ts          # Audit logging utility
│   └── db.ts             # Database client
├── scripts/              
│   ├── setup-database.ts # Schema initialization
│   └── seed-rbac.ts      # Roles & Permissions seeding
└── types/                # Shared TypeScript interfaces
```

---

## ⚙️ Configuration & Setup

### 1. Environment Variables
Ensure `.env` contains:
- `DATABASE_URL`: Connection string for Neon Postgres.
- `JWT_SECRET_KEY`: Secret key for session tokens.

### 2. Database Initialization
```bash
# Setup schema and tables
npx tsx scripts/setup-database.ts

# Seed initial roles, permissions, and hierarchy
npx tsx scripts/seed-rbac.ts
```

---

## 🔒 Roadmap & Improvements
- [x] Implement Hierarchical RBAC (Role Inheritance)
- [x] Create User & Role Management Dashboards
- [x] Implement Audit & Compliance Logging
- [ ] Add Multi-factor Authentication (MFA)
- [ ] Integrate Stripe for subscription billing
- [ ] Implement Constrained RBAC (Conflict Detection)
