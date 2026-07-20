import { Routes } from '@angular/router';
import { staffGuard } from './guards/staff.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customer/home/home').then(m => m.CustomerHomePage)
  },
  {
    path: 'rewards',
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
    path: 'staff/history',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./pages/staff/history/history').then(m => m.StaffHistoryPage)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
