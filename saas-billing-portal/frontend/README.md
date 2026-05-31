
# BillingOS - SaaS Billing Portal

A modern full-stack SaaS Billing Portal built using React, Vite, Supabase, and Node.js — designed for managing invoices, customers, and billing operations efficiently.

---

## Features

### Dashboard
- Real-time revenue, subscription, customer, and churn rate stats
- Revenue Trend chart with 6M / YTD / 1Y toggle
- Recent invoices preview
- Live data from Supabase database

### Billing & Invoice Management
- Generate invoices with customer name, email, amount, plan, due date
- Payment method selection (Credit Card, Bank Transfer, Invoice)
- Filter invoices by status (Paid, Pending, Overdue)
- Search invoices by customer name
- Update invoice status directly from the table
- Delete individual invoices or clear all
- Simulated email notification on invoice generation

### Payment Flow (Stripe Simulation)
- Interactive payment modal with animated card visual
- Real-time card number formatting (16 digits)
- MM/YY expiry auto-formatting
- CVV validation
- Processing animation and success screen
- Invoice status auto-updates to Paid after payment
- Simulated payment — no real charges

### PDF Download
- Professional PDF invoice generation using jsPDF
- Includes company name, customer details, plan, amount, status
- Formatted table with branded header
- Auto-saves with invoice ID and customer name

### Customer Management
- View all registered customers
- Search by name or email
- Filter by Active / Inactive status
- Plan, Total Spent, Status columns
- Customer statistics cards (Total, Active, Revenue, Inactive)
- Click any customer to open detail modal
- Modal shows customer invoice history with status and amounts
- Delete customer

### Settings
- Company name configuration
- Stripe API key (masked display)
- Tax rate configuration
- Currency selector (USD, EUR, GBP, INR, AUD, CAD)
- Invoice prefix customization (INV-001, BILL-001, etc.)
- All settings saved to Supabase database
- Saved configuration display table

### Authentication
- User Login and Registration
- Supabase Auth integration
- Protected routes

---

## Tech Stack

### Frontend
- React + Vite
- Plain CSS
- Recharts (revenue charts)
- React Router DOM
- jsPDF + jspdf-autotable (PDF generation)

### Database
- Supabase (PostgreSQL)

### Backend
- Node.js
- Express
- REST API architecture

---

## Getting Started

### Backend
```bash
cd backend
npm install
node server.js


### frontend

cd frontend
npm install
npm run dev


## Frontend Server
http://localhost:5173

## Backend Server
http://localhost:5000