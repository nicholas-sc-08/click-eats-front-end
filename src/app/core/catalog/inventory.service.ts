import { Injectable, signal } from '@angular/core';

export interface ProductLimit { enabled: boolean; quantity: number; }
const STORAGE_KEY = 'clickeat.inventory';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  readonly limits = signal<Record<string, ProductLimit>>(this.load());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key !== STORAGE_KEY || !event.newValue) return;
        try { this.limits.set(JSON.parse(event.newValue) as Record<string, ProductLimit>); } catch { /* Ignore malformed data from another tab. */ }
      });
    }
  }

  private load(): Record<string, ProductLimit> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, ProductLimit>; } catch { return {}; }
  }

  limitFor(name: string): ProductLimit { return this.limits()[name] ?? { enabled: false, quantity: 20 }; }

  save(name: string, limit: ProductLimit): void {
    this.limits.update(values => {
      const next = { ...values, [name]: { enabled: limit.enabled, quantity: Math.max(0, Math.floor(limit.quantity)) } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep changes in memory for this session. */ }
      return next;
    });
  }

  available(name: string): boolean { const limit = this.limitFor(name); return !limit.enabled || limit.quantity > 0; }
}
