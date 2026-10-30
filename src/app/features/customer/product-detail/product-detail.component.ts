import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { MenuItem } from '../../../models/catalog.models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `
    <div class="dialog-backdrop" (click)="close.emit()">
      <section class="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-title" (click)="$event.stopPropagation()">
        <button class="dialog-close" type="button" aria-label="Fechar detalhes" (click)="close.emit()">×</button>
        <img class="product-hero" [src]="product.image" [alt]="product.name" (error)="useFallback($event)">
        <div class="product-content">
          <span class="product-tag">{{ product.tag }}</span><h2 id="product-title">{{ product.name }}</h2>
          <p>{{ product.desc }}</p><div class="product-price-row"><strong class="product-price">R$ {{ product.price.toFixed(2).replace('.', ',') }}</strong>@if(product.originalPrice){<del>R$ {{product.originalPrice.toFixed(2).replace('.', ',')}}</del><span class="product-deal">{{product.discountPercent}}% OFF</span>}</div>
          <label class="note-label" for="product-note">Alguma observação? <span>Opcional</span></label>
          <textarea id="product-note" maxlength="180" placeholder="Ex.: tirar a cebola" [value]="note()" (input)="note.set($any($event.target).value)"></textarea>
          <div class="product-actions"><div class="quantity-control"><button type="button" aria-label="Diminuir quantidade" [disabled]="quantity()===1" (click)="quantity.update(value => value - 1)">−</button><b>{{ quantity() }}</b><button type="button" aria-label="Aumentar quantidade" (click)="quantity.update(value => value + 1)">＋</button></div>
            <button class="primary-action" type="button" (click)="addSelected()">Adicionar · R$ {{ (product.price * quantity()).toFixed(2).replace('.', ',') }}</button></div>
        </div>
      </section>
    </div>
  `,
styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent {
  @Input({ required: true }) product!: MenuItem;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<MenuItem[]>();
  readonly quantity = signal(1);
  readonly note = signal('');

  @HostListener('document:keydown.escape') onEscape(): void { this.close.emit(); }
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
  addSelected(): void {
    const selectedItems = Array.from({ length: this.quantity() }, () => ({ ...this.product, desc: this.note().trim() ? `Obs.: ${this.note().trim()}` : this.product.desc }));
    this.addToCart.emit(selectedItems);
  }
}
