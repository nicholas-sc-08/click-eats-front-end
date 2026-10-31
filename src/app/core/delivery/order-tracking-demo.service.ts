import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderTrackingDemoService {
  readonly etaMinutes = signal(8);
  readonly delivered = signal(false);
  private elapsedSeconds = 0;
  private timer?: number;

  constructor() {
    if (typeof window === 'undefined') return;
    this.timer = window.setInterval(() => {
      this.elapsedSeconds += 1;
      if (this.elapsedSeconds % 20 !== 0) return;
      this.etaMinutes.update(minutes => Math.max(0, minutes - 1));
      if (this.etaMinutes() === 0) {
        this.delivered.set(true);
        if (this.timer !== undefined) window.clearInterval(this.timer);
      }
    }, 1_000);
  }
}
