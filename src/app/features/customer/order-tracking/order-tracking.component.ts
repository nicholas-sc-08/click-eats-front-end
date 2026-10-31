import { Component, EventEmitter, inject, Output } from '@angular/core';
import { OrderTrackingDemoService } from '../../../core/delivery/order-tracking-demo.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  template: `
    <section class="tracking-page">
      <button class="tracking-back" type="button" (click)="back.emit()">← <span>Voltar para meus pedidos</span></button>
      <header class="tracking-heading">
        <div><div class="eyebrow">PEDIDO #CE-8425</div><h1>Seu pedido está <span>{{ delivered() ? 'no destino.' : 'a caminho.' }}</span></h1><p>{{ delivered() ? 'Seu pedido chegou. Bom apetite!' : 'Acompanhe cada etapa até a sua porta.' }}</p></div>
        <span class="tracking-live" [class.arrived]="delivered()"><i></i> {{ delivered() ? 'Entrega concluída' : 'Atualização demonstrativa' }}</span>
      </header>
      <div class="tracking-layout"><div class="tracking-map" role="img" [attr.aria-label]="'Mapa demonstrativo. ' + (delivered() ? 'Pedido entregue.' : 'Entregador a ' + etaMinutes() + ' minutos.')">
        <div class="map-block block-one"></div><div class="map-block block-two"></div><div class="map-block block-three"></div><div class="map-block block-four"></div>
        <span class="street-label street-one">R. Harmonia</span><span class="street-label street-two">R. Girassol</span><span class="street-label street-three">Av. Faria Lima</span>
        <svg class="route-map" viewBox="0 0 900 520" preserveAspectRatio="none" aria-hidden="true">
          <path class="route-shadow" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          <path class="route-base" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          <path class="route-progress" pathLength="100" stroke-dasharray="100" [attr.stroke-dashoffset]="etaMinutes()/8*100" d="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/>
          @if(!delivered()){<g class="courier-marker"><circle r="23"/><g class="helmet" transform="translate(-11 -11)"><path d="M2 12a9 9 0 0 1 18 0v2H2z"/><path d="M2 14h20M14 5v3"/></g><animateMotion [attr.dur]="(etaMinutes()||1)*20+'s'" [attr.keyPoints]="((8-etaMinutes())/8)+';1'" keyTimes="0;1" calcMode="linear" fill="freeze" path="M170 390 C250 390 260 300 350 300 S470 370 540 300 S620 170 735 145"/></g>}
        </svg>
        <div class="map-stop restaurant-stop"><span>🍔</span><small>Brasa & Ponto</small></div><div class="map-stop home-stop"><span>⌂</span><small>Você</small></div>
        <div class="map-attribution">Trajeto ilustrativo · localização simulada</div>
      </div><aside class="tracking-details"><div class="eta-card" [class.delivered]="delivered()"><span class="eta-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><small>{{ delivered() ? 'PEDIDO ENTREGUE' : 'PREVISÃO DE CHEGADA' }}</small><b>{{ delivered() ? 'Chegou!' : etaMinutes() + ' ' }}<span>{{ delivered() ? '' : 'min' }}</span></b><p>{{ delivered() ? 'Esperamos que você aproveite.' : etaMinutes() <= 2 ? 'O entregador está quase chegando.' : 'A previsão é atualizada durante o trajeto.' }}</p></div></div>
        <div class="tracking-steps"><div class="tracking-step done"><span class="step-icon">✓</span><div><b>Pedido confirmado</b><small>12:32 · Restaurante recebeu seu pedido</small></div></div><div class="tracking-step done"><span class="step-icon">✓</span><div><b>Pedido preparado</b><small>O restaurante finalizou o preparo</small></div></div><div class="tracking-step" [class.current]="!delivered()" [class.done]="delivered()"><span class="step-icon">@if(delivered()){✓} @else {<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13a9 9 0 0 1 18 0v2H3z"/><path d="M3 15h19M15 5v3"/></svg>}</span><div><b>Saiu para entrega</b><small>{{ delivered() ? 'Entrega finalizada' : 'Rafael está a caminho' }}</small></div></div><div class="tracking-step" [class.current]="delivered()"><span class="step-icon">⌂</span><div><b>Entrega concluída</b><small>{{ delivered() ? 'Pedido entregue agora' : 'Estamos chegando!' }}</small></div></div></div>
        <div class="courier-card"><div class="courier-avatar">R</div><div><b>Rafael Oliveira</b><small>Seu entregador · ★ 4,9</small></div><button type="button" aria-label="Ligar para o entregador" (click)="contact.emit()">☏</button></div>
      </aside></div>
      <p class="tracking-disclaimer">Demonstração visual com tempo acelerado. Posição e previsão reais dependem do backend e do GPS do entregador.</p>
    </section>
  `,
  styleUrl: './order-tracking.component.css',
})
export class OrderTrackingComponent {
  @Output() back = new EventEmitter<void>();
  @Output() contact = new EventEmitter<void>();
  private readonly tracking = inject(OrderTrackingDemoService);
  readonly etaMinutes = this.tracking.etaMinutes;
  readonly delivered = this.tracking.delivered;
}
