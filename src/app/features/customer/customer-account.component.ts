import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-customer-account',
  standalone: true,
  template: `
    @if (view === 'coupons') {
      <section class="content"><div class="eyebrow">UM MIMO PRA VOCÊ</div><h1>Seus <span>cupons.</span></h1><p class="subheading">Um empurrãozinho para deixar a refeição ainda melhor.</p>@if(appliedCouponCode){<div class="applied-coupon-banner">✓ Cupom {{ appliedCouponCode }} aplicado ao seu pedido.</div>}<div class="coupon-input"><input aria-label="Código do cupom" placeholder="Digite seu código promocional" [value]="couponCode()" (input)="couponCode.set($any($event.target).value)"><button (click)="applyCoupon()">Aplicar cupom</button></div><div class="coupon-grid"><article class="coupon-card featured-coupon"><span class="coupon-icon">✳</span><div><small>PRIMEIRA COMPRA</small><h2>R$ 15 <span>OFF</span></h2><p>na sua primeira compra acima de R$ 35</p><button (click)="applyCouponCode('PRIMEIRACOMPRA')">Aplicar cupom <b>PRIMEIRACOMPRA</b></button></div><i class="coupon-spark">✳</i></article><article class="coupon-card"><span class="coupon-icon orange">⌁</span><div><small>FRETE GRÁTIS</small><h2>Entrega <span>por nossa conta</span></h2><p>em restaurantes selecionados perto de você</p><button (click)="applyCouponCode('FRETEGRATIS')">Aplicar cupom <b>FRETEGRATIS</b></button></div></article><article class="coupon-card"><span class="coupon-icon yellow">☼</span><div><small>ALMOÇO FELIZ</small><h2>R$ 10 <span>OFF</span></h2><p>pedidos acima de R$ 50</p><button (click)="applyCouponCode('ALMOCO10')">Aplicar cupom <b>ALMOCO10</b></button></div></article></div></section>
    } @else if (view === 'orders') {
      <section class="content"><div class="eyebrow">SUA JORNADA DE SABORES</div><h1>Meus <span>pedidos.</span></h1><p class="subheading">Tudo que já chegou — e tudo que ainda está a caminho.</p><div class="order-tabs"><button class="active">Todos <span>4</span></button><button>Em andamento <span>1</span></button><button>Concluídos <span>3</span></button></div><div class="purchase-list"><article class="purchase-card"><div class="purchase-head"><span class="store-icon burg">🍔</span><div><b>Brasa & Ponto</b><small>Hoje, 12:32 · Pedido #CE-8425</small></div><i class="status preparing">A caminho · 8 min</i></div><div class="purchase-items">1× Burger da casa · 1× Fritas crocantes · 1× Coca-Cola</div><div class="purchase-foot"><b>Total <strong>R$ 58,90</strong></b><button class="soft-btn">Acompanhar pedido →</button></div></article><article class="purchase-card"><div class="purchase-head"><span class="store-icon pizza">🍕</span><div><b>Forno da Vila</b><small>Ontem, 20:15 · Pedido #CE-8390</small></div><i class="status delivered">Entregue</i></div><div class="purchase-items">1× Margherita grande · 1× Fanta Laranja</div><div class="purchase-foot"><b>Total <strong>R$ 76,50</strong></b><button class="soft-btn" (click)="navigate.emit('reviews')">Avaliar pedido ★</button></div></article></div></section>
    } @else if (view === 'auth') {
      <section class="content auth-page"><div class="auth-brand"><span class="brand-mark">c</span><b>click<span>eat</span></b></div><div class="eyebrow">{{authMode()==='login'?'BOM TER VOCÊ AQUI':'RECUPERE SEU ACESSO'}}</div><h1>{{authMode()==='login'?'Entre na sua conta.':'Vamos recuperar sua conta.'}}</h1><p class="subheading">{{authMode()==='login'?'Seu próximo prato favorito está te esperando.':'Informe seu e-mail e enviaremos instruções para redefinir sua senha.'}}</p>@if(authMode()==='login'){<button class="google-login" (click)="notifications.info('O login Google será habilitado com a configuração OAuth do backend.')"><b>G</b> Continuar com Google</button><div class="auth-divider"><span>ou entre com seu e-mail</span></div><label class="auth-label">E-mail<input type="email" placeholder="voce@email.com"></label><label class="auth-label">Senha<input type="password" placeholder="Sua senha"><button class="forgot-link" (click)="authMode.set('recover')">Esqueceu a senha?</button></label><button class="primary-btn auth-submit" (click)="notifications.info('Autenticação será conectada ao backend.')">Entrar na conta</button><p class="auth-switch">Ainda não tem conta? <button (click)="authMode.set('signup')">Criar conta</button></p>}@else if(authMode()==='recover'){<label class="auth-label">E-mail cadastrado<input type="email" placeholder="voce@email.com"></label><button class="primary-btn auth-submit" (click)="notifications.info('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.')">Enviar instruções</button><p class="auth-switch"><button (click)="authMode.set('login')">← Voltar para entrar</button></p>}@else{<button class="google-login" (click)="notifications.info('O cadastro Google será habilitado com OAuth.')"><b>G</b> Cadastrar com Google</button><div class="auth-divider"><span>ou crie sua conta</span></div><label class="auth-label">Nome completo<input placeholder="Seu nome"></label><label class="auth-label">E-mail<input type="email" placeholder="voce@email.com"></label><label class="auth-label">Senha<input type="password" placeholder="Crie uma senha"></label><button class="primary-btn auth-submit" (click)="notifications.info('Cadastro será conectado ao backend.')">Criar conta</button><p class="auth-switch">Já tem uma conta? <button (click)="authMode.set('login')">Entrar</button></p>}</section>
    } @else if (view === 'reviews') {
      <section class="content"><div class="eyebrow">SUA OPINIÃO FAZ DIFERENÇA</div><h1>Avalie seu <span>pedido.</span></h1><p class="subheading">Ajude outras pessoas a encontrarem seus próximos favoritos.</p><article class="panel review-panel"><span class="store-icon pizza">🍕</span><h2>Como foi seu pedido no Forno da Vila?</h2><p>Pedido #CE-8390 · Ontem, 20:15</p><div class="stars">@for (star of [1,2,3,4,5]; track star) {<button [attr.aria-label]="star + ' de 5 estrelas'" [attr.aria-pressed]="star===rating()" (click)="rating.set(star)" [class.lit]="star<=rating()">★</button>}</div><textarea aria-label="Comentário da avaliação" placeholder="Conte um pouco mais sobre sua experiência..." [value]="reviewText()" (input)="reviewText.set($any($event.target).value)"></textarea><button class="primary-btn" (click)="submitReview()">Enviar avaliação</button></article></section>
    } @else {
      <section class="content"><div class="eyebrow">DO JEITO QUE VOCÊ GOSTA</div><h1>Seu <span>perfil.</span></h1><p class="subheading">Suas informações e preferências em um só lugar.</p><article class="panel profile-card"><div class="profile-avatar">M</div><div class="profile-fields"><label>Nome completo<input value="Marina Costa"></label><label>E-mail<input value="marina.costa@email.com"></label><label>Celular<input value="(11) 99999-1234"></label><label>Endereço principal<input value="Rua Harmonia, 321 · Vila Madalena, São Paulo"></label><button class="primary-btn" (click)="notifications.success('Perfil atualizado!')">Salvar alterações</button></div></article><button class="google-btn" (click)="navigate.emit('auth')"><span>G</span> Login e segurança</button></section>
    }
  `,
  styleUrl: './customer-account.component.css',
})
export class CustomerAccountComponent {
  @Input({ required: true }) view = '';
  @Output() navigate = new EventEmitter<'auth'|'reviews'>();
  @Output() couponApply = new EventEmitter<string>();
  @Input() appliedCouponCode = '';
  readonly notifications = inject(NotificationService);
  readonly couponCode = signal('');
  readonly authMode = signal<'login'|'recover'|'signup'>('login');
  readonly rating = signal(0);
  readonly reviewText = signal('');

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

