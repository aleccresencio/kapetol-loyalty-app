# Development Setup Guide

Everything you need to get this project running on a new machine.

## Prerequisites

### 1. Git
Download and install from [git-scm.com](https://git-scm.com), then clone the repo:
```
git clone https://github.com/aleccresencio/kapetol-loyalty-app.git
```

### 2. Node.js (Angular Frontend)
- Install **Node.js v22+** from [nodejs.org](https://nodejs.org) (comes with npm)
- Install Angular CLI globally:
```
npm install -g @angular/cli
```
- Install project dependencies from the repo root:
```
npm install
```

### 3. .NET 10 SDK (Backend API)
- Download the **.NET 10 SDK** from [dot.net](https://dot.net)
- Restore packages inside `KapetolLoyaltyApi/`:
```
dotnet restore
```

### 4. SQL Server Express (Database)
- Download **SQL Server Express** (free) from [microsoft.com](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- After installing, run EF Core migrations to create the database inside `KapetolLoyaltyApi/`:
```
dotnet ef database update
```

### 5. VS Code (Editor)
- Download from [code.visualstudio.com](https://code.visualstudio.com)
- Recommended extensions:
  - **C# Dev Kit**
  - **Angular Language Service**

---

## Running the Projects

### Angular Frontend
From the repo root:
```
npm start
```

### .NET API
From `KapetolLoyaltyApi/`:
```
dotnet run
```

---

## Setup Checklist
- [ ] Git — clone repo
- [ ] Node.js — `npm install`
- [ ] .NET 10 SDK — `dotnet restore`
- [ ] SQL Server Express — `dotnet ef database update`
- [ ] VS Code + extensions
