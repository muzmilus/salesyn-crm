# Salesyn – Customer Relationship Management Platform

> **Your Sales, Synchronized.**

Salesyn is a modern, production-ready, full-stack Customer Relationship Management (CRM) SaaS application. It unifies leads, active customer accounts, sales opportunity pipelines, follow-ups, operational tasks, in-app notifications, and executive reporting in a sleek, high-performance interface.

---

## 🌟 Features

- **🔐 Enterprise Authentication & RBAC**:
  - Secure JWT authentication with bcrypt password hashing.
  - Role-Based Access Control enforcing strict permissions for **ADMIN**, **SALES_MANAGER**, and **SALES_EXECUTIVE**.
- **📈 Lead Lifecycle & AI Lead Scoring**:
  - Full CRUD operations with search, filtering, and sorting.
  - Transparent rule-based AI lead scoring engine (0-100 score + 🔥 Hot, 🟡 Warm, ❄️ Cold classifications).
  - One-click Lead-to-Customer conversion workflow preserving contact history and automatically spinning up initial opportunities.
- **🏢 Customer Account Management**:
  - Complete customer directory with detailed profile pages.
  - Chronological interaction timelines (Calls, Meetings, Emails, WhatsApp).
  - Associated deals, follow-ups, and customer activity trail.
- **💼 Kanban Sales Pipeline**:
  - Drag/click Kanban board across 7 stages (*New Lead, Contacted, Qualified, Proposal Sent, Negotiation, Won, Lost*).
  - Total pipeline value calculations, win probabilities, and automated deal notifications.
- **📅 Follow-ups & Task Agenda**:
  - Schedule calls, demos, and meetings with automatic overdue highlighting.
  - Task priority management (*Low, Medium, High*) with quick completion toggles.
- **📊 Real-time SaaS Dashboard**:
  - Powered 100% by backend database metrics.
  - 10 KPI Cards (Revenue, Deals Won, Customers, Leads, Conversion Rate, Active Opportunities, Pending Tasks).
  - Interactive Recharts graphs: Monthly Revenue Trends, Sales Pipeline Values, Lead Source Distribution, and Representative Comparisons.
- **📋 Analytics & Reports**:
  - Comprehensive report page with date range and rep filters.
  - Export structured report data to **CSV** and print-ready **PDF**.
- **🔔 Notifications & Global Search**:
  - In-app notification bell with unread badge counter.
  - Global `⌘K` search overlay querying leads, customers, and opportunities in parallel.
- **🎨 UI/UX Design System**:
  - Dark and Light theme toggle with local storage persistence.
  - Glassmorphic panels, responsive sidebar/mobile drawer, custom brand SVG logo, skeleton loaders, and confirmation modals.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing & HTTP**: React Router DOM v6 + Axios

### Backend
- **Runtime**: Node.js + Express.js
- **Database ORM**: Prisma ORM
- **Database Engine**: PostgreSQL (Supported) / SQLite (Dev)
- **Security**: JWT, bcryptjs, Helmet, CORS, Express Rate Limit

---

## 🔑 Demo Login Accounts

All demo accounts use password: `password123`

| Role | Email | Privileges |
| :--- | :--- | :--- |
| **👑 Admin** | `admin@salesyn.com` | Full organizational access, user creation, security controls, company-wide reports. |
| **📊 Sales Manager** | `manager@salesyn.com` | Team performance tracking, lead assignment, customer directory, reports. |
| **💼 Sales Executive** | `executive@salesyn.com` | Personal assigned leads, customer interactions, Kanban pipeline, follow-ups. |

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Clone & Setup Backend

```bash
cd salesyn-crm/server

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env

# Generate Prisma Client & Push Schema to Database
npx prisma generate
npx prisma db push

# Seed Realistic Demo Dataset (Users, Leads, Customers, Deals)
node prisma/seed.js

# Start Express Server
npm run dev
```

The backend server will run on `http://localhost:5000`.

### 3. Setup Frontend

```bash
cd salesyn-crm/client

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env

# Start Vite Development Server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🗄️ Database Architecture & Prisma Models

- `User`: User accounts with role-based permissions (`ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`).
- `Lead`: Lead records with AI scores (0-100), status, priority, estimated values, and assignment relations.
- `Customer`: Converted customer accounts with contact details and associated deals.
- `Opportunity`: Deals with pipeline stages, probability percentages, and close dates.
- `Interaction`: Communication history logs (Call, Email, Meeting).
- `FollowUp`: Agenda items with date, time, and status tracking.
- `Task`: Operational tasks with priority and due dates.
- `Notification`: User alerts for assignments, overdue items, and deal stage changes.
- `ActivityLog`: Comprehensive system audit log.

---

## 📡 REST API Summary

- `POST /api/auth/login` - User login & JWT generation
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current session user profile
- `GET /api/leads` - List leads (supports search, filter, sorting, pagination)
- `POST /api/leads/:id/convert` - Convert lead to customer & opportunity
- `GET /api/customers` - Customer directory
- `GET /api/opportunities/pipeline` - Pipeline stage statistics & deals
- `PATCH /api/opportunities/:id/stage` - Move opportunity stage
- `GET /api/dashboard/stats` - Calculated KPI metrics & chart data
- `GET /api/reports` - Aggregated team analytics
- `GET /api/search?q=` - Global multi-entity search

---

## 📄 Deployment Guide

### Frontend (Vercel)
1. Import `salesyn-crm/client` repository in Vercel.
2. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`
3. Deploy!

### Backend (Render / Railway)
1. Create Web Service pointing to `salesyn-crm/server`.
2. Environment Variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET`
   - `CLIENT_URL` (Your frontend URL)
3. Build Command: `npm install && npx prisma generate && npx prisma db push`
4. Start Command: `npm start`

---

## 🔒 Security Measures

- Passwords salted and hashed with `bcryptjs`.
- HTTP Bearer Tokens verified with `jsonwebtoken`.
- RBAC middleware (`authorize(['ADMIN', 'SALES_MANAGER'])`) returning explicit `403 Forbidden` errors.
- Header hardening via `helmet`.
- Rate limiting on authentication endpoints to prevent brute-force attacks.

---

## 📜 License

Distributed under the MIT License. Built with excellence for Salesyn.
