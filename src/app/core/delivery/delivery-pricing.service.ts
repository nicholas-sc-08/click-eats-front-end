import { Injectable } from '@angular/core';

export type DeliveryOwner = 'platform' | 'store';
export type DeliveryPricingRuleKind = 'Bairro' | 'Distância' | 'Por quilômetro';
export interface DeliveryPricingRule { id: number; name: string; kind: DeliveryPricingRuleKind; value: number; }
export interface DeliveryPricingConfig {
  enabled: boolean;
  mode: 'own' | 'platform';
  baseFee: number;
  includedKm: number;
  rules: DeliveryPricingRule[];
}

const DEFAULT_CONFIG: DeliveryPricingConfig = {
  enabled: true,
  mode: 'own',
  baseFee: 5.99,
  includedKm: 3,
  rules: [
    { id: 1, name: 'Pinheiros', kind: 'Bairro', value: 4.99 },
    { id: 2, name: 'Vila Madalena', kind: 'Bairro', value: 6.99 },
    { id: 3, name: '3 a 5 km', kind: 'Distância', value: 8.99 },
    { id: 4, name: 'Acima de 5 km', kind: 'Por quilômetro', value: 1.5 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DeliveryPricingService {
  get(owner: DeliveryOwner): DeliveryPricingConfig {
    try {
      const saved = localStorage.getItem(this.storageKey(owner));
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : this.cloneDefaults();
    } catch {
      return this.cloneDefaults();
    }
  }

  save(owner: DeliveryOwner, config: DeliveryPricingConfig): void {
    try { localStorage.setItem(this.storageKey(owner), JSON.stringify(config)); } catch { /* Storage can be unavailable in private browsing. */ }
  }

  private storageKey(owner: DeliveryOwner): string { return `clickeat.delivery-pricing.${owner}`; }
  private cloneDefaults(): DeliveryPricingConfig { return { ...DEFAULT_CONFIG, rules: DEFAULT_CONFIG.rules.map(rule => ({ ...rule })) }; }
}
