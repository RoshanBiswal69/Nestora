# Nestora — System Design

## 1. System Overview

**Nestora** is a full-stack Smart Community Management Platform for residential societies and apartment communities. It provides two primary roles:

* **Resident:** Registers/logs in, submits complaints, uploads evidence, tracks complaint status/history, and views community notices.
* **Administrator:** Manages complaints, updates status and priority, monitors SLA violations, publishes notices, and views analytics.

The system follows a **layered client-server architecture**:

```text
Users
 ├── Resident
 └── Administrator
        │
        ▼
React 18 Frontend
 ├── Authentication
 ├── Resident Dashboard
 ├── Admin Dashboard
 ├── Complaints
 ├── Notices
 └── Settings
        │
        │ REST / JSON
        ▼
Node.js + Express Backend
 ├── Auth API
 ├── Complaint API
 ├── Notice API
 ├── Dashboard API
 ├── JWT Authentication
 └── Role-Based Access Control
        │
        ├───────────────┐
        ▼               ▼
MongoDB + Mongoose   External Services
 ├── Users           ├── Cloudinary
 ├── Complaints      │   └── Complaint Photos
 ├── Notices         └── Nodemailer + SMTP
 └── Settings            └── Email Notifications
```

## 2. Frontend Architecture

The presentation layer uses **React 18** and **React Router v6**. It manages navigation, authentication state, API communication, forms, dashboards, complaints, notices, and role-specific interfaces.

Major modules include:

* Landing
* Login/Register
* Resident Dashboard
* Admin Dashboard
* Complaints
* Notices
* Settings
* AuthContext
* Shared UI components

The frontend communicates with the backend through REST APIs.

## 3. Authentication and Authorization

Nestora uses **JWT authentication** and **bcryptjs password hashing**.

During registration, the backend validates the user, checks whether the email already exists, hashes the password, and stores the user in MongoDB. During login, credentials are verified and a JWT is generated.

```text
User
 ↓
React Login/Register
 ↓
Express Auth API
 ↓
bcryptjs / JWT
 ↓
MongoDB
 ↓
Authenticated Session
```

Authentication endpoints include:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

JWT middleware protects APIs, while RBAC separates **resident** and **admin** permissions.

## 4. Complaint Management

Complaints are the core functionality of Nestora. Residents submit a title, description, category, priority, and optional photo.

Supported categories include plumbing, electrical, elevator, security, cleaning, parking, noise, internet, and other.

The complaint lifecycle is:

```text
Open → In Progress → Resolved
```

Complaint photos are processed using **Multer**, uploaded to **Cloudinary**, and the resulting URL is stored in MongoDB.

```text
Resident
 ↓
Complaint Form
 ↓
Express API
 ├── Text Data → MongoDB
 └── Photo → Multer → Cloudinary
                    ↓
                 Image URL
                    ↓
                 MongoDB
```

Each complaint maintains an embedded `statusHistory` containing status, note, and timestamp, creating an audit trail.

## 5. SLA and Overdue Management

Nestora includes configurable SLA tracking. The system compares a complaint's age against the configured SLA threshold.

```text
Complaint Created
 ↓
Calculate Age
 ↓
Compare with SLA Threshold
 ├── Within SLA → Normal
 └── Exceeded → isOverdue = true
                     ↓
                Admin Triage
```

Administrators can retrieve and update the overdue threshold through dedicated API endpoints.

## 6. Notice and Notification System

Administrators can publish community notices. Important notices can trigger email broadcasting.

```text
Admin
 ↓
Create Notice
 ↓
POST /api/notices
 ↓
MongoDB
 ↓
Important Notice
 ↓
Nodemailer
 ↓
SMTP Server
 ↓
Residents
```

Nodemailer uses SMTP configuration such as `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS`.

## 7. Database Design

Nestora uses **MongoDB with Mongoose**.

### Users

```text
_id
name
email
password
role
apartmentNumber
phone
```

### Complaints

```text
_id
title
description
category
status
priority
photo
resident
statusHistory[]
isOverdue
resolvedAt
```

### Notices

```text
_id
title
content
isImportant
postedBy
```

### Settings

```text
_id
key
value
```

A resident can create multiple complaints, while administrators can publish notices. Complaint status history is embedded within the complaint document.

## 8. API Architecture

The main REST API groups are:

```text
Authentication
POST  /api/auth/register
POST  /api/auth/login
GET   /api/auth/me

Complaints
POST  /api/complaints
GET   /api/complaints/my
GET   /api/complaints
GET   /api/complaints/:id
PATCH /api/complaints/:id

Notices
GET    /api/notices
POST   /api/notices
DELETE /api/notices/:id

Dashboard
GET /api/dashboard
```

Requests pass through JWT authentication and role validation before reaching the appropriate route and business logic.

## 9. Security and Deployment

Security is provided through bcryptjs password hashing, JWT-based authentication, RBAC, protected APIs, and environment variables for sensitive configuration such as database credentials, JWT secrets, Cloudinary secrets, and email passwords.

The project supports **Docker and Docker Compose** and is deployed using **Render**. The deployment architecture consists of the React/Nginx frontend, Node/Express backend, MongoDB, Cloudinary, and SMTP services.

## 10. Technology Stack

| Technology   | Purpose             |
| ------------ | ------------------- |
| React 18     | Frontend            |
| React Router | Navigation          |
| Node.js      | Backend runtime     |
| Express      | REST API            |
| MongoDB      | Database            |
| Mongoose     | ODM                 |
| JWT          | Authentication      |
| bcryptjs     | Password hashing    |
| Multer       | File uploads        |
| Cloudinary   | Image storage       |
| Nodemailer   | Email notifications |
| Docker       | Containerization    |
| Render       | Deployment          |

**Overall flow:**
**Users → React UI → Express REST API → JWT/RBAC → Business Logic → MongoDB**, with **Cloudinary** handling complaint media, **Nodemailer/SMTP** handling notifications, and **Docker/Render** supporting deployment.
