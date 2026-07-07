import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

export const COLD_START_STATUSES = new Set([0, 500, 502, 503, 504]);
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;

export const coldStartRetryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error) => {
        if (!(error instanceof HttpErrorResponse) || !COLD_START_STATUSES.has(error.status)) {
          return throwError(() => error);
        }
        return timer(RETRY_DELAY_MS);
      }
    })
  );
};
