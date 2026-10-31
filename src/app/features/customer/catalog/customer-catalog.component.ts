import { Component, computed, ElementRef, EventEmitter, inject, Input, Output, signal, ViewChild } from '@angular/core';
import { Restaurant, MenuItem } from '../../../models/catalog.models';
import { deliveryEstimate, MENU_BY_RESTAURANT, restaurantEmoji, RESTAURANTS } from '../../../core/catalog/catalog.data';
import { MenuItemCardComponent } from '../../../shared/components/menu-item-card/menu-item-card.component';
import { RestaurantCardComponent } from '../../../shared/components/restaurant-card/restaurant-card.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { PromotionService } from '../../../core/catalog/promotion.service';
import { InventoryService } from '../../../core/catalog/inventory.service';
import { MenuCatalogService } from '../../../core/catalog/menu-catalog.service';
import { OrderTrackingDemoService } from '../../../core/delivery/order-tracking-demo.service';

type CatalogView = 'home' | 'storefront' | 'favorites' | 'tracking';

@Component({
  selector: 'app-customer-catalog',
  standalone: true,
  imports: [MenuItemCardComponent, RestaurantCardComponent, ProductDetailComponent],
  template: `
    @if (view === 'storefront') {
      <section class="content store-page">
        <button class="back-link" type="button" (click)="navigate.emit('home')">← <span>Voltar para lojas</span></button>
        <div class="store-cover" [style.background-image]="'linear-gradient(90deg, #182a26cc, #182a2640), url(' + selectedStore().image + '), url(/images/food-fallback.svg)'">
          <span class="cover-tag">{{ selectedStore().tag }}</span><h1>{{ selectedStore().name }}</h1><p>{{ selectedStore().desc }}</p>
        </div>
        <div class="store-summary"><span class="store-avatar">{{ emoji(selectedStore().name) }}</span><div><strong>★ {{ selectedStore().rating }}</strong><span> · {{ reviewCount(selectedStore().name) }} avaliações</span><small>Entrega em {{ deliveryTime(selectedStore().name) }} min · taxa R$ 4,99</small></div><span class="open-label"><i></i> Aberto</span></div>
        <div class="menu-intro"><div><div class="eyebrow">FEITO NA HORA, COM CARINHO</div><h2>O cardápio</h2><p>Escolha seus favoritos e a gente leva até você.</p></div><label class="menu-search">⌕ <input aria-label="Buscar no cardápio" placeholder="Buscar no cardápio" [value]="menuQuery()" (input)="menuQuery.set($any($event.target).value)"></label></div>
        <div class="menu-list">@for (item of visibleMenu(); track item.name) { <app-menu-item-card [item]="item" (add)="addSingleToCart($event)" (select)="openProduct($event)" /> }</div>
      </section>
    } @else if (view === 'favorites') {
      <section class="content"><div class="eyebrow">SELEÇÃO PESSOAL</div><h1>Seus favoritos <span>♡</span></h1><p class="subheading">Restaurantes que você guardou para pedir quando bater a vontade.</p>
        @if(favoriteRestaurants().length){<div class="restaurant-grid">@for(restaurant of favoriteRestaurants();track restaurant.name){<app-restaurant-card [restaurant]="restaurant" [deliveryEstimate]="deliveryTime(restaurant.name)" [favorite]="true" (open)="openStore($event)" (favoriteToggle)="toggleFavorite($event)" /> }</div>} @else {<div class="empty-results"><span class="empty-results-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M24 40S7 30 7 18a9 9 0 0 1 17-4 9 9 0 0 1 17 4c0 12-17 22-17 22Z"/><path d="m17 24 5 5 10-11"/></svg></span><h2>Sua lista começa aqui</h2><p>Toque no coração de um restaurante para encontrá-lo facilmente depois.</p><button type="button" class="text-btn" (click)="navigate.emit('home')">Explorar restaurantes →</button></div>}
      </section>
    } @else {
      <section class="content">
        <div class="welcome-row"><div><div class="eyebrow">QUINTA-FEIRA, 30 DE OUTUBRO</div><h1>Oi, Marina <span>♡</span></h1><p class="subheading">O que vai deixar seu dia mais gostoso?</p></div><div class="weather-pill">☀ <span>22° em São Paulo</span></div></div>
        <label class="search-row"><span>⌕</span><input aria-label="Buscar restaurantes" placeholder="O que você quer comer hoje?" [value]="query()" (input)="query.set($any($event.target).value)"><kbd>⌘ K</kbd><button type="button">Buscar</button></label>
        <div class="hero"><div class="hero-copy"><span class="hero-tag">✳ SÓ HOJE</span><h2>Seu próximo<br>pedido favorito<br><em>tem desconto.</em></h2><p>Use <b>PRIMEIRACOMPRA</b> e ganhe R$ 15 de desconto no seu pedido.</p><button type="button" (click)="couponRequest.emit()">Aproveitar oferta <span>→</span></button><small>*Em pedidos acima de R$ 35</small></div><div class="hero-visual"><div class="hero-orbit"></div><div class="hero-food">🍔</div><div class="hero-fry">🍟</div><div class="hero-sticker">-15<span>REAIS</span></div><div class="hero-star">✳</div></div></div>
        <button class="active-delivery-card" type="button" (click)="navigate.emit('tracking')"><span class="delivery-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7h11v11H3zM14 11h4l3 4v3h-7z"/><circle cx="7.5" cy="19" r="2"/><circle cx="17.5" cy="19" r="2"/></svg></span><span class="delivery-copy"><small>PEDIDO #CE-8425 · BRASA & PONTO</small><strong>{{tracking.delivered()?'Pedido entregue!':'Seu pedido saiu para entrega!'}}</strong><span>{{tracking.delivered()?'Entrega concluída':('Rafael está a caminho · previsão de '+tracking.etaMinutes()+' min')}}</span></span><span class="delivery-cta">Acompanhar <b>→</b></span><i class="delivery-pulse"></i></button>
        <div class="section-heading"><div><h2>O que bateu vontade?</h2><p>Escolha sua categoria favorita</p></div><div class="category-arrows"><button type="button" aria-label="Rolar categorias para a esquerda" (click)="scrollCategories(-1)">←</button><button type="button" aria-label="Rolar categorias para a direita" (click)="scrollCategories(1)">→</button></div></div>
        <div #categoriesTrack class="categories" tabindex="0" aria-label="Categorias de restaurantes">@for (item of categories; track item.name) { <button class="category-card" type="button" [class.selected]="category()===item.name" [attr.aria-pressed]="category()===item.name" (click)="selectCategory(item.name)"><span class="category-emoji">{{ item.emoji }}</span><b>{{ item.name }}</b><small>{{ item.count }} lugares</small></button> }</div>
        <div class="section-heading restaurant-heading"><div><h2>{{ category()==='Todas'?'Queridinhos por perto':category()+' por perto' }}</h2><p>Seleção caprichada a poucos minutos de você</p></div><button class="text-btn" type="button" (click)="selectCategory('Todas')">Ver todos <span>→</span></button></div>
        @if(visibleRestaurants().length){<div class="restaurant-grid">@for (restaurant of visibleRestaurants(); track restaurant.name) { <app-restaurant-card [restaurant]="restaurant" [deliveryEstimate]="deliveryTime(restaurant.name)" [favorite]="favorites().includes(restaurant.name)" (open)="openStore($event)" (favoriteToggle)="toggleFavorite($event)" /> }</div>} @else {<div class="empty-results"><span class="empty-results-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="13"/><path d="m31 31 9 9M16 19h10M16 24h7"/></svg></span><h2>Nenhum resultado por aqui</h2><p>Experimente buscar por outro prato ou restaurante.</p><button type="button" class="text-btn" (click)="query.set('');category.set('Todas')">Limpar busca e filtros</button></div>}
      </section>
    }
    @if (selectedProduct(); as product) { <app-product-detail [product]="product" (close)="selectedProduct.set(null)" (addToCart)="addToCart.emit($event); selectedProduct.set(null)" /> }
  `,
  styleUrl: './customer-catalog.component.css',
})
export class CustomerCatalogComponent {
  readonly promotions = inject(PromotionService);
  readonly inventory = inject(InventoryService);
  readonly menuCatalog = inject(MenuCatalogService);
  readonly tracking = inject(OrderTrackingDemoService);
  @Input({ required: true }) view: string = 'home';
  @Output() navigate = new EventEmitter<CatalogView>();
  @Output() addToCart = new EventEmitter<MenuItem[]>();
  @Output() couponRequest = new EventEmitter<void>();

  readonly restaurants: Restaurant[] = RESTAURANTS;
  readonly categories = [
    { name: 'Hambúrguer', emoji: '🍔', count: 24 }, { name: 'Pizza', emoji: '🍕', count: 18 },
    { name: 'Japonesa', emoji: '🍣', count: 12 }, { name: 'Brasileira', emoji: '🍛', count: 16 },
    { name: 'Doces', emoji: '🍰', count: 9 }, { name: 'Saudável', emoji: '🥗', count: 11 },
    { name: 'Massas', emoji: '🍝', count: 14 }, { name: 'Mexicana', emoji: '🌮', count: 8 }, { name: 'Açaí', emoji: '🫐', count: 10 },
  ];
  readonly query = signal('');
  readonly category = signal('Todas');
  readonly favorites = signal<string[]>([]);
  readonly favoriteRestaurants = computed(() => this.restaurants.filter(restaurant => this.favorites().includes(restaurant.name)));
  readonly activeStore = signal('Brasa & Ponto');
  readonly menuQuery = signal('');
  readonly selectedProduct = signal<MenuItem | null>(null);
  @ViewChild('categoriesTrack') private categoriesTrack?: ElementRef<HTMLElement>;
  constructor() { try { this.favorites.set(JSON.parse(localStorage.getItem('clickeat.favorites') ?? '[]')); } catch { this.favorites.set([]); } }
  readonly selectedStore = computed(() => this.restaurants.find(store => store.name === this.activeStore()) ?? this.restaurants[0]);
  readonly visibleMenu = computed(() => {
    const query = this.menuQuery().trim().toLowerCase();
    const storeMenu = this.activeStore() === 'Brasa & Ponto' ? this.menuCatalog.products() : (MENU_BY_RESTAURANT[this.activeStore()] ?? []);
    return storeMenu.map(item => ({...item,stockAvailable:this.inventory.available(item.name)})).filter(item => !query || item.name.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query));
  });
  readonly visibleRestaurants = computed(() => {
    const restaurantByCategory: Record<string, string> = {
      'Hambúrguer': 'Brasa & Ponto', Pizza: 'Forno da Vila', Japonesa: 'Casa Nori',
      Brasileira: 'Quintal Brasileiro', Doces: 'Doce Estação', Saudável: 'Verde Perto',
      Massas: 'Cantina do Sol', Mexicana: 'Taco Nativo', 'Açaí': 'Açaí Lab',
    };
    const query = this.query().trim().toLowerCase();
    return this.restaurants.filter(restaurant => {
      const matchesCategory = this.category() === 'Todas' || restaurantByCategory[this.category()] === restaurant.name;
      const matchesQuery = !query || restaurant.name.toLowerCase().includes(query) || restaurant.desc.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  selectCategory(name: string): void { this.category.set(this.category() === name ? 'Todas' : name); }
  scrollCategories(direction: -1 | 1): void { this.categoriesTrack?.nativeElement.scrollBy({ left: direction * Math.max(220, this.categoriesTrack.nativeElement.clientWidth * .72), behavior: 'smooth' }); }
  addSingleToCart(item: MenuItem): void { this.addToCart.emit([item]); }
  openProduct(item: MenuItem): void { this.selectedProduct.set(this.promotions.itemForCart(item)); }
  openStore(restaurant: Restaurant): void { this.activeStore.set(restaurant.name); this.menuQuery.set(''); this.navigate.emit('storefront'); }
  toggleFavorite(name: string): void { this.favorites.update(items => { const updated = items.includes(name) ? items.filter(item => item !== name) : [...items, name]; try { localStorage.setItem('clickeat.favorites', JSON.stringify(updated)); } catch { /* Favorites remain available for this session. */ } return updated; }); }
  deliveryTime(name: string): string { return deliveryEstimate(name); }
  emoji(name: string): string { return restaurantEmoji(name); }
  reviewCount(name: string): string { return name === 'Brasa & Ponto' ? '1,2 mil' : name === 'Forno da Vila' ? '840' : '620'; }
}
