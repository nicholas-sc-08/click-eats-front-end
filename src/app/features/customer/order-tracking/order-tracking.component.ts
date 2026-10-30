import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  template: `
    <section class="tracking-page">
      <button class="tracking-back" type="button" (click)="back.emit()">← <span>Voltar para meus pedidos</span></button>
      <header class="tracking-heading"><div><div class="eyebrow">PEDIDO #CE-8425</div><h1>Seu pedido está <span>a caminho.</span></h1><p>O motoboy está levando seus favoritos até você.</p></div><span class="tracking-live"><i></i> Ao vivo · demonstração</span></header>
      <div class="tracking-layout"><div class="tracking-map" role="img" aria-label="Mapa demonstrativo com o trajeto do restaurante até o endereço de entrega">
        <div class="map-block block-one"></div><div class="map-block block-two"></div><div class="map-block block-three"></div><div class="map-block block-four"></div>
        <span class="street-label street-one">R. Harmonia</span><span class="street-label street-two">R. Girassol</span><span class="street-label street-three">Av. Faria Lima</span>
        <svg class="route-map" viewBox="0 0 900 520" preserveAspectRatio="none" aria-hidden="true">
          <path class="route-shadow" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          <path class="route-base" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          <path class="route-progress" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          <g class="courier-marker"><circle r="23"/><text y="7" text-anchor="middle">🏍️</text><animateMotion dur="12s" repeatCount="indefinite" path="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/></g>
        </svg>
        <div class="map-stop restaurant-stop"><span>🍔</span><small>Brasa & Ponto</small></div><div class="map-stop home-stop"><span>⌂</span><small>Você</small></div>
        <div class="map-attribution">Mapa ilustrativo · posição simulada</div>
      </div><aside class="tracking-details"><div class="eta-card"><span class="eta-icon">◷</span><div><small>PREVISÃO DE CHEGADA</small><b>8 <span>min</span></b><p>O entregador está pertinho.</p></div></div>
        <div class="tracking-steps"><div class="tracking-step done"><span class="step-icon">✓</span><div><b>Pedido confirmado</b><small>12:32 · Restaurante recebeu seu pedido</small></div></div><div class="tracking-step done"><span class="step-icon">✓</span><div><b>Pedido preparado</b><small>O restaurante finalizou o preparo</small></div></div><div class="tracking-step current"><span class="step-icon">🏍</span><div><b>Saiu para entrega</b><small>O motoboy está a caminho</small></div></div><div class="tracking-step"><span class="step-icon">⌂</span><div><b>Entrega concluída</b><small>Estamos chegando!</small></div></div></div>
        <div class="courier-card"><div class="courier-avatar">R</div><div><b>Rafael Oliveira</b><small>Seu entregador · ★ 4,9</small></div><button type="button" aria-label="Ligar para o entregador" (click)="contact.emit()">☏</button></div>
      </aside></div>
      <p class="tracking-disclaimer">A animação é uma demonstração. A posição real será conectada ao GPS do entregador quando o backend estiver disponível.</p>
    </section>
  `,
  styleUrl: './order-tracking.component.css',
})
export class OrderTrackingComponent {
  @Output() back = new EventEmitter<void>();
  @Output() contact = new EventEmitter<void>();
}
