# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kapetol Loyalty App — an Ionic + Angular 21 mobile-first web app for a cafe loyalty points system. It has two roles in a single app: **customers** (register, view QR code, browse/redeem rewards) and **cafe staff** (scan QR to award points, scan QR to deduct points for rewards).

The companion .NET 10 backend lives in this repo at `KapetolLoyaltyApi/` and runs on `http://localhost:5166`.

## Commands

```bash
ng serve          # dev server at http://localhost:4200
ng build          # production build to dist/
ng build --configuration development  # dev build (no optimisation, source maps)
ng test           # unit tests via Vitest
```

## Architecture

### Ionic + Angular standalone

All components are standalone (no NgModules). Ionic is set up via `provideIonicAngular()` in `app.config.ts` — this registers Ionic's Stencil web components with the browser. The root template must use `<ion-app>` and `<ion-router-outlet>` (not Angular's `<router-outlet>`) for pages to mount correctly.

Ionic components are imported individually from `@ionic/angular/standalone` in each component's `imports` array. Only import what the template actually uses — Angular's strict template checking will warn about unused imports.

### Routing

All routes use lazy `loadComponent`. The `/staff/scan` and `/staff/redeem` routes are protected by `staffGuard` (`src/app/guards/staff.guard.ts`), which checks `SessionService.isStaffAuthenticated()` and redirects to `/staff/login` if false.

### Services

| Service | Purpose |
|---|---|
| `CustomerService` | API calls: register, getById, getByPhone, getQrCodeUrl |
| `RewardsService` | API calls: list rewards, redeem reward |
| `LoyaltyService` | API call: POST `/api/loyalty/scan` (award points) |
| `SessionService` | Persists state — customer id/phone in `localStorage`, staff auth in `sessionStorage` |

All API services hardcode the base URL `http://localhost:5166`. The API uses camelCase JSON.

### Session / auth

- **Customer identity** is stored in `localStorage` (survives browser close). `CustomerDashboardPage` reads `customerId` + `customerPhone` from `SessionService` and calls `getByPhone()` to fetch current points.
- **Staff auth** is stored in `sessionStorage` (clears on tab close). The PIN is hardcoded as `'1234'` in `StaffLoginPage`.

### QR scanning

`@zxing/ngx-scanner` (`ZXingScannerModule`) is used on the staff scan and redeem pages. It accesses the camera via browser WebRTC — no Capacitor plugin needed, so it works in both browser and native builds. On scan success, the `qrCodeId` is auto-populated and the form submits.

### CSS

Ionic global styles are imported in `src/styles.css` via `@import "@ionic/angular/css/..."`. The build system resolves these from `node_modules`. Do not move them to `angular.json` styles array — the current setup works with Angular's esbuild pipeline.

### Backend (KapetolLoyaltyApi)

Key endpoints consumed by this app:

| Method | Path | Used by |
|---|---|---|
| POST | `/customers` | CustomerRegisterPage |
| GET | `/customers/{id}` | — |
| GET | `/customers/by-phone/{phone}` | CustomerDashboardPage, CustomerRewardsPage |
| GET | `/customers/{id}/qrcode` | CustomerDashboardPage (as `<img>` src) |
| POST | `/api/loyalty/scan` | StaffScanPage |
| POST | `/api/loyalty/redeem` | StaffRedeemPage, CustomerRewardsPage |
| GET | `/api/rewards` | CustomerRewardsPage, StaffRedeemPage |

The Rewards table is auto-created and seeded (4 sample rewards) on first API startup via raw SQL in `Program.cs`.

## Change detection

All components use Angular's default change detection, but Ionic's page lifecycle and HTTP callbacks run outside the zone in practice — meaning the view will not update automatically after an Observable `next` or `error` callback sets a property.

**Rule: always call `this.cdr.detectChanges()` immediately after setting component state inside any Observable callback** (HTTP subscriptions, async operations). Inject `ChangeDetectorRef` via the constructor.

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
