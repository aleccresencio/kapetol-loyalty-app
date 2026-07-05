import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { finalize, retry } from 'rxjs/operators';
import { ApiWarmupService } from '../services/api-warmup';

export const COLD_START_STATUSES = new Set([0, 500, 502, 503, 504]);
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

export const coldStartRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const warmup = inject(ApiWarmupService);
  let counted = false;

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error) => {
        if (!(error instanceof HttpErrorResponse) || !COLD_START_STATUSES.has(error.status)) {
          return throwError(() => error);
        }
        if (!counted) {
          counted = true;
          warmup.increment();
        }
        return timer(RETRY_DELAY_MS);
      }
    }),
    finalize(() => {
      if (counted) warmup.decrement();
    })
  );
};
