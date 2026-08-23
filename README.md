# Nestora — Smart Community Management Platform

A modern, full-stack community management platform designed for residential societies, condominium associations, and apartment complexes. Nestora streamlines maintenance operations, automates SLA overdue tracking, facilitates real-time resident broadcasting, and provides comprehensive administration analytics.

---

## Key Highlights

* **Resident Self-Service:** Fast ticket submission with category tags, urgency indicators, and direct photo evidence upload.
* **Intelligent SLA & Overdue Engine:** Automated tracking flags tickets open beyond a configurable threshold and surfaces them in the triage queue.
* **Audit & Lifecycle Timeline:** Permanent, timestamped record of every status transition and administrative note.
* **Broadcast Notice Board:** Publish community announcements with high-priority pinned banners and automated resident email dispatch.
* **Admin Command Suite:** Real-time KPI dashboard, category distribution metrics, priority breakdowns, and multi-parameter filtering.
* **Cloud Storage & Reliable Dispatch:** Multer + Cloudinary photo uploads paired with graceful Nodemailer email relays.

---

## Tech Stack

```text
React · Node.js · Express · MongoDB · JWT Auth · Multer / Cloudinary · Nodemailer
```

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 18, React Router v6, Lucide Icons, Custom CSS | Modern responsive SaaS UI |
| **Backend** | Node.js, Express 4 | RESTful API gateway & triage engine |
| **Database** | MongoDB (Mongoose ODM) | Document persistence & embedded audit logs |
| **Authentication** | JWT + bcryptjs | Role-based authorization (`resident` / `admin`) |
| **Media Uploads** | Multer + Cloudinary | Cloud-hosted photo storage |
| **Notifications** | Nodemailer | Transactional email dispatches |
| **Deployment** | Docker & Docker Compose | Containerized runtime orchestration |

---

## System Architecture

```text
nestora/
├── backend/
│   ├── config/              # Database & Cloudinary configurations
│   ├── middleware/          # JWT auth guard, role validation, upload pipeline
│   ├── models/              # User, Complaint, Notice, Settings
│   ├── routes/              # /api/auth, /api/complaints, /api/notices, /api/dashboard
│   ├── utils/               # email.js, overdue.js, seedAdmin.js
│   ├── server.js            # Express application entrypoint
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── public/              # logo.svg, index.html, metadata
│   ├── src/
│   │   ├── components/      # Layout (Navigation), Badges
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Landing, Login, Register, Dashboards, Complaints, Notices, Settings
│   │   ├── App.js           # Route topology & role guards
│   │   ├── index.js
│   │   └── index.css        # Nestora design system & CSS variables
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docs/
│   └── SYSTEM_DESIGN.md     # Architectural write-up
└── README.md
```

---

## Setup & Installation Guide

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **MongoDB**: Local MongoDB server or a MongoDB Atlas connection URI
* **SMTP Credentials** *(Optional)*: Gmail App Password or SMTP provider for email dispatch
* **Cloudinary Account** *(Optional)*: For cloud photo uploads

---

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

Create `.env` inside `backend/` and configure the runtime variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nestora
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000

# Optional: Administrator Account Auto-Seeding
ADMIN_NAME=Nestora Administrator
ADMIN_EMAIL=admin@nestora.local
ADMIN_PASSWORD=AdminSecurePassword123!

# Optional: Cloudinary Photo Uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: SMTP Email Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SOCIETY_NAME=Nestora Community Management
```

Create `.env` inside `frontend/` (optional for local dev):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Step 3: Run Development Servers

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend Client
cd frontend
npm start
```

* **Frontend UI:** `http://localhost:3000`
* **Backend API Gateway:** `http://localhost:5000/api`

---

## Database Schemas

### 1. `users`

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `name` | String | Required, Trimmed | Full name of member |
| `email` | String | Required, Unique, Lowercase | Primary login identifier |
| `password` | String | Required | Bcrypt-hashed secret |
| `role` | String | Enum: `resident`, `admin` | Authorization role |
| `apartmentNumber` | String | Optional | Unit identifier (e.g., A-402) |
| `phone` | String | Optional | Contact number |

### 2. `complaints`

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `title` | String | Required | Concise problem title |
| `description` | String | Required | Detailed explanation |
| `category` | String | Enum | Plumbing, Electrical, Elevator, Security, Cleaning, Parking, Noise, Internet, Other |
| `status` | String | Enum: `Open`, `In Progress`, `Resolved` | Lifecycle stage |
| `priority` | String | Enum: `Low`, `Medium`, `High` | Triage priority level |
| `photo` | String | Optional | Cloudinary photo asset URL |
| `resident` | ObjectId | Ref: `User` | Resident who raised the ticket |
| `statusHistory` | Array | Subdocuments | Chronological audit trail |
| `isOverdue` | Boolean | Computed | Dynamic SLA overdue status |
| `resolvedAt` | Date | Optional | Timestamp when resolved |

### 3. `notices`

| Field | Type | Attributes | Description |
| --- | --- | --- | --- |
| `title` | String | Required | Notice subject line |
| `content` | String | Required | Notice text body |
| `isImportant` | Boolean | Default: `false` | Pinned priority & email trigger |
| `postedBy` | ObjectId | Ref: `User` | Administrator author |

### 4. `settings`

| Field | Type | Description |
| --- | --- | --- |
| `key` | String | Setting key (e.g. `overdueThresholdDays`) |
| `value` | Mixed | Configured value (e.g. `7`) |

---

## REST API Reference

All protected endpoints require `Authorization: Bearer <jwt_token>` header.

### Authentication

* `POST /api/auth/register` — Create new resident account.
* `POST /api/auth/login` — Sign in with email and password. Returns `{ token, user }`.
* `GET /api/auth/me` — Retrieve profile data for the authenticated session.

### Complaints

* `POST /api/complaints` — File a new ticket (`multipart/form-data` with optional `photo`).
* `GET /api/complaints/my` — Fetch tickets raised by the current resident.
* `GET /api/complaints` — Admin query with filters (`status`, `category`, `priority`, `search`, `startDate`, `endDate`).
* `GET /api/complaints/:id` — Retrieve a single ticket with full audit history.
* `PATCH /api/complaints/:id` — Admin triage (update status, priority, and append note).
* `GET /api/complaints/settings/overdue-threshold` — Get SLA threshold days.
* `PUT /api/complaints/settings/overdue-threshold` — Update SLA threshold days.

### Notice Board

* `GET /api/notices` — Fetch active notices (important notices sorted first).
* `POST /api/notices` — Admin post notice (`isImportant` triggers broadcast email).
* `DELETE /api/notices/:id` — Admin delete notice.

### Dashboard

* `GET /api/dashboard` — Admin analytics (status counts, category metrics, priority breakdown, overdue queue).

---

## Containerized Deployment (Docker)

```bash
docker compose up --build
```

---

## License

This project is released under the MIT License.