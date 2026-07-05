import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StaffAuthService } from '../../../services/staff-auth';
import { SessionService } from '../../../services/session';
import { ApiWarmupService } from '../../../services/api-warmup';

const PIN_LENGTH = 4;

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class StaffLoginPage {
  pin = '';
  shake = false;
  submitting = false;
  error = '';

  readonly digitIndicators = Array.from({ length: PIN_LENGTH });
  readonly keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  constructor(
    private staffAuth: StaffAuthService,
    private session: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    readonly apiWarmup: ApiWarmupService
  ) {}

  pressKey(key: string) {
    if (this.submitting) return;

    if (key === 'back') {
      this.pin = this.pin.slice(0, -1);
      return;
    }
    if (key === '' || this.pin.length >= PIN_LENGTH) return;

    this.pin += key;

    if (this.pin.length === PIN_LENGTH) {
      this.submit();
    }
  }

  private submit() {
    this.submitting = true;
    this.error = '';

    this.staffAuth.verifyPin(this.pin).subscribe({
      next: (response) => {
        this.session.setStaffSession(response.token, new Date(response.expiresAt).getTime());
        this.router.navigate(['/staff/scan']);
      },
      error: (err: HttpErrorResponse) => {
        this.pin = '';
        this.submitting = false;
        if (err.status === 401) {
          this.shake = true;
          setTimeout(() => {
            this.shake = false;
            this.cdr.detectChanges();
          }, 400);
        } else {
          this.error = 'Unable to reach the server. Please check your connection and try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
