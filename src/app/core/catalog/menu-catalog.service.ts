import { Injectable, signal } from '@angular/core';
import { MENU_BY_RESTAURANT } from './catalog.data';
import { MenuItem } from '../../models/catalog.models';

const STORAGE_KEY = 'clickeat.menu.brasa-ponto';

@Injectable({ providedIn: 'root' })
export class MenuCatalogService {
  readonly products = signal<MenuItem[]>(this.load());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed: unknown = JSON.parse(event.newValue);
            if (Array.isArray(parsed)) this.products.set(parsed.filter((item): item is MenuItem => this.isMenuItem(item)));
          } catch { /* Ignore malformed data from another tab. */ }
        }
      });
    }
  }

  save(products: MenuItem[]): void {
    this.products.set(products);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Keep changes in memory when browser storage is unavailable.
    }
  }

  private load(): MenuItem[] {
    const seed = MENU_BY_RESTAURANT['Brasa & Ponto'];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [...seed];
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [...seed];
      return parsed.filter((item): item is MenuItem => this.isMenuItem(item));
    } catch {
      return [...seed];
    }
  }

  private isMenuItem(value: unknown): value is MenuItem {
    if (!value || typeof value !== 'object') return false;
    const item = value as Partial<MenuItem>;
    return typeof item.name === 'string' && typeof item.desc === 'string'
      && typeof item.price === 'number' && typeof item.image === 'string'
      && typeof item.tag === 'string';
  }
}
