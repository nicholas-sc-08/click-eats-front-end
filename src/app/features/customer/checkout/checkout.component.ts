import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MenuItem } from '../../../models/catalog.models';
import { calculateCoupon } from '../coupons/coupon';

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
          @if(payment()==='pix'){<div class="pix-panel"><div class="pix-title"><span>◇</span><div><b>Pix demonstrativo</b><small>Este código é apenas para visualizar o fluxo.</small></div></div><code>{{pixCode()}}</code><button type="button" class="copy-pix" (click)="copyPixCode()">{{pixCopied()?'Código copiado ✓':'Copiar código Pix'}}</button></div>}
          @if(payment()==='card'){<div class="card-form"><label>Nome impresso no cartão<input autocomplete="cc-name" placeholder="Como aparece no cartão" [value]="cardHolder()" (input)="cardHolder.set($any($event.target).value)"></label><label>Número do cartão<input autocomplete="cc-number" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" [value]="cardNumber()" (input)="formatCardNumber($any($event.target).value)"></label><div class="card-fields"><label>Validade<input autocomplete="cc-exp" inputmode="numeric" maxlength="5" placeholder="MM/AA" [value]="cardExpiry()" (input)="formatExpiry($any($event.target).value)"></label><label>CVV<input autocomplete="cc-csc" inputmode="numeric" maxlength="4" placeholder="123" [value]="cardCvv()" (input)="cardCvv.set(digits($any($event.target).value).slice(0,4))"></label></div><small class="card-demo-note">Dados de demonstração: não são enviados nem armazenados.</small></div>}
          @if(paymentError()){<p class="payment-error" role="alert">{{paymentError()}}</p>}
        </section>
      </div><aside class="checkout-summary"><h2>Resumo do pedido</h2><div class="checkout-items">@for(item of items; track $index){<div class="checkout-item"><span class="item-quantity">1</span><div><b>{{ item.name }}</b><small>{{ item.desc }}</small></div><strong>R$ {{ item.price.toFixed(2).replace('.', ',') }}</strong></div>}</div><div class="summary-line"><span>Subtotal</span><b>R$ {{ subtotal().toFixed(2).replace('.', ',') }}</b></div><div class="summary-line"><span>Entrega</span><b>R$ {{ deliveryFee().toFixed(2).replace('.', ',') }}</b></div>@if(discount()>0){<div class="summary-line discount-summary"><span>{{appliedCouponCode}} aplicado</span><b>− R$ {{discount().toFixed(2).replace('.', ',')}}</b></div>}<div class="summary-line grand-total"><span>Total</span><b>R$ {{ total().toFixed(2).replace('.', ',') }}</b></div><button class="confirm-order" type="button" (click)="confirmPayment()">{{payment()==='pix'?'Simular pedido Pix':payment()==='card'?'Simular pagamento':'Confirmar pedido'}} <span>→</span></button><small class="demo-note">Protótipo visual · nenhum pagamento será realizado</small></aside></div>
    </section>
  `,
styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  @Input({ required: true }) items: MenuItem[] = [];
  @Input() appliedCouponCode = '';
  @Output() back = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  readonly payment = signal('pix');
  readonly paymentOptions = [{ id: 'pix', icon: '◇', label: 'Pix', detail: 'Código Pix demonstrativo' }, { id: 'card', icon: '▤', label: 'Cartão de crédito', detail: 'Preencha os dados do cartão' }, { id: 'cash', icon: '＄', label: 'Dinheiro', detail: 'Pague na entrega' }];
  readonly cardHolder = signal('');
  readonly cardNumber = signal('');
  readonly cardExpiry = signal('');
  readonly cardCvv = signal('');
  readonly paymentError = signal('');
  readonly pixCopied = signal(false);
  readonly pixCode = signal(this.generatePixCode());
  subtotal(): number { return this.items.reduce((sum, item) => sum + item.price, 0); }
  deliveryFee(): number { return this.items.length ? 4.99 : 0; }
  discount(): number { return calculateCoupon(this.appliedCouponCode, this.subtotal(), this.deliveryFee()).discount; }
  total(): number { return Math.max(0, this.subtotal() + this.deliveryFee() - this.discount()); }

  digits(value: string): string { return value.replace(/\D/g, ''); }
  formatCardNumber(value: string): void { this.cardNumber.set(this.digits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')); }
  formatExpiry(value: string): void { const digits = this.digits(value).slice(0, 4); this.cardExpiry.set(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); }
  async copyPixCode(): Promise<void> {
    try { await navigator.clipboard.writeText(this.pixCode()); this.pixCopied.set(true); }
    catch { this.paymentError.set('Não foi possível copiar automaticamente. Selecione e copie o código acima.'); }
  }
  confirmPayment(): void {
    if (this.payment() === 'card') {
      const number = this.digits(this.cardNumber());
      if (this.cardHolder().trim().length < 3 || number.length < 16 || !/^\d{2}\/\d{2}$/.test(this.cardExpiry()) || this.digits(this.cardCvv()).length < 3) {
        this.paymentError.set('Confira o nome, número, validade e CVV do cartão.');
        return;
      }
    }
    this.paymentError.set('');
    this.confirmed.emit();
  }
  private generatePixCode(): string { return `CE-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`; }
}
