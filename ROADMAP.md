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

1. ✅ Add environment.ts for the API URL (done — b3a24e6)
2. Deploy the database to Azure SQL
3. Deploy the API to Azure App Service
4. Deploy the frontend to Azure Static Web Apps
5. Build transaction history
6. Build rewards management
7. Add proper authentication

---

## Deploying to the Real World

All three parts deploy to Azure — one ecosystem, one account, all free tiers.

---

### Step 1 — Host the Database (Azure SQL)

Move off local SQL Server Express to Azure SQL, which is SQL Server in the cloud
managed by Microsoft.

- Create an Azure SQL Server (logical server) and a database under it
- The free tier (General Purpose Serverless, 32 GB) is enough for a pilot
- You get a connection string like:
    Server=tcp:kapetol.database.windows.net,1433;Database=KapetolDb;...
- Replace the connection string in KapetolLoyaltyApi/appsettings.json (or use
  an environment variable / Azure App Service app setting — preferred for secrets)

Entity Framework migrations (dotnet ef database update) run against this cloud DB
the same way they run locally.

---

### Step 2 — Host the Backend API (Azure App Service)

Azure App Service is a managed platform that runs your .NET app on a server
Microsoft maintains. You never SSH into the box.

- Create an App Service plan (F1 free tier) and a Web App targeting .NET 10
- Deploy by pushing to the App Service's built-in Git remote, or via GitHub Actions
- Azure auto-assigns a public URL: https://kapetol-api.azurewebsites.net
- Add the Azure SQL connection string as an App Service application setting
  (this keeps the secret out of source control)

Cold starts on F1: the free tier idles after 20 minutes of inactivity and takes
~10 seconds to wake up on the next request. Acceptable for a closed pilot.

---

### Step 3 — Update the Frontend API URL

The environment files are already in place (src/environments/):
- environment.ts uses http://localhost:5166 for local dev
- environment.prod.ts needs the Azure App Service URL once it's known

Update environment.prod.ts:
  export const environment = {
    production: true,
    apiUrl: 'https://kapetol-api.azurewebsites.net'
  };

---

### Step 4 — Deploy the Frontend (Azure Static Web Apps)

ng build produces a dist/ folder of static HTML/JS/CSS. Azure Static Web Apps
hosts these for free and includes:
- Automatic HTTPS with a free SSL certificate
- GitHub Actions CI/CD (push to main → auto-deploy)
- Custom domain support (free SSL even on your own domain)

You get a URL like: https://kapetol-loyalty.azurestaticapps.net

---

### Step 5 — Get a Domain (Optional but Professional)

Buy a .com or .ph domain from Namecheap or GoDaddy.
Cost: roughly ₱600–₱1,500 per year.

Point it at your Azure Static Web Apps frontend. Azure walks you through the
DNS CNAME/TXT record setup and provisions SSL automatically.

---

### Step 6 — Update CORS

Once you have a real frontend URL, update Program.cs in the API to allow
that origin instead of (or in addition to) localhost:4200.

Example:
  policy.WithOrigins(
    "http://localhost:4200",
    "https://kapetol-loyalty.azurestaticapps.net"
  )

---

### Step 7 — Publish as a Mobile App (Optional, deferred)

The pilot runs as a mobile-responsive website — Ionic already looks and feels
like a native app in the browser, so no app store submission is needed for now.

If/when native packaging becomes a goal:
- Capacitor is already a package.json dependency but has never been initialized
- Steps: npx cap init → npx cap add android → npx cap sync → open in Android Studio
- Google Play requires a one-time $25 USD developer account fee
- iOS requires a Mac with Xcode and an Apple Developer account ($99 USD/year)
