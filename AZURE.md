# Azure Infrastructure — Kapetol Loyalty App

Everything runs on a single Azure account under one resource group. All tiers are
free. No charges expected for a closed pilot.

---

## Account & Subscription

| Field | Value |
|---|---|
| Azure account | alec.cresencio@gmail.com |
| Subscription name | Azure subscription 1 |
| Subscription ID | f5096c4c-9d2f-497c-a236-f8885e3c5dc9 |
| Tenant ID | 24255c08-7b4d-4ac8-9aee-b33588cd7d74 |
| Resource group | kapetol-rg |
| Region | Southeast Asia (Singapore) |

---

## Live URLs

| Service | URL |
|---|---|
| **Frontend** (Angular/Ionic app) | https://nice-plant-0781f7a00.7.azurestaticapps.net |
| **API** (.NET 10) | https://kapetol-api.azurewebsites.net |
| **API — rewards endpoint** | https://kapetol-api.azurewebsites.net/api/rewards |
| **API — Swagger UI** | https://kapetol-api.azurewebsites.net/swagger (dev only, disabled in prod) |

---

## Resources

### Resource Group

```
az group create --name kapetol-rg --location southeastasia
```

Container for all project resources. Deleting this group removes everything.

---

### Azure SQL (Database)

| Field | Value |
|---|---|
| Logical server | kapetol-sql |
| Hostname | kapetol-sql.database.windows.net |
| Port | 1433 |
| Database name | KapetolDb |
| Admin username | aleccresencio |
| Admin password | stored in Azure App Service settings (not in source control) |
| Tier | General Purpose Serverless — Gen5, 1 vCore (free offer) |
| Max storage | 32 GB |
| Backup redundancy | Local |
| Auto-pause delay | 60 minutes |
| Free limit exhaustion | AutoPause (won't charge if free limit hit) |
| Region | Southeast Asia |

**Connection string (template):**
```
Server=tcp:kapetol-sql.database.windows.net,1433;Database=KapetolDb;
User ID=aleccresencio;Password=<password>;Encrypt=True;TrustServerCertificate=False;
```

The full connection string is stored as an App Service connection string named
`DefaultConnection` (type: SQLAzure). ASP.NET Core reads it automatically at
runtime — it is never in `appsettings.json` or source code.

**Firewall rules:**

| Rule name | IP range | Purpose |
|---|---|---|
| AllowLocalDev | 112.208.189.22 – 112.208.189.22 | Local machine (home/office) |
| AllowAzureServices | 0.0.0.0 – 0.0.0.0 | App Service and other Azure services |

> If your home IP changes, add a new firewall rule:
> ```
> az sql server firewall-rule create --resource-group kapetol-rg --server kapetol-sql \
>   --name AllowHome2 --start-ip-address <new-ip> --end-ip-address <new-ip>
> ```

**EF Core migrations:**

Tables are managed by EF Core migrations in `KapetolLoyaltyApi/Migrations/`.
To apply migrations to the cloud database from your local machine:

```powershell
cd KapetolLoyaltyApi
dotnet ef database update --connection "Server=tcp:kapetol-sql.database.windows.net,1433;Database=KapetolDb;User ID=aleccresencio;Password=<password>;Encrypt=True;TrustServerCertificate=False;"
```

**Auto-pause behaviour:**

The free serverless tier idles the database after 60 minutes of no activity.
The first request after a pause takes 5–15 seconds while it wakes up. All
subsequent requests run at normal speed.

---

### Azure App Service (API)

| Field | Value |
|---|---|
| App Service Plan | kapetol-plan |
| Plan tier | F1 (free) |
| OS | Linux |
| Web App name | kapetol-api |
| Public URL | https://kapetol-api.azurewebsites.net |
| Runtime | .NET 10 (self-contained linux-x64) |
| Region | Southeast Asia |
| Daily CPU limit | 60 minutes (F1 tier) |
| Idle timeout | 20 minutes (cold start ~10 s on next request) |

**App Service settings (stored in Azure, not in code):**

| Setting name | Type | Value |
|---|---|---|
| DefaultConnection | Connection String (SQLAzure) | Full Azure SQL connection string |

These are set via the Azure portal or CLI and override `appsettings.json` at
runtime. The database password never touches source control.

**CLI commands used to create it:**

```bash
az appservice plan create --name kapetol-plan --resource-group kapetol-rg \
  --sku F1 --is-linux

az webapp create --name kapetol-api --resource-group kapetol-rg \
  --plan kapetol-plan --runtime "DOTNETCORE:10.0"

az webapp config connection-string set --name kapetol-api \
  --resource-group kapetol-rg --connection-string-type SQLAzure \
  --settings DefaultConnection="<connection-string>"
```

**Known deployment quirk — Microsoft.Data.SqlClient on Linux:**

When publishing the .NET API from a **Windows machine** with
`dotnet publish -r linux-x64 --self-contained true`, the build cross-compiles
but places the Windows version of `Microsoft.Data.SqlClient.dll` at the publish
root instead of the Linux version. Running that on the Linux App Service throws:

```
System.PlatformNotSupportedException: Microsoft.Data.SqlClient is not supported on this platform.
```

**Fix:** the GitHub Actions workflow builds on `ubuntu-latest`, so this doesn't
occur in automated deployments. If you ever need to deploy manually from Windows,
copy the Linux DLL over the root one before zipping:

```powershell
# After dotnet publish -r linux-x64 --self-contained true -o publish_output:
Copy-Item publish_output\runtimes\unix\lib\net9.0\Microsoft.Data.SqlClient.dll `
          publish_output\Microsoft.Data.SqlClient.dll -Force
```

---

### Azure Static Web Apps (Frontend)

| Field | Value |
|---|---|
| Resource name | kapetol-app |
| Public URL | https://nice-plant-0781f7a00.7.azurestaticapps.net |
| Tier | Free |
| Region | East Asia (Hong Kong) |
| GitHub repo | https://github.com/aleccresencio/kapetol-loyalty-app |
| Branch | main |
| App location | `/` (repo root, where package.json lives) |
| Output location | `dist/kapetol-staff-dashboard/browser` |

Deployments are fully automatic — every push to `main` triggers a build-and-deploy
via GitHub Actions (see below). No manual steps needed.

---

## GitHub Actions Workflows

### 1. Frontend — Azure Static Web Apps

**File:** `.github/workflows/azure-static-web-apps-nice-plant-0781f7a00.yml`

**Triggers:** every push to `main`, and on PR open/sync/close.

**What it does:**
1. Checks out the repo on `ubuntu-latest`
2. Oryx (Azure's build system) detects Angular + Ionic, installs Node 22, runs `npm install && ng build`
3. Uploads `dist/kapetol-staff-dashboard/browser/` to the Static Web Apps CDN

**Secret used:** `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_PLANT_0781F7A00`
(auto-created by Azure when the Static Web App resource was created — lives in
GitHub repo secrets, do not regenerate without updating both places)

---

### 2. API — Azure App Service

**File:** `.github/workflows/azure-app-service.yml`

**Triggers:** push to `main` that touches `KapetolLoyaltyApi/**` or the
workflow file itself.

**What it does:**
1. Checks out the repo on `ubuntu-latest`
2. Installs .NET 10
3. Runs `dotnet publish -r linux-x64 --self-contained true`
4. Zips the publish output with `zip -r` (preserves Linux path separators)
5. Logs in to Azure using `AZURE_CREDENTIALS`
6. Deploys the zip to `kapetol-api` App Service via `azure/webapps-deploy@v3`

**Secret used:** `AZURE_CREDENTIALS`
(JSON for the `kapetol-github-actions` service principal — see below)

---

## Service Principal (GitHub Actions Identity)

A service principal named `kapetol-github-actions` was created so GitHub Actions
can authenticate to Azure without using your personal credentials.

| Field | Value |
|---|---|
| Name | kapetol-github-actions |
| Client ID | a7a1c9a0-6e05-496e-a2aa-92d81ecdd09e |
| Role | Contributor on `kapetol-rg` |
| Client secret | stored in GitHub secret `AZURE_CREDENTIALS` only |

The full JSON credential block is stored as the `AZURE_CREDENTIALS` GitHub secret
and is never committed to the repo.

To regenerate if the secret expires (they last ~1 year by default):

```powershell
az ad sp credential reset --id a7a1c9a0-6e05-496e-a2aa-92d81ecdd09e --sdk-auth
# Copy the JSON output and update the AZURE_CREDENTIALS secret in GitHub
```

---

## GitHub Secrets

| Secret name | What it is |
|---|---|
| `AZURE_CREDENTIALS` | Service principal JSON for API deployment |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_NICE_PLANT_0781F7A00` | Static Web Apps deploy token (auto-managed) |

To view or update secrets: GitHub → repo → Settings → Secrets and variables → Actions.

---

## Testing the App in the Browser

### Customer flow

1. Open https://nice-plant-0781f7a00.7.azurestaticapps.net
2. You will see the home / login screen
3. To register a new customer: tap **Register** and fill in name + phone number
4. After registering, you land on the **Customer Dashboard** showing your points
   and a QR code
5. Tap **Rewards** to browse what can be redeemed

> A test customer is already seeded in the database:
> - Name: Alec Cresencio
> - Phone: 09279179977
> Use this phone number on the login/lookup screen to sign in without registering.

### Staff flow

1. Open the same URL and tap **Staff Login**
2. Enter PIN: `1234`
3. **Scan QR (award points):** tap Scan, point camera at a customer QR code,
   submit — the customer receives 10 points
4. **Redeem reward:** tap Redeem, scan the customer QR, select a reward from
   the list, submit — points are deducted

### API smoke test (browser or curl)

```bash
# List all rewards
curl https://kapetol-api.azurewebsites.net/api/rewards

# Look up the seeded customer by phone
curl https://kapetol-api.azurewebsites.net/customers/by-phone/09279179977
```

### First-request cold start

Both the App Service and Azure SQL have idle timeouts. If the app hasn't been
used in ~20–60 minutes:

- The first API call may take 10–20 seconds while both services wake up
- Subsequent calls in the same session are fast
- This is expected behaviour on the free tier

---

## Common Maintenance Commands

```powershell
# Log in to Azure CLI
az login

# Check App Service status
az webapp show --name kapetol-api --resource-group kapetol-rg --query state

# Stream live App Service logs
az webapp log tail --name kapetol-api --resource-group kapetol-rg

# Download App Service logs as a zip
az webapp log download --name kapetol-api --resource-group kapetol-rg --log-file logs.zip

# Restart the App Service (clears cold-start state)
az webapp restart --name kapetol-api --resource-group kapetol-rg

# Check Azure SQL firewall rules
az sql server firewall-rule list --resource-group kapetol-rg --server kapetol-sql

# Add a new firewall rule for a new IP
az sql server firewall-rule create --resource-group kapetol-rg --server kapetol-sql \
  --name AllowMyNewIP --start-ip-address <ip> --end-ip-address <ip>

# Run EF migrations against the cloud database
cd KapetolLoyaltyApi
dotnet ef database update --connection "<azure-sql-connection-string>"
```

---

## Infrastructure Diagram

```
┌──────────────────────────────────────────────────────┐
│  Azure Account — alec.cresencio@gmail.com            │
│                                                      │
│  Resource Group: kapetol-rg (Southeast Asia)         │
│                                                      │
│  ┌──────────────────┐    ┌────────────────────────┐  │
│  │  Azure SQL        │◄───│  Azure App Service     │  │
│  │  kapetol-sql      │    │  kapetol-api           │  │
│  │  KapetolDb        │    │  .NET 10 / Linux F1    │  │
│  │  Serverless free  │    │  kapetol-api.          │  │
│  │                   │    │  azurewebsites.net     │  │
│  └──────────────────┘    └──────────┬─────────────┘  │
│                                     │ CORS allowed    │
│  ┌──────────────────────────────────▼─────────────┐  │
│  │  Azure Static Web Apps                         │  │
│  │  kapetol-app (East Asia, free)                 │  │
│  │  nice-plant-0781f7a00.7.azurestaticapps.net    │  │
│  │  Angular 21 + Ionic — auto-deploys from GitHub │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

GitHub repo: aleccresencio/kapetol-loyalty-app (private)
  └── push to main
        ├── .github/workflows/azure-static-web-apps-*.yml → frontend deploy
        └── .github/workflows/azure-app-service.yml      → API deploy (on API changes)
```
