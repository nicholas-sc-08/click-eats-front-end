import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../../models/catalog.models';

export interface Promotion {
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private readonly activePromotions = signal<Record<string, number>>({ 'Duplo Cheddar': 20 });

  promotionFor(item: MenuItem): Promotion | null {
    const discountPercent = this.activePromotions()[item.name];
    if (!discountPercent) return null;
    const discountedPrice = Math.round(item.price * (1 - discountPercent / 100) * 100) / 100;
    return { originalPrice: item.price, discountPercent, discountedPrice };
  }

  isActive(item: MenuItem): boolean { return this.promotionFor(item) !== null; }
  priceFor(item: MenuItem): number { return this.promotionFor(item)?.discountedPrice ?? item.price; }

  itemForCart(item: MenuItem): MenuItem {
    const promotion = this.promotionFor(item);
    return promotion
      ? { ...item, price: promotion.discountedPrice, originalPrice: promotion.originalPrice, discountPercent: promotion.discountPercent }
      : { ...item, originalPrice: undefined, discountPercent: undefined };
  }

  setPromotion(item: MenuItem, enabled: boolean, discountPercent = 15): void {
    this.activePromotions.update(current => {
      const next = { ...current };
      if (enabled) next[item.name] = discountPercent;
      else delete next[item.name];
      return next;
    });
  }
}
