import { Routes } from '@angular/router';
import { staffGuard } from './guards/staff.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/welcome/welcome').then(m => m.WelcomePage)
  },
  {
    path: 'customer/register',
    loadComponent: () =>
      import('./pages/customer/register/register').then(m => m.CustomerRegisterPage)
  },
  {
    path: 'customer/dashboard',
    loadComponent: () =>
      import('./pages/customer/dashboard/dashboard').then(m => m.CustomerDashboardPage)
  },
  {
    path: 'customer/rewards',
    loadComponent: () =>
      import('./pages/customer/rewards/rewards').then(m => m.CustomerRewardsPage)
  },
  {
    path: 'staff/login',
    loadComponent: () =>
      import('./pages/staff/login/login').then(m => m.StaffLoginPage)
  },
  {
    path: 'staff/scan',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./pages/staff/scan/scan').then(m => m.StaffScanPage)
  },
  {
    path: 'staff/redeem',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./pages/staff/redeem/redeem').then(m => m.StaffRedeemPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
