import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Restaurant } from '../../../models/catalog.models';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  template: `
    <article class="food-card" role="button" tabindex="0" [attr.aria-label]="'Abrir cardápio de ' + restaurant.name" (click)="open.emit(restaurant)" (keydown.enter)="open.emit(restaurant)">
      <div class="food-photo"><img class="restaurant-image" [src]="restaurant.image" [alt]="restaurant.name" loading="lazy" (error)="useFallback($event)"><span class="food-badge">{{ restaurant.tag }}</span>
        <button class="heart" type="button" [attr.aria-label]="favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'" [attr.aria-pressed]="favorite" (click)="$event.stopPropagation(); favoriteToggle.emit(restaurant.name)">{{ favorite ? '♥' : '♡' }}</button>
      </div>
      <div class="food-info"><div><h3>{{ restaurant.name }}</h3><span class="rating">★ {{ restaurant.rating }}</span></div><p>{{ restaurant.desc }}</p><div class="food-meta"><span>◷ {{ deliveryEstimate }} min</span><span>·</span><span>Entrega <b>R$ 4,99</b></span></div><button class="menu-link" type="button" (click)="$event.stopPropagation(); open.emit(restaurant)">Ver cardápio <span>→</span></button></div>
    </article>
  `,
  styleUrl: './restaurant-card.component.css',
})
export class RestaurantCardComponent {
  @Input({ required: true }) restaurant!: Restaurant;
  @Input({ required: true }) deliveryEstimate = '';
  @Input() favorite = false;
  @Output() open = new EventEmitter<Restaurant>();
  @Output() favoriteToggle = new EventEmitter<string>();
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
}
