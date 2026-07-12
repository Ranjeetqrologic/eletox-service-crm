# Eletox Service CRM (ESCM)

Complete AC Service Lead & Field Staff Management System

## Project Structure

```
escm/
├── backend/          Node.js + Express + MongoDB REST API
├── frontend/         Next.js 14 + TypeScript + Tailwind CSS
├── docs/             API docs & workflows
└── README.md
```

## Modules Implemented

1. Authentication & Role-Based Access Control (RBAC)
2. Staff Management + KYC + Documents + Attendance
3. Lead Management (website, call, WhatsApp, manual sources)
4. Lead Assignment & Notifications
5. Staff Mobile Dashboard (work reports, photo upload, GPS check-in/out)
6. Invoice & Payments
7. Reports & Analytics
8. Customer Website (SEO, PWA, service booking form)
9. Cloudinary uploads + PDF report generation

## Quick Start

```bash
# Backend
 cd backend
 cp .env.example .env
 npm install
 npm run dev

# Frontend
 cd frontend
 npm install
 npm run dev
```

Default admin credentials: `admin@escm.com` / `admin123`
