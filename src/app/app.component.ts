import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from './core/notifications/notification.service';
import { MenuItem } from './models/catalog.models';
import { CustomerCatalogComponent } from './features/customer/catalog/customer-catalog.component';
import { CustomerAccountComponent } from './features/customer/customer-account.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { CourierDashboardComponent } from './features/courier/courier-dashboard.component';
import { StoreDashboardComponent } from './features/store/store-dashboard.component';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { CheckoutComponent } from './features/customer/checkout/checkout.component';
import { calculateCoupon } from './features/customer/coupons/coupon';
import { OrderTrackingComponent } from './features/customer/order-tracking/order-tracking.component';
import { WorkspaceSidebarComponent } from './shared/components/workspace-sidebar/workspace-sidebar.component';
import { WorkspaceRole, WorkspaceSection } from './models/workspace.models';

@Component({ selector: 'app-root', standalone: true, imports: [AdminDashboardComponent, CourierDashboardComponent, CustomerAccountComponent, CustomerCatalogComponent, NotificationToastComponent, StoreDashboardComponent, CheckoutComponent, OrderTrackingComponent, WorkspaceSidebarComponent], template: `
<div class="app-shell" [class.dark-theme]="isDarkTheme()" [class.checkout-active]="role()!=='customer' || view()==='checkout' || view()==='tracking'">
  @if(role()==='customer') {
  <aside class="sidebar" [class.open]="sidebarOpen()">
    <a class="brand" href="#" (click)="$event.preventDefault(); view.set('home')"><span class="brand-mark">c</span><span>click<span class="brand-eat">eat</span><small>comida boa, sem complicação</small></span></a>
    <div class="side-label">MENU</div>
    <button class="side-link" [class.active]="view()==='home'" (click)="view.set('home')"><span>⌂</span> Início</button>
    <button class="side-link" [class.active]="view()==='orders'" (click)="view.set('orders')"><span>▤</span> Meus pedidos</button>
    <button class="side-link" [class.active]="view()==='coupons'" (click)="view.set('coupons')"><span>♧</span> Cupons <i class="side-new">2 novos</i></button>
    <button class="side-link" [class.active]="view()==='profile'" (click)="view.set('profile')"><span>◉</span> Meu perfil</button>
    <div class="sidebar-divider"></div>
    <div class="side-label">PARA VOCÊ</div>
    <div class="side-tip"><span class="tip-icon">✳</span><b>Seu próximo pedido<br>pode sair por nossa conta</b><p>Use seu cupom de boas-vindas e aproveite.</p><button (click)="view.set('coupons')">Ver meus cupons <span>→</span></button></div>
    <div class="side-bottom"><div class="avatar">M</div><div><b>Marina Costa</b><small>Cliente ClickEat</small></div><button class="dots" (click)="view.set('profile')">···</button></div>
  </aside>
  } @else {
    <app-workspace-sidebar [role]="workspaceRole()" [section]="workspaceSection()" [open]="sidebarOpen()" (sectionChange)="selectWorkspaceSection($event)" (switchToCustomer)="switchToCustomer()" />
  }
  <main class="main-area">
    <header class="topbar"><div class="location">@if(role()==='customer'){<span class="pin">⌖</span><div><small>ENTREGAR EM</small><b>Rua Harmonia, 321 <span class="chevron">⌄</span></b></div>}@else{<span class="pin">⌂</span><div><small>{{roleLabel().toUpperCase()}}</small><b>{{workspaceTitle()}}</b></div>}</div><div class="top-actions"><button class="role-switch" (click)="toggleRole()">{{roleLabel()}} <span>⌄</span></button><button class="theme-toggle" type="button" (click)="toggleTheme()" [attr.aria-label]="isDarkTheme()?'Ativar tema claro':'Ativar tema escuro'" [title]="isDarkTheme()?'Ativar tema claro':'Ativar tema escuro'"><span aria-hidden="true">{{isDarkTheme()?'☀':'☾'}}</span><span class="theme-toggle-label">{{isDarkTheme()?'Tema claro':'Tema escuro'}}</span></button><button class="help-btn" (click)="role()==='customer'?view.set('profile'):selectWorkspaceSection('settings')">◌ <span>Ajuda</span></button><button class="user-pill" (click)="role()==='customer'?view.set('profile'):selectWorkspaceSection('settings')"><span class="avatar mini">{{workspaceAvatar()}}</span><span>{{workspaceUser()}}</span><span class="chevron">⌄</span></button></div><button class="mobile-menu" (click)="sidebarOpen.set(!sidebarOpen())">☰</button></header>
    @if (role()==='admin') {
      <app-admin-dashboard [section]="workspaceSection()" />
    } @else if (role()==='store') {
      <app-store-dashboard [section]="workspaceSection()" />
    } @else if (role()==='courier') {
      <app-courier-dashboard [section]="workspaceSection()" />
    } @else if (view()==='tracking') {
      <app-order-tracking (back)="view.set('orders')" (contact)="notices.info('O contato com o entregador será conectado ao backend.')" />
    } @else if (view()==='checkout') {
      <app-checkout [items]="cart()" [appliedCouponCode]="appliedCouponCode()" (back)="view.set('home')" (confirmed)="completeOrder()" />
    } @else if (view()==='home' || view()==='storefront') {
      <app-customer-catalog [view]="view()" (navigate)="view.set($event)" (addToCart)="addMany($event)" (couponRequest)="view.set('coupons')" />
    } @else {
      <app-customer-account [view]="view()" [appliedCouponCode]="appliedCouponCode()" (couponApply)="applyCoupon($event)" (navigate)="view.set($event)" />
    }
    <footer class="footer">© 2026 ClickEat <span>Feito com cuidado e um pouquinho de fome.</span></footer>
  </main>
  <aside class="cart-panel"><div class="cart-heading"><div><div class="eyebrow">SEU PEDIDO</div><h2>Sacola <span>({{cart().length}})</span></h2></div><button class="cart-more">•••</button></div><div class="cart-items" [class.empty]="cart().length===0">@if(cart().length===0){<div class="empty-cart"><span>🛍️</span><h3>Comece pelo que<br>está com vontade.</h3><p>Seu próximo favorito está a alguns cliques daqui.</p></div>}@else{@for(item of cart();track $index){<div class="cart-item"><div class="cart-item-emoji"><img [src]="item.image" [alt]="item.name" (error)="useCartImageFallback($event)"></div><div class="cart-item-info"><b>{{item.name}}</b><small>{{item.desc}}</small><strong [class.sale-price]="item.originalPrice">R$ {{item.price.toFixed(2).replace('.',',')}}</strong>@if(item.originalPrice){<small class="cart-deal-note">−{{item.discountPercent}}% · De R$ {{item.originalPrice.toFixed(2).replace('.',',')}}</small>}</div><button class="remove" (click)="remove(item.name)">×</button></div>}}</div><div class="cart-recommend"><span>✳</span><div><b>Um docinho pra fechar?</b><small>Adicione uma sobremesa ao pedido</small></div><button (click)="add({name:'Doce carinho',desc:'Brownie com chocolate',price:12.9,image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=85',tag:'SUGESTÃO'})">＋</button></div>@if(appliedCouponCode()){<div class="cart-applied-coupon"><span>◇ {{appliedCouponCode()}}</span><button type="button" aria-label="Remover cupom" (click)="removeCoupon()">×</button></div>}<button class="cart-coupon" (click)="view.set('coupons')"><span>◇</span> {{appliedCouponCode()?'Alterar cupom':'Adicionar cupom'}} <b>＋</b></button><div class="cart-totals"><div><span>Subtotal</span><b>R$ {{subtotal().toFixed(2).replace('.',',')}}</b></div><div><span>Taxa de entrega</span><b>{{cart().length?'R$ 4,99':'—'}}</b></div>@if(couponDiscount()>0){<div class="discount-line"><span>Desconto do cupom</span><b>− R$ {{couponDiscount().toFixed(2).replace('.',',')}}</b></div>}<div class="grand-total"><span>Total</span><b>R$ {{total().toFixed(2).replace('.',',')}}</b></div></div><button class="checkout" (click)="checkout()" [disabled]="cart().length===0">Continuar para pagamento <span>→</span></button><div class="secure-note">♢ Pagamento seguro</div><div class="cart-divider"></div><div class="cart-help"><span>☏</span><div><b>Precisa de uma mão?</b><small>A gente te ajuda por aqui</small></div><button (click)="notices.info('Nosso suporte já vai falar com você!')">Ajuda →</button></div></aside>
</div>
@if(sidebarOpen()){<div class="mobile-overlay" (click)="sidebarOpen.set(false)"></div>}
<app-notification-toast />
` })
export class AppComponent {
 readonly notices = inject(NotificationService);
 readonly isDarkTheme = signal(this.readSavedTheme());
 readonly view = signal<'home'|'storefront'|'coupons'|'orders'|'auth'|'reviews'|'profile'|'checkout'|'tracking'>('home');
 readonly role = signal<'customer'|'admin'|'store'|'courier'>('customer');
 readonly workspaceRole = computed<WorkspaceRole>(() => {
   const currentRole = this.role();
   return currentRole === 'customer' ? 'admin' : currentRole;
 });
 readonly workspaceSection = signal<WorkspaceSection>('overview');
 readonly roleLabel = computed(() => ({ customer: 'Cliente', admin: 'Admin', store: 'Restaurante', courier: 'Entregador' }[this.role()]));
 workspaceTitle(): string { return ({ customer: 'Rua Harmonia, 321', admin: 'Operação ClickEat', store: 'Brasa & Ponto', courier: 'Central de entregas' })[this.role()]; }
 workspaceUser(): string { return ({ customer: 'Marina', admin: 'Equipe ClickEat', store: 'Brasa & Ponto', courier: 'Rafael' })[this.role()]; }
 workspaceAvatar(): string { return ({ customer: 'M', admin: 'A', store: 'B', courier: 'R' })[this.role()]; }
 readonly cart = signal<MenuItem[]>([]);
 readonly appliedCouponCode = signal('');
 readonly sidebarOpen = signal(false);
 readonly subtotal = computed(() => this.cart().reduce((total, item) => total + item.price, 0));
 readonly deliveryFee = computed(() => this.cart().length ? 4.99 : 0);
 readonly couponDiscount = computed(() => calculateCoupon(this.appliedCouponCode(), this.subtotal(), this.deliveryFee()).discount);
 readonly total = computed(() => Math.max(0, this.subtotal() + this.deliveryFee() - this.couponDiscount()));

 private readSavedTheme(): boolean {
   try { return localStorage.getItem('clickeat.theme') === 'dark'; } catch { return false; }
 }
 toggleTheme(): void {
   const nextTheme = !this.isDarkTheme();
   this.isDarkTheme.set(nextTheme);
   try { localStorage.setItem('clickeat.theme', nextTheme ? 'dark' : 'light'); } catch { /* Theme remains available for this session. */ }
 }

 add(item: MenuItem) { this.cart.update(items => [...items, item]); this.notices.success(`${item.name} entrou na sacola.`); }
 addMany(items: MenuItem[]) {
   if (!items.length) return;
   this.cart.update(cart => [...cart, ...items]);
   this.notices.success(items.length > 1 ? `${items.length} itens adicionados à sacola.` : `${items[0].name} entrou na sacola.`);
 }
 useCartImageFallback(event: Event) { (event.target as HTMLImageElement).src = '/images/food-fallback.svg'; }
 applyCoupon(code: string) {
   const result = calculateCoupon(code, this.subtotal(), this.deliveryFee());
   if (!result.valid || !result.code) { this.notices.warning(result.message); return; }
   this.appliedCouponCode.set(result.code);
   this.notices.success(result.message);
 }
 removeCoupon() { this.appliedCouponCode.set(''); this.notices.info('Cupom removido do pedido.'); }
 remove(name: string) {
   this.cart.update(items => { const index = items.findIndex(item => item.name === name); return index < 0 ? items : items.filter((_, itemIndex) => itemIndex !== index); });
   const couponNoLongerValid = this.appliedCouponCode() && !calculateCoupon(this.appliedCouponCode(), this.subtotal(), this.deliveryFee()).valid;
   if (couponNoLongerValid) {
     this.appliedCouponCode.set('');
     this.notices.warning(`${name} removido. O cupom saiu porque o pedido não atende mais às condições.`);
     return;
   }
   this.notices.info(`${name} removido da sacola.`);
 }
 toggleRole() {
   const roles: Array<'customer'|'store'|'courier'|'admin'> = ['customer', 'store', 'courier', 'admin'];
   this.role.set(roles[(roles.indexOf(this.role()) + 1) % roles.length]);
   this.workspaceSection.set('overview');
   this.view.set('home');
 }
 selectWorkspaceSection(section: WorkspaceSection) { this.workspaceSection.set(section); this.sidebarOpen.set(false); }
 switchToCustomer() { this.role.set('customer'); this.workspaceSection.set('overview'); this.view.set('home'); this.sidebarOpen.set(false); }
 checkout() { if (this.cart().length) this.view.set('checkout'); }
 completeOrder() { this.cart.set([]); this.appliedCouponCode.set(''); this.view.set('orders'); this.notices.success('Pedido confirmado! Você pode acompanhar tudo em Meus pedidos.'); }
}
