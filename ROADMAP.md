# Kapetol Loyalty App — Roadmap & Deployment Guide

---

## What to Work on Next

Priority order from most to least urgent.

### 1. Security (High Priority)
The staff PIN is hardcoded in source code and customer identity is just a localStorage
number — anyone who knows the ID can impersonate a customer.

- Add a backend login endpoint that returns a JWT token
- Store the token in localStorage and send it with every API request
- Replace the hardcoded PIN with a proper staff account system

### 2. Customer Registration from Staff Side
Currently customers must self-register. In a real cafe, staff will often need to
register walk-in customers on their behalf.

- Add a simple registration form on the staff side
- Calls the same POST /customers endpoint that already exists

### 3. Transaction History for Customers
Customers have no way to see what they earned or spent points on.
The PointsLedger table already has this data.

- Add GET /customers/{id}/history endpoint to the API
- Add a history page in the customer flow showing each transaction

### 4. Rewards Management for Staff / Admin
Rewards are currently only seeded from code. Staff need a way to manage
rewards without touching the database.

- Add CRUD endpoints for rewards (POST, PUT, DELETE /api/rewards)
- Add an admin/staff page to add, edit, and deactivate rewards

### 5. QR Code Download
Customers should be able to save their QR code to their phone's camera roll,
especially for offline use.

- Add a download button on the customer dashboard
- Use the canvas API to save the QR image to the device

### 6. Better Input UX
Small things that make the app feel more polished:

- Staff scan page: auto-submit after a QR code is scanned
- Staff login: auto-login after 4 digits are entered
- Add loading indicators while API calls are in progress

---

## Suggested Order

1. Add environment.ts for the API URL (small change, unlocks deployment)
2. Deploy the API to Railway
3. Deploy the frontend to Vercel
4. Build transaction history
5. Build rewards management
6. Add proper authentication

---

## Deploying to the Real World

There are three parts: the backend API, the database, and the frontend app.

---

### Step 1 — Host the Backend API

Your .NET API needs to run on a server that is always on.

Recommended options:
- Railway (railway.app) — easiest, free tier available, supports .NET, HTTPS automatic
- Azure App Service — Microsoft's own platform, good for .NET, has a free tier
- Render (render.com) — simple, free tier for web services

You push your API code there, it runs, and you get a public URL like:
  https://kapetol-api.railway.app

---

### Step 2 — Host the Database

Move off local SQL Server to a cloud database.

Options:
- Azure SQL — pairs naturally with .NET, has a free/cheap tier
- Railway — can also host a SQL Server or PostgreSQL database
- Supabase — if you want to switch to PostgreSQL, has a generous free tier

You will get a connection string to replace the one in appsettings.json.

---

### Step 3 — Update the Frontend API URL

Every service currently hardcodes http://localhost:5166.
Before deploying, switch to Angular's environment files:

  src/environments/environment.ts         (development)
  src/environments/environment.prod.ts    (production)

Example:
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:5166'
  };

  export const environment = {
    production: true,
    apiUrl: 'https://kapetol-api.railway.app'
  };

Then each service imports environment.apiUrl instead of the hardcoded value.

---

### Step 4 — Deploy the Frontend

Run: ng build
This produces a dist/ folder of static files. Host it on:

- Vercel (vercel.com) — free, GitHub integration, HTTPS automatic
- Netlify (netlify.com) — free, same as Vercel
- Firebase Hosting — Google's option, also has a free tier

You will get a URL like: https://kapetol-loyalty.vercel.app

---

### Step 5 — Get a Domain (Optional but Professional)

Buy a .com or .ph domain from Namecheap or GoDaddy.
Cost: roughly ₱600–₱1,500 per year.

Point it at your Vercel/Netlify frontend and your Railway API.
Both platforms walk you through the DNS settings.

---

### Step 6 — Update CORS

Once you have a real frontend URL, update Program.cs in the API to allow
that origin instead of (or in addition to) localhost:4200.

Example:
  policy.WithOrigins(
    "http://localhost:4200",
    "https://kapetol-loyalty.vercel.app"
  )

---

### Step 7 — Publish as a Mobile App (Optional)

Once everything works in the browser, Capacitor can package it as a native
Android app.

Commands:
  npx cap sync
  npx cap open android

From Android Studio you can:
- Generate an APK to share directly (sideload onto phones)
- Sign it and publish to the Google Play Store
  (requires a one-time $25 USD developer account fee)

For iOS you need a Mac with Xcode and an Apple Developer account ($99 USD/year).
