import { Component, Input, signal } from '@angular/core';
import { WorkspaceSection } from '../../models/workspace.models';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  template: `
    @if(section === 'settings') {
      <section class="content"><div class="eyebrow">PERFIL DO ENTREGADOR</div><h1>Minha <span>conta.</span></h1><p class="subheading">Preferências e modalidades de entrega que você deseja receber.</p><article class="panel courier-modes"><div class="panel-heading"><div><h2>Tipos de entrega disponíveis</h2><p>Escolha quais oportunidades aparecem para você. Os valores são apresentados antes do aceite.</p></div></div><label class="mode-option"><input type="checkbox" [checked]="acceptClickEat()" (change)="acceptClickEat.set($any($event.target).checked)"><span class="mode-mark">↗</span><span><b>ClickEat Entrega</b><small>Pedidos com tarifa de entrega definida pela plataforma.</small></span><i class="mode-check">{{acceptClickEat()?'✓':''}}</i></label><label class="mode-option"><input type="checkbox" [checked]="acceptOwn()" (change)="acceptOwn.set($any($event.target).checked)"><span class="mode-mark own">⌂</span><span><b>Entrega própria</b><small>Rotas de restaurantes parceiros com tarifa definida pela loja.</small></span><i class="mode-check">{{acceptOwn()?'✓':''}}</i></label><div class="courier-info">A modalidade e a tarifa de cada corrida ficam visíveis antes de você aceitar a entrega.</div></article></section>
    } @else if(section === 'history') {
      <section class="content"><div class="eyebrow">SUAS ROTAS</div><h1>Histórico de <span>entregas.</span></h1><p class="subheading">Confira suas últimas entregas e ganhos.</p><article class="panel courier-history"><div class="panel-heading"><div><h2>Entregas recentes</h2><p>Resumo demonstrativo da sua atividade</p></div></div><div class="history-row"><span>🍔</span><div><b>Pedido #CE-8421 · Brasa & Ponto</b><small>Hoje, 12:48 · Entregue em 26 min</small></div><strong>R$ 12,50</strong></div><div class="history-row"><span>🍕</span><div><b>Pedido #CE-8417 · Forno da Vila</b><small>Hoje, 11:52 · Entregue em 31 min</small></div><strong>R$ 14,00</strong></div><div class="history-row"><span>🍣</span><div><b>Pedido #CE-8409 · Casa Nori</b><small>Ontem, 20:18 · Entregue em 22 min</small></div><strong>R$ 11,00</strong></div></article></section>
    } @else if(section === 'earnings') {
      <section class="content"><div class="eyebrow">SEU TRABALHO, SEUS GANHOS</div><h1>Ganhos de <span>hoje.</span></h1><p class="subheading">Um resumo transparente da sua jornada.</p><div class="stats-grid"><article class="stat-card"><small>Total de hoje</small><b>R$ 184,50</b><span>8 entregas realizadas</span></article><article class="stat-card"><small>Esta semana</small><b>R$ 1.126,00</b><span>47 entregas realizadas</span></article><article class="stat-card"><small>Gorjetas</small><b>R$ 38,00</b><span>Nas últimas 7 entregas</span></article><article class="stat-card"><small>Meta diária</small><b>74%</b><span>R$ 65,50 para alcançar</span></article></div><article class="panel earnings-panel"><div class="panel-heading"><div><h2>Resumo das entregas</h2><p>Valores demonstrativos</p></div></div><div class="earnings-total"><span>Ganhos com entregas</span><b>R$ 146,50</b></div><div class="earnings-total"><span>Gorjetas</span><b>R$ 38,00</b></div><div class="earnings-total total"><span>Total</span><b>R$ 184,50</b></div></article></section>
    } @else {
      <section class="content"><div class="eyebrow">ÁREA DO ENTREGADOR</div><h1>Boa tarde, <span>Rafa!</span></h1><p class="subheading">Pronto para fazer entregas hoje?</p><div class="courier-banner"><div><span class="live-dot"></span> {{online()?'Você está online':'Você está offline'}} <p>{{online()?'Estamos encontrando pedidos por perto.':'Ative seu status para receber novas rotas.'}}</p></div><button type="button" (click)="online.set(!online())">{{online()?'Ficar offline':'Ficar online'}}</button></div>
        @if(section === 'overview') {
          <div class="stats-grid"><article class="stat-card"><small>Ganhos de hoje</small><b>R$ 184,50 <span class="up">↗</span></b><span>meta diária: R$ 250</span></article><article class="stat-card"><small>Entregas concluídas</small><b>8</b><span>2 em andamento</span></article><article class="stat-card"><small>Avaliação</small><b>★ 4,97</b><span>nos últimos 30 dias</span></article><article class="stat-card"><small>Horas online</small><b>5h 24min</b><span>hoje</span></article></div><article class="panel courier-modes overview-modes"><div class="panel-heading"><div><h2>Modalidades da sua conta</h2><p>O tipo de operação aparece em cada oferta de entrega.</p></div></div><div class="mode-summary"><span class="mode-chip platform-chip">↗ ClickEat Entrega <b>{{acceptClickEat()?'Disponível':'Pausada'}}</b></span><span class="mode-chip own-chip">⌂ Entrega própria <b>{{acceptOwn()?'Disponível':'Pausada'}}</b></span></div></article>
        }
        <article class="panel partner-orders"><div class="panel-heading"><div><h2>{{section === 'orders'?'Entrega atual':'Entrega em andamento'}}</h2><p>Pedido #CE-8425 · <button type="button" class="delivery-source" (click)="activeOwnDelivery.set(!activeOwnDelivery())">{{activeOwnDelivery()?'Entrega própria · Brasa & Ponto':'ClickEat Entrega'}} ⌄</button></p></div><i class="status preparing">A caminho</i></div><div class="route-steps"><div class="route-step done"><span>✓</span><div><b>Retirar na loja</b><small>Brasa & Ponto · Rua dos Pinheiros, 88</small></div></div><div class="route-step"><span>2</span><div><b>Entregar ao cliente</b><small>Rua Harmonia, 321 · 8 min de distância</small></div></div></div><div class="delivery-earnings"><span>Valor desta corrida</span><b>{{activeOwnDelivery()?'R$ 8,99':'R$ 12,50'}}</b><small>Tarifa exibida antes do aceite</small></div></article>
      </section>
    }
  `,
  styleUrl: './courier-dashboard.component.css',
})
export class CourierDashboardComponent {
  @Input() section: WorkspaceSection = 'overview';
  readonly online = signal(true);
  readonly acceptClickEat = signal(true);
  readonly acceptOwn = signal(true);
  readonly activeOwnDelivery = signal(false);
}
