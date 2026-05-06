# 📖 User Manual & Knowledge Base

Welcome to the **User SaaS Platform**. This guide will help you navigate the system, manage your team, and configure access controls effectively.

---

## 🚦 Getting Started

### 1. Registration & Login
- **Sign Up**: Navigate to the `/register` page to create a new account. By default, new users are assigned the **Consultant** role.
- **Sign In**: Use your email and password to access your dashboard.
- **Session Security**: Your session is secured with encrypted JWT tokens. For security, sessions automatically expire after 24 hours.

### 2. Dashboard Overview
Once logged in, you will see a sidebar with options based on your **Role and Permissions**:
- **Dashboard**: A high-level overview of your activity.
- **Users**: (Admin Only) Manage team members.
- **Roles**: (Admin Only) Configure permissions.
- **Audit Logs**: (Super Admin Only) Monitor system changes.
- **Settings**: Manage your personal profile and account details.

---

## 👥 User Management (For Admins)

The **Users** page is the central hub for managing your organization's team.

### How to Add a New User
1. Click on the **"Add User"** button.
2. Enter the user's Full Name, Email, and a temporary password.
3. Select an initial **Role**.
4. Click **"Create User"**. The user can now log in with their credentials.

### How to Modify a User's Role
- Find the user in the table and use the **Role** dropdown to select a new role. Changes take effect the next time the user performs an action or logs in.

### Deactivating a User
- Toggle the **Status** switch next to a user. 
- **Active**: User has full access based on their role.
- **Inactive**: User is immediately blocked from accessing the system and cannot log in.

---

## 🛡 Roles & Permissions (For Admins)

The **Roles** page allows you to define exactly what each role can do in the system.

### Understanding Permissions
Permissions are granular keys like `user:manage` or `timesheet:submit`. They are grouped by module (Core, Timesheet, CMS).

### Creating a New Permission
If you are building a new feature, you can define a custom permission:
1. Click **"Create Permission"**.
2. Enter a key (e.g., `reports:export`), a module name, and a description.
3. This permission will now appear in the list for all roles.

### Managing Role Access
1. Click **"Edit"** on any role card.
2. Check the boxes for the permissions you want that role to have.
3. Click **"Save Changes"**.
4. **Inheritance**: Remember that "Senior" roles inherit permissions from their parent roles automatically.

---

## 🔍 Audit & Compliance (For Super Admins)

The **Audit Logs** page provides a transparent history of all administrative actions.

- **What is logged?**: User creation/deletion, role changes, permission updates, and status toggles.
- **Data Points**: Each log includes the actor (who did it), the action, the target entity, and the timestamp.
- **Filtering**: Use this to investigate unauthorized changes or verify compliance during audits.

---

## ⏱ Timesheet Module (Work in Progress)

- **Submit Time**: Employees can enter daily hours against specific projects.
- **Approvals**: Managers can review pending timesheets and mark them as **Approved** or **Rejected**.
- **Reports**: View productivity and budget tracking at the organization level.

---

## ❓ Frequently Asked Questions

#### Why can't I see the "Users" or "Roles" tabs?
Access to these tabs requires the `user:view` and `role:view` permissions. If you are a new user, you are likely a **Consultant** and need an Admin to promote you.

#### What happens if I delete a user?
Deleting a user permanently removes their account. Their historical data (like audit logs) will still show their email address for record-keeping, but they can no longer log in.

#### How do I change my password?
Navigate to **Settings** and look for the "Security" or "Profile" section to update your credentials.
