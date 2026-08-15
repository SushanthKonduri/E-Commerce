# 🛍️ VELORA — Premium Full-Stack E-Commerce Platform

VELORA is a modern, high-performance, full-stack e-commerce web application engineered with **React, Vite, TypeScript, Tailwind CSS, Node.js, Express, and Prisma ORM with SQLite**.

---

## ✨ Features Overview

### 🎨 Customer Storefront
- **Modern Responsive Design**: Fully optimized for mobile, tablet, and desktop screens with dynamic dark and light mode themes.
- **Interactive Catalog**: Real-time product search with debounced autocomplete, category filtering, price range filters, and instant sorting.
- **Cart & Wishlist Drawer**: Slide-out cart drawer with item quantity controls, real-time total calculations, and instant wishlist toggles.
- **Checkout & Order Tracking**: Seamless checkout process with address selection, order status tracking, and order history.
- **Secure Authentication & OTP**: Customer login, registration, and 6-digit OTP password reset flow.

### 🛡️ Isolated Admin Control Center (`/admin`)
- **Strict Role Separation**: Public registration strictly assigns `CUSTOMER` privileges. Admin login is completely isolated at `/admin/login`.
- **Analytics Dashboard**: Real-time business metrics including revenue trends, order counts, product inventory stats, and top-selling items.
- **Product Management**: Full CRUD capabilities for products, categories, SKU management, pricing, and stock levels.
- **Order Management & Sync**: Monitor customer orders and update status (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`).
- **User Management**: View user accounts and safely manage administrative privileges.
- **Inventory Audit Logs**: Track product inventory restocks and adjustments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT Authentication, Bcrypt |
| **Database** | SQLite (via Prisma) |

---

## 📁 Repository Structure

```
New Projects/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI Components (common, product, cart, auth, admin)
│   │   ├── pages/          # Storefront & Admin Pages
│   │   ├── services/       # Axios API Client
│   │   ├── store/          # Zustand State Stores (Auth, Cart, Wishlist, Theme, Toast)
│   │   ├── App.tsx         # Main Application & Router Config
│   │   └── index.css       # Tailwind CSS & Custom Theme Tokens
│   └── package.json
│
├── server/                 # Backend Node.js Express API
│   ├── prisma/             # Database Schema & Seed Scripts (`dev.db`, `seed.ts`)
│   ├── src/
│   │   ├── controllers/    # Auth, Admin, Product, Order, Cart Controllers
│   │   ├── middleware/     # Auth & Role Authorization Middleware
│   │   ├── routes/         # Express API Routes
│   │   └── index.ts        # Server Entrypoint
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 2. Backend Setup (`/server`)
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Initialize and seed the SQLite database
npx prisma db push
npx prisma db seed

# Start the backend development server (Runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup (`/client`)
```bash
# In a new terminal, navigate to the client folder
cd client

# Install dependencies
npm install

# Start the Vite development server (Runs on http://localhost:5173)
npm run dev
```

---

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@velora.com` | `admin123` | Full Admin Dashboard (`/admin/login`) |
| **Administrator** | `sushanthkonduri10@gmail.com` | `admin123` | Full Admin Dashboard (`/admin/login`) |
| **Customer** | `demo@velora.com` | `password123` | Storefront Shopping & Orders |

---

## 📄 License
This project is open-source and available under the **MIT License**.
