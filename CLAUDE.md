# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kapetol Loyalty App — an installable Angular 21 PWA for a cafe loyalty points system. It has two roles in a single app, split by route: **customers** (`/`, `/rewards` — identify by phone number, view QR code, browse/redeem rewards, install as an app) and **cafe staff** (`/staff/**`, PIN-gated — scan QR to award points, scan QR to deduct points for rewards).

The companion .NET 10 backend lives in this repo at `KapetolLoyaltyApi/` and runs on `http://localhost:5166`.

## Commands

```bash
ng serve          # dev server at http://localhost:4200
ng build          # production build to dist/
ng build --configuration development  # dev build (no optimisation, source maps)
ng test           # unit tests via Vitest
```

## Architecture

### Plain Angular standalone PWA

All components are standalone (no NgModules, no UI framework). The root template uses Angular's own `<router-outlet>`. Pages are hand-styled with plain HTML/CSS; shared button/field/card/list styles live in `src/styles.css` (global, not scoped) so pages don't repeat the same class definitions.

The app is installable via `@angular/service-worker` (`provideServiceWorker` in `app.config.ts`, config in `ngsw-config.json`, manifest at `public/manifest.webmanifest`). `PwaInstallService` (`src/app/services/pwa-install.ts`) captures the `beforeinstallprompt` event for a custom Android/Chrome "Install" button, and separately detects iOS Safari (no install-prompt API exists there) to show a dismissible "tap Share → Add to Home Screen" banner. Both are surfaced on the customer home page.

### Routing

Flattened, route-based flows — the URL alone determines customer vs. staff, there is no chooser screen:

| Route | Flow |
|---|---|
| `/` | Customer home — phone-first identification, falls into the dashboard view once a `customerId` is in `localStorage` |
| `/rewards` | Customer rewards list + redemption |
| `/staff/login` | Staff PIN pad |
| `/staff/scan` | Staff — scan QR to award points (guarded) |
| `/staff/redeem` | Staff — scan QR to redeem a reward (guarded) |

All routes use lazy `loadComponent`. `/staff/scan` and `/staff/redeem` are protected by `staffGuard` (`src/app/guards/staff.guard.ts`), which checks `SessionService.isStaffAuthenticated()` (token present and not expired) and redirects to `/staff/login` if false.

### Services

| Service | Purpose |
|---|---|
| `CustomerService` | API calls: register, getById, getByPhone, getQrCodeUrl |
| `RewardsService` | API calls: list rewards, redeem reward |
| `LoyaltyService` | API call: POST `/api/loyalty/scan` (award points) |
| `StaffAuthService` | API call: POST `/api/staff/verify-pin` |
| `SessionService` | Persists state — customer id/phone in `localStorage`, staff `{token, expiresAt}` in `sessionStorage` |
| `StaffIdleService` | Listens for click/keydown/touchstart activity and refreshes the staff session's idle expiry while authenticated |
| `PwaInstallService` | Captures `beforeinstallprompt`; detects iOS Safari for the manual install banner |

All API services read the base URL from `environment.apiUrl` (`src/environments/`), swapped at build time via `angular.json`'s `fileReplacements` — `environment.ts` points at `localhost:5166` for dev, `environment.prod.ts` at the deployed Azure API. The API uses camelCase JSON.

### Session / auth

- **Customer identity** is stored in `localStorage` (survives browser close). `CustomerHomePage` reads `customerId` + `customerPhone` from `SessionService` and calls `getByPhone()` to fetch current points.
- **Staff auth** is a single shared PIN, validated server-side (`POST /api/staff/verify-pin`, config value `StaffPin`) rather than hardcoded in the frontend. On success the API returns an HMAC-signed session token + expiry, stored in `sessionStorage` via `SessionService.setStaffSession()`. The session idle-expires after 15 minutes (`STAFF_IDLE_TIMEOUT_MS` in `session.ts`); `StaffIdleService` resets that expiry on any user activity while authenticated. Note: the `scan`/`redeem` API endpoints themselves do not check this token — it only gates the SPA route via `staffGuard`.

### QR scanning

`html5-qrcode`'s `Html5Qrcode` class is used on the staff scan and redeem pages — `start(cameraConfig, onScanSuccess)` handles camera access via WebRTC and decoding internally (no manual canvas/`requestAnimationFrame` loop needed). On scan success, the `qrCodeId` is auto-populated and the form submits.

### Backend (KapetolLoyaltyApi)

Key endpoints consumed by this app:

| Method | Path | Used by |
|---|---|---|
| POST | `/customers` | CustomerHomePage (new customer) |
| GET | `/customers/{id}` | — |
| GET | `/customers/by-phone/{phone}` | CustomerHomePage, CustomerRewardsPage |
| GET | `/customers/{id}/qrcode` | CustomerHomePage (as `<img>` src) |
| POST | `/api/loyalty/scan` | StaffScanPage |
| POST | `/api/loyalty/redeem` | StaffRedeemPage, CustomerRewardsPage |
| GET | `/api/rewards` | CustomerRewardsPage, StaffRedeemPage |
| POST | `/api/staff/verify-pin` | StaffLoginPage |

The Rewards table is auto-created and seeded (4 sample rewards) via EF Core migrations, not raw SQL — see `Migrations/` and `AppDbContext.cs`.

## Change detection

All components use Angular's default (zone.js) change detection. The `this.cdr.detectChanges()` calls after HTTP subscriptions predate the Ionic → plain Angular pivot, when Ionic's Stencil web components broke zone propagation for state set inside their event handlers. With Ionic removed, zone.js should propagate plain HTTP callbacks automatically — the manual calls are kept for now as a known-safe pattern but haven't been confirmed unnecessary. If you touch one of these components, feel free to try removing it and verify in the browser that the view still updates.

**Existing rule (may be redundant post-pivot):** call `this.cdr.detectChanges()` immediately after setting component state inside any Observable callback (HTTP subscriptions, async operations). Inject `ChangeDetectorRef` via the constructor.

```typescript
constructor(private cdr: ChangeDetectorRef) {}

this.someService.getData().subscribe({
  next: (data) => {
    this.items = data;
    this.cdr.detectChanges(); // required
  },
  error: (err) => {
    this.error = err.message;
    this.cdr.detectChanges(); // required
  }
});
```

Navigation calls (`this.router.navigate`) after a `next` callback do not need `detectChanges()` since the page is being replaced.

## Git workflow

After completing any meaningful unit of work — a new feature, a bug fix, a config change — commit and push immediately. Never leave work uncommitted at the end of a session.

Use conventional commit prefixes:
- `feat:` — new feature or page
- `fix:` — bug fix
- `chore:` — dependencies, config, tooling
- `docs:` — documentation only

Commit related changes together in one logical commit rather than one giant commit per session. Push to `origin main` after every commit (or after a tight sequence of commits).

```powershell
git add <specific files>
git commit -m @'
feat: short description

Longer explanation if needed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
'@
git push origin main
```

The remote is `https://github.com/aleccresencio/kapetol-loyalty-app` (private). Use PowerShell here-string syntax (`@'...'@`) for multi-line commit messages — bash heredocs (`<<'EOF'`) do not work in PowerShell.

## TypeScript config

Strict mode is fully enabled including `strictTemplates`. Keep all types explicit — avoid `any`. The compiler target is ES2022 with `module: preserve`.
