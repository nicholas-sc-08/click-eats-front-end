import { Component, computed, inject, signal } from '@angular/core';
import { NotificationService } from './core/notifications/notification.service';
import { MenuItem } from './models/catalog.models';
import { CustomerCatalogComponent } from './features/customer/catalog/customer-catalog.component';
import { CustomerAccountComponent } from './features/customer/customer-account.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { CourierDashboardComponent } from './features/courier/courier-dashboard.component';
import { StoreDashboardComponent } from './features/store/store-dashboard.component';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@Component({ selector: 'app-root', standalone: true, imports: [AdminDashboardComponent, CourierDashboardComponent, CustomerAccountComponent, CustomerCatalogComponent, NotificationToastComponent, StoreDashboardComponent], template: `
<div class="app-shell">
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
  <main class="main-area">
    <header class="topbar"><div class="location"><span class="pin">⌖</span><div><small>ENTREGAR EM</small><b>Rua Harmonia, 321 <span class="chevron">⌄</span></b></div></div><div class="top-actions"><button class="role-switch" (click)="toggleRole()">{{roleLabel()}} <span>⌄</span></button><button class="help-btn" (click)="view.set('profile')">◌ <span>Ajuda</span></button><button class="user-pill" (click)="view.set('profile')"><span class="avatar mini">M</span><span>Marina</span><span class="chevron">⌄</span></button></div><button class="mobile-menu" (click)="sidebarOpen.set(!sidebarOpen())">☰</button></header>
    @if (role()==='admin') {
      <app-admin-dashboard />
    } @else if (role()==='store') {
      <app-store-dashboard />
    } @else if (role()==='courier') {
      <app-courier-dashboard />
    } @else if (view()==='home' || view()==='storefront') {
      <app-customer-catalog [view]="view()" (navigate)="view.set($event)" (addToCart)="add($event)" (couponRequest)="view.set('coupons')" />
    } @else {
      <app-customer-account [view]="view()" (navigate)="view.set($event)" />
    }
    <footer class="footer">© 2026 ClickEat <span>Feito com cuidado e um pouquinho de fome.</span></footer>
  </main>
  <aside class="cart-panel"><div class="cart-heading"><div><div class="eyebrow">SEU PEDIDO</div><h2>Sacola <span>({{cart().length}})</span></h2></div><button class="cart-more">•••</button></div>@if(cart().length===0){<div class="empty-cart"><span>🛍️</span><h3>Comece pelo que<br>está com vontade.</h3><p>Seu próximo favorito está a alguns cliques daqui.</p></div>}@else{@for(item of cart();track $index){<div class="cart-item"><div class="cart-item-emoji"><img [src]="item.image" [alt]="item.name"></div><div class="cart-item-info"><b>{{item.name}}</b><small>{{item.desc}}</small><strong>R$ {{item.price.toFixed(2).replace('.',',')}}</strong></div><button class="remove" (click)="remove(item.name)">×</button></div>}}<div class="cart-recommend"><span>✳</span><div><b>Um docinho pra fechar?</b><small>Adicione uma sobremesa ao pedido</small></div><button (click)="add({name:'Doce carinho',desc:'Brownie com chocolate',price:12.9,image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=85',tag:'SUGESTÃO'})">＋</button></div><button class="cart-coupon" (click)="view.set('coupons')"><span>◇</span> Adicionar cupom <b>＋</b></button><div class="cart-totals"><div><span>Subtotal</span><b>R$ {{subtotal().toFixed(2).replace('.',',')}}</b></div><div><span>Taxa de entrega</span><b>{{cart().length?'R$ 4,99':'—'}}</b></div><div class="grand-total"><span>Total</span><b>R$ {{(subtotal()+(cart().length?4.99:0)).toFixed(2).replace('.',',')}}</b></div></div><button class="checkout" (click)="checkout()" [disabled]="cart().length===0">Continuar para pagamento <span>→</span></button><div class="secure-note">♢ Pagamento seguro</div><div class="cart-divider"></div><div class="cart-help"><span>☏</span><div><b>Precisa de uma mão?</b><small>A gente te ajuda por aqui</small></div><button (click)="notices.info('Nosso suporte já vai falar com você!')">Ajuda →</button></div></aside>
</div>
@if(sidebarOpen()){<div class="mobile-overlay" (click)="sidebarOpen.set(false)"></div>}
<app-notification-toast />
` })
export class AppComponent {
 readonly notices = inject(NotificationService);
 readonly view = signal<'home'|'storefront'|'coupons'|'orders'|'auth'|'reviews'|'profile'>('home');
 readonly role = signal<'customer'|'admin'|'store'|'courier'>('customer');
 readonly roleLabel = computed(() => ({ customer: 'Cliente', admin: 'Admin', store: 'Restaurante', courier: 'Entregador' }[this.role()]));
 readonly cart = signal<MenuItem[]>([]);
 readonly sidebarOpen = signal(false);
 readonly subtotal = computed(() => this.cart().reduce((total, item) => total + item.price, 0));

 add(item: MenuItem) { this.cart.update(items => [...items, item]); this.notices.success(`${item.name} entrou na sacola.`); }
 remove(name: string) {
   this.cart.update(items => { const index = items.findIndex(item => item.name === name); return index < 0 ? items : items.filter((_, itemIndex) => itemIndex !== index); });
   this.notices.info(`${name} removido da sacola.`);
 }
 toggleRole() {
   const roles: Array<'customer'|'store'|'courier'|'admin'> = ['customer', 'store', 'courier', 'admin'];
   this.role.set(roles[(roles.indexOf(this.role()) + 1) % roles.length]);
   this.view.set('home');
 }
 checkout() { if (this.cart().length) this.notices.info('Pedido pronto! A etapa de pagamento será conectada ao backend.'); }
}
