import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { MenuItem } from '../../../models/catalog.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `
    <section class="checkout-page">
      <button class="checkout-back" type="button" (click)="back.emit()">← <span>Voltar ao cardápio</span></button>
      <div class="checkout-heading"><div><div class="eyebrow">SÓ MAIS UM PASSO</div><h1>Fechar pedido</h1><p>Confira os detalhes antes de confirmar.</p></div><span class="safe-pill">♢ Compra segura</span></div>
      <div class="checkout-grid"><div class="checkout-sections">
        <section class="checkout-card"><div class="checkout-card-title"><span class="step-number">1</span><div><h2>Endereço de entrega</h2><p>Onde vamos deixar seu pedido?</p></div></div><label class="address-option"><input type="radio" checked name="address"><span><b>Casa</b><small>Rua Harmonia, 321 · Pinheiros, São Paulo</small></span><span class="change-link">Alterar</span></label></section>
        <section class="checkout-card"><div class="checkout-card-title"><span class="step-number">2</span><div><h2>Forma de pagamento</h2><p>Escolha como quer pagar.</p></div></div>
          <div class="payment-options">@for(option of paymentOptions; track option.id){<button type="button" class="payment-option" [class.selected]="payment()===option.id" [attr.aria-pressed]="payment()===option.id" (click)="payment.set(option.id)"><span class="payment-icon">{{ option.icon }}</span><span><b>{{ option.label }}</b><small>{{ option.detail }}</small></span><span class="radio-dot"></span></button>}</div>
        </section>
      </div><aside class="checkout-summary"><h2>Resumo do pedido</h2><div class="checkout-items">@for(item of items; track $index){<div class="checkout-item"><span class="item-quantity">1</span><div><b>{{ item.name }}</b><small>{{ item.desc }}</small></div><strong>R$ {{ item.price.toFixed(2).replace('.', ',') }}</strong></div>}</div><div class="summary-line"><span>Subtotal</span><b>R$ {{ subtotal().toFixed(2).replace('.', ',') }}</b></div><div class="summary-line"><span>Entrega</span><b>R$ 4,99</b></div><div class="summary-line grand-total"><span>Total</span><b>R$ {{ total().toFixed(2).replace('.', ',') }}</b></div><button class="confirm-order" type="button" (click)="confirmed.emit()">Confirmar pedido <span>→</span></button><small class="demo-note">Demonstração visual · pagamento ainda não conectado</small></aside></div>
    </section>
  `,
styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  @Input({ required: true }) items: MenuItem[] = [];
  @Output() back = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  readonly payment = signal('pix');
  readonly paymentOptions = [{ id: 'pix', icon: '◇', label: 'Pix', detail: 'Aprovação na hora' }, { id: 'card', icon: '▤', label: 'Cartão de crédito', detail: '••••  ••••  ••••  4821' }, { id: 'cash', icon: '＄', label: 'Dinheiro', detail: 'Pague na entrega' }];
  readonly subtotal = computed(() => this.items.reduce((sum, item) => sum + item.price, 0));
  readonly total = computed(() => this.subtotal() + 4.99);
}
