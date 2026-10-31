import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MenuItem } from '../../../models/catalog.models';
import { PromotionService } from '../../../core/catalog/promotion.service';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  template: `
    <article class="menu-item" role="button" tabindex="0" [attr.aria-label]="'Ver detalhes de ' + item.name" (click)="select.emit(item)" (keydown.enter)="select.emit(item)"><div><span class="menu-tag">{{ item.stockAvailable===false?'ESGOTADO':item.tag }}</span><h3>{{ item.name }}</h3><p>{{ item.desc }}</p><div class="menu-prices"><strong [class.sale-price]="promotions.isActive(item)">R$ {{ promotions.priceFor(item).toFixed(2).replace('.', ',') }}</strong>@if(promotions.promotionFor(item);as deal){<del>R$ {{deal.originalPrice.toFixed(2).replace('.', ',')}}</del>}</div></div><div class="menu-photo"><img [src]="item.image" [alt]="item.name" loading="lazy" (error)="useFallback($event)">@if(promotions.promotionFor(item);as deal){<span class="deal-badge">−{{deal.discountPercent}}%</span>}<button type="button" [disabled]="item.stockAvailable===false" [attr.aria-label]="item.stockAvailable===false?'Produto esgotado':'Adicionar ' + item.name + ' à sacola'" (click)="$event.stopPropagation(); addCurrentItem()">{{item.stockAvailable===false?'—':'＋'}}</button></div></article>
  `,
  styleUrl: './menu-item-card.component.css',
})
export class MenuItemCardComponent {
  readonly promotions = inject(PromotionService);
  @Input({ required: true }) item!: MenuItem;
  @Output() add = new EventEmitter<MenuItem>();
  @Output() select = new EventEmitter<MenuItem>();
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
  addCurrentItem(): void { this.add.emit(this.promotions.itemForCart(this.item)); }
}
