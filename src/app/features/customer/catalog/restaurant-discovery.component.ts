import { Component, computed, input, output, signal } from '@angular/core';
import { deliveryEstimate } from '../../../core/catalog/catalog.data';
import { Restaurant } from '../../../models/catalog.models';
import { RestaurantCardComponent } from '../../../shared/components/restaurant-card/restaurant-card.component';

type RestaurantSort = 'recommended' | 'rating' | 'fastest';

@Component({
  selector: 'app-restaurant-discovery',
  standalone: true,
  imports: [RestaurantCardComponent],
  template: `
    <section class="content discovery-page" aria-labelledby="discovery-title">
      <button class="discovery-back" type="button" (click)="back.emit()">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-6 5.5 6 5.5"/></svg>
        Voltar para o início
      </button>

      <header class="discovery-header">
        <div>
          <div class="eyebrow">ENCONTRE SEU PRÓXIMO FAVORITO</div>
          <h1 id="discovery-title">Lojas por <span>perto.</span></h1>
          <p>Boas escolhas do seu bairro, prontas para chegar até você.</p>
        </div>
        <div class="delivery-location">
          <span class="location-icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M16 8.3c0 4.3-6 9.2-6 9.2S4 12.6 4 8.3a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg></span>
          <span><small>ENTREGAR EM</small><b>Rua Harmonia, 321</b></span>
          <span class="location-chevron" aria-hidden="true">⌄</span>
        </div>
      </header>

      <section class="discovery-controls" aria-label="Buscar e filtrar lojas">
        <label class="discovery-search">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
          <input aria-label="Buscar restaurante, cozinha ou bairro" placeholder="Buscar restaurante, cozinha ou bairro" [value]="query()" (input)="query.set($any($event.target).value)">
          @if (query()) {
            <button type="button" aria-label="Limpar busca" (click)="query.set('')">×</button>
          }
        </label>
        <label class="sort-control">
          <span>Ordenar por</span>
          <select [value]="sort()" (change)="sort.set($any($event.target).value)">
            <option value="recommended">Recomendados</option>
            <option value="rating">Melhor avaliados</option>
            <option value="fastest">Entrega mais rápida</option>
          </select>
        </label>
      </section>

      <nav class="discovery-categories" aria-label="Filtrar por categoria">
        @for (category of categories(); track category) {
          <button type="button" [class.selected]="selectedCategory() === category" [attr.aria-pressed]="selectedCategory() === category" (click)="selectedCategory.set(category)">
            {{ category }}
          </button>
        }
      </nav>

      <div class="discovery-results-heading">
        <div>
          <h2>{{ selectedCategory() === 'Todas' ? 'Restaurantes perto de você' : selectedCategory() + ' por perto' }}</h2>
          <p>{{ filteredRestaurants().length }} {{ filteredRestaurants().length === 1 ? 'loja encontrada' : 'lojas encontradas' }}</p>
        </div>
        <span class="results-prompt"><i></i> Atualizado para sua região</span>
      </div>

      @if (filteredRestaurants().length) {
        <div class="discovery-grid">
          @for (restaurant of filteredRestaurants(); track restaurant.name) {
            <app-restaurant-card
              [restaurant]="restaurant"
              [deliveryEstimate]="deliveryTime(restaurant.name)"
              [favorite]="favorites().includes(restaurant.name)"
              (open)="openRestaurant.emit($event)"
              (favoriteToggle)="favoriteToggle.emit($event)"
            />
          }
        </div>
      } @else {
        <div class="discovery-empty">
          <span class="discovery-empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="13"/><path d="m31 31 9 9M16 19h10M16 24h7"/></svg></span>
          <h2>Não encontramos lojas com esses filtros</h2>
          <p>Tente buscar por outro nome ou escolha uma categoria diferente.</p>
          <button type="button" (click)="clearFilters()">Limpar busca e filtros</button>
        </div>
      }
    </section>
  `,
  styleUrl: './restaurant-discovery.component.css',
})
export class RestaurantDiscoveryComponent {
  readonly restaurants = input.required<Restaurant[]>();
  readonly favorites = input<string[]>([]);
  readonly back = output<void>();
  readonly openRestaurant = output<Restaurant>();
  readonly favoriteToggle = output<string>();

  readonly query = signal('');
  readonly sort = signal<RestaurantSort>('recommended');
  readonly selectedCategory = signal('Todas');
  readonly categories = computed(() => ['Todas', ...new Set(this.restaurants().map(restaurant => restaurant.category))]);

  readonly filteredRestaurants = computed(() => {
    const search = this.query().trim().toLocaleLowerCase('pt-BR');
    const selectedCategory = this.selectedCategory();
    const restaurants = this.restaurants().filter(restaurant => {
      const matchesCategory = selectedCategory === 'Todas' || restaurant.category === selectedCategory;
      const searchableText = `${restaurant.name} ${restaurant.desc} ${restaurant.category}`.toLocaleLowerCase('pt-BR');
      return matchesCategory && (!search || searchableText.includes(search));
    });

    if (this.sort() === 'rating') {
      return [...restaurants].sort((first, second) => this.rating(second) - this.rating(first));
    }
    if (this.sort() === 'fastest') {
      return [...restaurants].sort((first, second) => this.deliveryMinutes(first) - this.deliveryMinutes(second));
    }
    return restaurants;
  });

  deliveryTime(name: string): string {
    return deliveryEstimate(name);
  }

  clearFilters(): void {
    this.query.set('');
    this.selectedCategory.set('Todas');
    this.sort.set('recommended');
  }

  private rating(restaurant: Restaurant): number {
    return Number(restaurant.rating.replace(',', '.'));
  }

  private deliveryMinutes(restaurant: Restaurant): number {
    return Number.parseInt(deliveryEstimate(restaurant.name).split(/[–-]/)[0], 10);
  }
}
