import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-customer-account',
  standalone: true,
  template: `
    @if (view === 'coupons') {
      <section class="content"><div class="eyebrow">UM MIMO PRA VOCÊ</div><h1>Seus <span>cupons.</span></h1><p class="subheading">Um empurrãozinho para deixar a refeição ainda melhor.</p>@if(appliedCouponCode){<div class="applied-coupon-banner">✓ Cupom {{ appliedCouponCode }} aplicado ao seu pedido.</div>}<div class="coupon-input"><input aria-label="Código do cupom" placeholder="Digite seu código promocional" [value]="couponCode()" (input)="couponCode.set($any($event.target).value)"><button (click)="applyCoupon()">Aplicar cupom</button></div><div class="coupon-grid"><article class="coupon-card featured-coupon"><span class="coupon-icon">✳</span><div><small>PRIMEIRA COMPRA</small><h2>R$ 15 <span>OFF</span></h2><p>na sua primeira compra acima de R$ 35</p><button (click)="applyCouponCode('PRIMEIRACOMPRA')">Aplicar cupom <b>PRIMEIRACOMPRA</b></button></div><i class="coupon-spark">✳</i></article><article class="coupon-card"><span class="coupon-icon orange">⌁</span><div><small>FRETE GRÁTIS</small><h2>Entrega <span>por nossa conta</span></h2><p>em restaurantes selecionados perto de você</p><button (click)="applyCouponCode('FRETEGRATIS')">Aplicar cupom <b>FRETEGRATIS</b></button></div></article><article class="coupon-card"><span class="coupon-icon yellow">☼</span><div><small>ALMOÇO FELIZ</small><h2>R$ 10 <span>OFF</span></h2><p>pedidos acima de R$ 50</p><button (click)="applyCouponCode('ALMOCO10')">Aplicar cupom <b>ALMOCO10</b></button></div></article></div></section>
    } @else if (view === 'orders') {
      <section class="content"><div class="eyebrow">SUA JORNADA DE SABORES</div><h1>Meus <span>pedidos.</span></h1><p class="subheading">Tudo que já chegou — e tudo que ainda está a caminho.</p><div class="order-tabs"><button class="active">Todos <span>4</span></button><button>Em andamento <span>1</span></button><button>Concluídos <span>3</span></button></div><div class="purchase-list"><article class="purchase-card"><div class="purchase-head"><span class="store-icon burg">🍔</span><div><b>Brasa & Ponto</b><small>Hoje, 12:32 · Pedido #CE-8425</small></div><i class="status preparing">A caminho · 8 min</i></div><div class="purchase-items">1× Burger da casa · 1× Fritas crocantes · 1× Coca-Cola</div><div class="purchase-foot"><b>Total <strong>R$ 58,90</strong></b><button class="soft-btn" (click)="navigate.emit('tracking')">Rastrear entrega <span aria-hidden="true">→</span></button></div></article><article class="purchase-card"><div class="purchase-head"><span class="store-icon pizza">🍕</span><div><b>Forno da Vila</b><small>Ontem, 20:15 · Pedido #CE-8390</small></div><i class="status delivered">Entregue</i></div><div class="purchase-items">1× Margherita grande · 1× Fanta Laranja</div><div class="purchase-foot"><b>Total <strong>R$ 76,50</strong></b><button class="soft-btn" (click)="navigate.emit('reviews')">Avaliar pedido ★</button></div></article></div></section>
    } @else if (view === 'auth') {
      <section class="content auth-page"><div class="auth-brand"><span class="brand-mark">c</span><b>click<span>eat</span></b></div><div class="eyebrow">{{authMode()==='login'?'BOM TER VOCÊ AQUI':'RECUPERE SEU ACESSO'}}</div><h1>{{authMode()==='login'?'Entre na sua conta.':'Vamos recuperar sua conta.'}}</h1><p class="subheading">{{authMode()==='login'?'Seu próximo prato favorito está te esperando.':'Informe seu e-mail e enviaremos instruções para redefinir sua senha.'}}</p>@if(authMode()==='login'){<button class="google-login" (click)="notifications.info('O login Google será habilitado com a configuração OAuth do backend.')"><svg class="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 35 16l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9Z"/><path fill="#34A853" d="M24 44c5.5 0 10.5-2 14.3-5.3L31.7 33a12 12 0 0 1-18.2-4.5l-7.9 6.1A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12 24c0-1.6.3-3.1.9-4.5L5 13.4A20 20 0 0 0 4 24c0 3.7 1 7.2 2.6 10.2l7.9-6.1c-.5-1.3-.8-2.7-.8-4.1Z"/><path fill="#EA4335" d="M24 12c3.1 0 5.8 1.2 8 3.1l6-6C34.3 5.3 29.5 4 24 4 15.2 4 7.7 8.8 5 15l7.9 6C14.7 15.8 19 12 24 12Z"/></svg> Continuar com Google</button><div class="auth-divider"><span>ou entre com seu e-mail</span></div><label class="auth-label">E-mail<input type="email" placeholder="voce@email.com"></label><label class="auth-label">Senha<input type="password" placeholder="Sua senha"><button class="forgot-link" (click)="authMode.set('recover')">Esqueceu a senha?</button></label><button class="primary-btn auth-submit" (click)="notifications.info('Autenticação será conectada ao backend.')">Entrar na conta</button><p class="auth-switch">Ainda não tem conta? <button (click)="authMode.set('signup')">Criar conta</button></p>}@else if(authMode()==='recover'){<label class="auth-label">E-mail cadastrado<input type="email" placeholder="voce@email.com"></label><button class="primary-btn auth-submit" (click)="notifications.info('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.')">Enviar instruções</button><p class="auth-switch"><button (click)="authMode.set('login')">← Voltar para entrar</button></p>}@else{<button class="google-login" (click)="notifications.info('O cadastro Google será habilitado com OAuth.')"><svg class="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 35 16l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9Z"/><path fill="#34A853" d="M24 44c5.5 0 10.5-2 14.3-5.3L31.7 33a12 12 0 0 1-18.2-4.5l-7.9 6.1A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12 24c0-1.6.3-3.1.9-4.5L5 13.4A20 20 0 0 0 4 24c0 3.7 1 7.2 2.6 10.2l7.9-6.1c-.5-1.3-.8-2.7-.8-4.1Z"/><path fill="#EA4335" d="M24 12c3.1 0 5.8 1.2 8 3.1l6-6C34.3 5.3 29.5 4 24 4 15.2 4 7.7 8.8 5 15l7.9 6C14.7 15.8 19 12 24 12Z"/></svg> Cadastrar com Google</button><div class="auth-divider"><span>ou crie sua conta</span></div><label class="auth-label">Nome completo<input placeholder="Seu nome"></label><label class="auth-label">E-mail<input type="email" placeholder="voce@email.com"></label><label class="auth-label">Senha<input type="password" placeholder="Crie uma senha"></label><button class="primary-btn auth-submit" (click)="notifications.info('Cadastro será conectado ao backend.')">Criar conta</button><p class="auth-switch">Já tem uma conta? <button (click)="authMode.set('login')">Entrar</button></p>}</section>
    } @else if (view === 'reviews') {
      <section class="content"><div class="eyebrow">SUA OPINIÃO FAZ DIFERENÇA</div><h1>Avalie seu <span>pedido.</span></h1><p class="subheading">Ajude outras pessoas a encontrarem seus próximos favoritos.</p><article class="panel review-panel"><span class="store-icon pizza">🍕</span><h2>Como foi seu pedido no Forno da Vila?</h2><p>Pedido #CE-8390 · Ontem, 20:15</p><div class="stars">@for (star of [1,2,3,4,5]; track star) {<button [attr.aria-label]="star + ' de 5 estrelas'" [attr.aria-pressed]="star===rating()" (click)="rating.set(star)" [class.lit]="star<=rating()">★</button>}</div><textarea aria-label="Comentário da avaliação" placeholder="Conte um pouco mais sobre sua experiência..." [value]="reviewText()" (input)="reviewText.set($any($event.target).value)"></textarea><button class="primary-btn" (click)="submitReview()">Enviar avaliação</button></article></section>
    } @else {
      <section class="content profile-page"><div class="eyebrow">DO JEITO QUE VOCÊ GOSTA</div><h1>Seu <span>perfil.</span></h1><p class="subheading">Suas informações e preferências em um só lugar.</p><div class="profile-overview"><article class="profile-identity"><div class="profile-avatar">{{profile().name.charAt(0) || 'M'}}</div><div><small>CLIENTE DESDE 2025</small><h2>{{profile().name || 'Marina Costa'}}</h2><p>{{profile().email}}</p></div><span class="profile-status"><i></i> Conta ativa</span></article><div class="profile-highlights"><article><span>▤</span><div><b>12</b><small>pedidos realizados</small></div></article><article><span>♡</span><div><b>{{favoriteCount()}}</b><small>restaurantes favoritos</small></div></article></div></div><article class="panel profile-card"><div class="profile-section-heading"><div><small>INFORMAÇÕES PESSOAIS</small><h2>Seus dados</h2><p>Mantenha seus dados atualizados para facilitar seus pedidos.</p></div><span class="profile-edit-icon" aria-hidden="true">✎</span></div><div class="profile-fields"><label>Nome completo<input autocomplete="name" [value]="profile().name" (input)="updateProfile('name',$any($event.target).value)"></label><label>E-mail<input type="email" autocomplete="email" [value]="profile().email" (input)="updateProfile('email',$any($event.target).value)"></label><label>Celular<input autocomplete="tel" [value]="profile().phone" (input)="updateProfile('phone',$any($event.target).value)"></label><label>Endereço principal<input autocomplete="street-address" [value]="profile().address" (input)="updateProfile('address',$any($event.target).value)"></label><button class="primary-btn" (click)="saveProfile()">Salvar alterações <span aria-hidden="true">→</span></button></div></article><article class="profile-security"><span class="security-icon">⌑</span><div><b>Login e segurança</b><small>Gerencie sua senha e as formas de acessar sua conta.</small></div><button class="google-btn" (click)="navigate.emit('auth')">Gerenciar acesso <span aria-hidden="true">→</span></button></article></section>
    }
  `,
  styleUrl: './customer-account.component.css',
})
export class CustomerAccountComponent {
  @Input({ required: true }) view = '';
  @Output() navigate = new EventEmitter<'auth'|'reviews'|'tracking'>();
  @Output() couponApply = new EventEmitter<string>();
  @Input() appliedCouponCode = '';
  readonly notifications = inject(NotificationService);
  readonly couponCode = signal('');
  readonly authMode = signal<'login'|'recover'|'signup'>('login');
  readonly rating = signal(0);
  readonly reviewText = signal('');
  readonly profile = signal(this.loadProfile());
  readonly favoriteCount = signal(this.readFavoriteCount());

  private loadProfile(): { name: string; email: string; phone: string; address: string } {
    const defaults = { name: 'Marina Costa', email: 'marina.costa@email.com', phone: '(11) 99999-1234', address: 'Rua Harmonia, 321 · Vila Madalena, São Paulo' };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('clickeat.customer-profile') ?? '{}') }; } catch { return defaults; }
  }

  private readFavoriteCount(): number {
    try { const favorites: unknown = JSON.parse(localStorage.getItem('clickeat.favorites') ?? '[]'); return Array.isArray(favorites) ? favorites.length : 0; } catch { return 0; }
  }

  updateProfile(field: 'name'|'email'|'phone'|'address', value: string): void { this.profile.update(current => ({ ...current, [field]: value })); }
  saveProfile(): void {
    const data = this.profile();
    if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { this.notifications.warning('Informe seu nome e um e-mail válido.'); return; }
    try { localStorage.setItem('clickeat.customer-profile', JSON.stringify(data)); } catch { /* Keep the profile in memory for this session. */ }
    this.favoriteCount.set(this.readFavoriteCount());
    this.notifications.success('Perfil atualizado neste navegador.');
  }

  applyCoupon(): void {
    this.applyCouponCode(this.couponCode());
  }

  applyCouponCode(code: string): void { this.couponCode.set(code); this.couponApply.emit(code); }

  submitReview(): void {
    if (!this.rating()) {
      this.notifications.warning('Escolha uma nota antes de enviar a avaliação.');
      return;
    }
    this.notifications.success('Avaliação enviada. Obrigado!');
  }
}

