import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiWarmupService {
  private readonly count = signal(0);
  readonly isWarming = computed(() => this.count() > 0);

  increment(): void {
    this.count.update((c) => c + 1);
  }

  decrement(): void {
    this.count.update((c) => Math.max(0, c - 1));
  }
}
