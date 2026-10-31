import { Component, inject, Input, signal } from '@angular/core';
import { PromotionService } from '../../core/catalog/promotion.service';
import { MenuItem } from '../../models/catalog.models';
import { WorkspaceSection } from '../../models/workspace.models';
import { ReportsPanelComponent } from '../reports/reports-panel.component';
import { AnalyticsPanelComponent } from '../analytics/analytics-panel.component';
import { DeliveryFeesComponent } from '../delivery/delivery-fees.component';
import { RestaurantProfileComponent } from './restaurant-profile.component';
import { RestaurantReviewsComponent } from './restaurant-reviews.component';
import { InventoryService } from '../../core/catalog/inventory.service';
import { MenuCatalogService } from '../../core/catalog/menu-catalog.service';
import { StoreMenuManagementComponent } from './store-menu-management.component';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [ReportsPanelComponent, AnalyticsPanelComponent, DeliveryFeesComponent, RestaurantProfileComponent, RestaurantReviewsComponent, StoreMenuManagementComponent],
  template: `
    @if(section === 'reports') {
      <app-reports-panel [scope]="'store'" />
    } @else if(section === 'settings') {
      <app-restaurant-profile /><app-delivery-fees [owner]="'store'" />
    } @else {
    <section class="content">
      <div class="eyebrow">ÁREA DO PARCEIRO</div><h1>{{sectionTitle()}} <span>Brasa & Ponto.</span></h1>
      <p class="subheading">{{sectionDescription()}}</p>
      @if(section === 'overview') {
      <app-analytics-panel [scope]="'store'" />
      <div class="stats-grid store-stats">
        <article class="stat-card"><small>Vendas hoje</small><b>R$ 1.842 <span class="up">↗ 18%</span></b><span>42 pedidos</span></article>
        <article class="stat-card"><small>Pedidos recebidos</small><b>12 <span class="up">+3</span></b><span>4 aguardam confirmação</span></article>
        <article class="stat-card"><small>Avaliação da loja</small><b>★ 4,9</b><span>de 312 avaliações</span></article>
        <article class="stat-card"><small>Tempo médio</small><b>28 min</b><span>meta: até 35 minutos</span></article>
      </div>
      }
      @if(section === 'overview' || section === 'orders') {
      <article class="panel partner-orders"><div class="panel-heading"><div><h2>Pedidos para acompanhar</h2><p>Atualizado agora</p></div><button class="text-btn">Ver todos →</button></div>
        <div class="partner-order"><div><small>#CE-8424 · há 2 min</small><h3>Combo Brasa Clássico</h3><p>1x Burger da casa · 1x Fritas crocantes · 1x Coca-Cola</p></div><b>R$ 58,90</b><button class="primary-btn">Aceitar pedido</button></div>
        <div class="partner-order"><div><small>#CE-8423 · há 6 min</small><h3>Cheddar Bacon Duplo</h3><p>2x Burger duplo · ponto da carne: ao ponto</p></div><b>R$ 76,00</b><button class="soft-btn">Em preparo</button></div>
      </article>
      }
      @if(section === 'catalog') { <app-store-menu-management /> }
      @if(section === 'overview' || section === 'catalog') {
      <section class="panel promotion-manager"><div class="panel-heading"><div><div class="eyebrow">CARDÁPIO</div><h2>Promoções dos produtos</h2><p>Ative ou ajuste uma oferta para ela aparecer para os clientes.</p></div><span class="promo-preview-badge">✦ Vitrine do cliente</span></div>
        <div class="promotion-list">@for(product of products(); track product.name){<article class="promotion-row"><div class="promotion-product"><img [src]="product.image" [alt]="product.name" (error)="useFallback($event)"><div><b>{{product.name}}</b><small>{{product.desc}}</small>@if(promotions.promotionFor(product);as deal){<span class="promo-price">R$ {{deal.discountedPrice.toFixed(2).replace('.', ',')}} <del>R$ {{deal.originalPrice.toFixed(2).replace('.', ',')}}</del></span>}@else{<span class="regular-price">R$ {{product.price.toFixed(2).replace('.', ',')}}</span>}</div></div>
          <div class="promotion-controls"><label class="discount-select">Desconto<select [value]="promotionPercent(product)" (change)="setPromotionPercent(product, $any($event.target).value)"><option value="10">10%</option><option value="15">15%</option><option value="20">20%</option><option value="25">25%</option><option value="30">30%</option></select></label><label class="promotion-toggle"><input type="checkbox" [checked]="promotions.isActive(product)" (change)="togglePromotion(product, $any($event.target).checked)"><span class="toggle-track"></span><span>{{promotions.isActive(product)?'Ativa':'Desativada'}}</span></label><div class="stock-editor"><label class="stock-limit"><input type="checkbox" [checked]="inventory.limitFor(product.name).enabled" (change)="setStockEnabled(product.name,$any($event.target).checked)"><span class="stock-toggle" aria-hidden="true"></span><span class="stock-copy"><b>Limitar estoque</b><small>{{inventory.limitFor(product.name).enabled?'Controle ativo':'Sem limite'}}</small></span></label>@if(inventory.limitFor(product.name).enabled){<div class="stock-quantity"><button type="button" [disabled]="inventory.limitFor(product.name).quantity===0" (click)="changeStock(product.name,-1)" [attr.aria-label]="'Reduzir estoque de ' + product.name">−</button><label><small>UNIDADES DISPONÍVEIS</small><input type="number" min="0" step="1" [value]="inventory.limitFor(product.name).quantity" (change)="setStockQuantity(product.name,$any($event.target).value)" [attr.aria-label]="'Unidades disponíveis de ' + product.name"></label><button type="button" (click)="changeStock(product.name,1)" [attr.aria-label]="'Aumentar estoque de ' + product.name">＋</button></div><small class="stock-status">{{inventory.limitFor(product.name).quantity===0?'Esgotado para clientes':inventory.limitFor(product.name).quantity+' unidades disponíveis'}}</small>}@else{<small class="stock-status">Disponibilidade sem limite</small>}</div></div>
        </article>}</div>
      </section>
      }
      @if(section === 'reviews') { <app-restaurant-reviews /> }
    </section>
    }
  `,
  styleUrl: './store-dashboard.component.css',
})
export class StoreDashboardComponent {
  @Input() section: WorkspaceSection = 'overview';
  readonly promotions = inject(PromotionService);
  readonly inventory = inject(InventoryService);
  readonly products = inject(MenuCatalogService).products;
  readonly configuredDiscounts = signal<Record<string, number>>({});
  setStockEnabled(name:string,enabled:boolean):void{this.inventory.save(name,{...this.inventory.limitFor(name),enabled});}
  setStockQuantity(name:string,value:string):void{const quantity=Number(value);if(Number.isFinite(quantity))this.inventory.save(name,{enabled:true,quantity:Math.max(0,Math.floor(quantity))});}
  changeStock(name:string,delta:number):void{const current=this.inventory.limitFor(name);this.setStockQuantity(name,String(Math.max(0,current.quantity+delta)));}


  promotionPercent(product: MenuItem): number { return this.promotions.promotionFor(product)?.discountPercent ?? this.configuredDiscounts()[product.name] ?? 15; }
  togglePromotion(product: MenuItem, enabled: boolean): void {
    const discount = this.promotionPercent(product);
    this.configuredDiscounts.update(values => ({ ...values, [product.name]: discount }));
    this.promotions.setPromotion(product, enabled, discount);
  }
  setPromotionPercent(product: MenuItem, value: string): void {
    const discount = Number(value);
    this.configuredDiscounts.update(values => ({ ...values, [product.name]: discount }));
    if (this.promotions.isActive(product)) this.promotions.setPromotion(product, true, discount);
  }
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
  sectionTitle(): string { return ({ overview: 'Visão geral,', orders: 'Pedidos da loja,', catalog: 'Cardápio e ofertas,', reviews: 'Avaliações da loja,', settings: 'Configurações,' } as Partial<Record<WorkspaceSection, string>>)[this.section] ?? 'Olá,'; }
  sectionDescription(): string { return ({ overview: 'Seu restaurante está com tudo em dia. Bora vender?', orders: 'Acompanhe e atualize os pedidos recebidos.', catalog: 'Ajuste seus produtos e publique ofertas para os clientes.', reviews: 'Veja como os clientes estão avaliando sua experiência.', settings: 'Mantenha as informações do restaurante atualizadas.' } as Partial<Record<WorkspaceSection, string>>)[this.section] ?? 'Seu restaurante está com tudo em dia.'; }
}
