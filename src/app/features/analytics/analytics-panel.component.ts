import { Component, inject, Input, signal } from '@angular/core';
import { ADMIN_DASHBOARD_ACCOUNTS } from '../../core/analytics/admin-dashboard.data';
import { ReportExportService } from '../../core/reports/report-export.service';
import { AdminDashboardAccount, AdminDashboardAccountStatus, AdminDashboardEntity } from '../../models/admin-dashboard-account.model';
import { AdminAccountDetailsDialogComponent } from './admin-account-details-dialog.component';

type AnalyticsScope = 'admin' | 'store';

@Component({
  selector: 'app-analytics-panel',
  standalone: true,
  imports: [AdminAccountDetailsDialogComponent],
  template: `
    @if(scope === 'admin') {
      <section class="analytics-shell" aria-label="Indicadores da plataforma">
        <div class="analytics-intro"><div><div class="eyebrow">INTELIGÊNCIA DA OPERAÇÃO</div><h2>O crescimento, em <span>perspectiva.</span></h2><p>Indicadores da plataforma para decisões mais seguras.</p></div><label class="period-control">Período<select [value]="period()" (change)="period.set($any($event.target).value)"><option>Últimos 30 dias</option><option>Últimos 7 dias</option><option>Este ano</option></select></label></div>
        <div class="metric-grid"><article class="metric-card"><div class="metric-top"><span class="metric-icon mint">♙</span><span class="trend">↗ 14,8%</span></div><small>Usuários ativos</small><b>24.860</b><div class="mini-bars">@for(bar of [35,48,42,63,54,71,60,86,69,96];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">+ 3.214 neste mês</span></article><article class="metric-card"><div class="metric-top"><span class="metric-icon peach">⌂</span><span class="trend">↗ 8,2%</span></div><small>Restaurantes ativos</small><b>1.248</b><div class="mini-bars peach-bars">@for(bar of [38,45,51,44,63,58,76,69,84,100];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">86 aguardando ativação</span></article><article class="metric-card"><div class="metric-top"><span class="metric-icon lilac">↗</span><span class="trend">↗ 11,3%</span></div><small>Entregadores online</small><b>862</b><div class="mini-bars lilac-bars">@for(bar of [32,48,40,56,51,68,63,78,73,91];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">1.430 cadastrados</span></article></div>
        <div class="chart-grid"><article class="chart-card"><div class="chart-heading"><div><small>EVOLUÇÃO DA BASE</small><h3>{{selectedEntity()}} ao longo do tempo</h3></div><div class="entity-switch">@for(entity of entities;track entity){<button type="button" [class.active]="selectedEntity()===entity" (click)="selectedEntity.set(entity)">{{entity}}</button>}</div></div><div class="line-chart"><div class="chart-guides"><span>30 mil</span><span>20 mil</span><span>10 mil</span><span>0</span></div><svg viewBox="0 0 680 190" preserveAspectRatio="none" role="img" [attr.aria-label]="'Gráfico de evolução de ' + selectedEntity()"><defs><linearGradient id="growth-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#27846b" stop-opacity=".22"/><stop offset="1" stop-color="#27846b" stop-opacity="0"/></linearGradient></defs><path [attr.d]="areaPath()" fill="url(#growth-fill)"/><path [attr.d]="linePath()" fill="none" stroke="#27846b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animated-line"/>@for(point of chartPoints('base');track $index){<g class="chart-point" tabindex="0" role="img" [attr.aria-label]="point.label + ': ' + point.title + ' ' + point.value + ', ' + point.detail"><circle [attr.cx]="point.x" [attr.cy]="point.y" r="7"/><g class="chart-point-popover"><rect [attr.x]="point.x<500?point.x+12:point.x-151" [attr.y]="Math.max(3,point.y-57)" width="139" height="48" rx="7"/><text [attr.x]="point.x<500?point.x+21:point.x-142" [attr.y]="Math.max(19,point.y-39)">{{point.label}} · {{point.title}}</text><text class="point-value" [attr.x]="point.x<500?point.x+21:point.x-142" [attr.y]="Math.max(34,point.y-21)">{{point.value}} · {{point.detail}}</text></g></g>}</svg></div><div class="chart-labels"><span>01 out</span><span>06 out</span><span>12 out</span><span>18 out</span><span>24 out</span><span>30 out</span></div></article><article class="chart-card composition-card"><div class="chart-heading"><div><small>SAÚDE DA OPERAÇÃO</small><h3>Contas por situação</h3></div><span class="live-badge"><i></i> Atualizado</span></div><div class="composition"><div class="donut"><div><b>27 mil</b><small>contas</small></div></div><div class="composition-legend"><span><i class="green-dot"></i>Ativas <b>82%</b></span><span><i class="amber-dot"></i>Em análise <b>11%</b></span><span><i class="gray-dot"></i>Pausadas <b>7%</b></span></div></div><div class="composition-footer"><span>Taxa de aprovação</span><b>94,2% <em>↗ 2,1%</em></b></div></article></div>
        <article class="management-card"><div class="chart-heading management-heading"><div><small>GESTÃO DE CONTAS</small><h3>Acompanhe sua rede</h3><p>Consulte o estado das contas cadastradas na plataforma.</p></div><button type="button" class="export-note" (click)="exportAccounts()">▤ Exportar lista</button></div><div class="entity-switch management-tabs">@for(entity of entities;track entity){<button type="button" [class.active]="selectedEntity()===entity" (click)="selectedEntity.set(entity)">{{entity}} <span>{{entityCount(entity)}}</span></button>}</div><div class="account-table"><div class="table-head"><span>NOME</span><span>CADASTRO</span><span>ATIVIDADE</span><span>STATUS</span><span>AÇÃO</span></div>@for(account of accountsForSelected();track account.id){<div class="account-row"><div class="account-name"><span>{{account.initial}}</span><b>{{account.name}}<small>{{account.detail}}</small></b></div><span>{{account.joined}}</span><span>{{account.activity}}</span><i class="account-status" [class.pending]="accountStatus(account)==='Em análise'">{{accountStatus(account)}}</i><button type="button" class="view-account" (click)="selectedAccount.set(account)">Ver conta</button></div>}</div><p class="demo-caption">Demonstração visual · a gestão real de contas será conectada ao backend.</p></article>
        @if (selectedAccount(); as account) {
          <app-admin-account-details-dialog
            [account]="account"
            [status]="accountStatus(account)"
            (closed)="selectedAccount.set(null)"
            (statusToggle)="toggleAccountStatus(account)"
          />
        }
      </section>
    } @else {
      <section class="analytics-shell store-analytics" aria-label="Indicadores do restaurante">
        <div class="analytics-intro"><div><div class="eyebrow">DESEMPENHO DA LOJA</div><h2>Seus clientes e vendas, <span>em foco.</span></h2><p>Entenda seus resultados e descubra oportunidades para vender mais.</p></div><label class="period-control">Período<select [value]="period()" (change)="period.set($any($event.target).value)"><option>Últimos 30 dias</option><option>Últimos 7 dias</option><option>Este ano</option></select></label></div>
        <div class="metric-grid"><article class="metric-card"><div class="metric-top"><span class="metric-icon mint">↗</span><span class="trend">↗ 18,4%</span></div><small>Vendas brutas</small><b>R$ 38.420</b><div class="mini-bars">@for(bar of [34,46,39,62,52,70,61,88,72,100];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">vs. período anterior</span></article><article class="metric-card"><div class="metric-top"><span class="metric-icon peach">♙</span><span class="trend">↗ 9,6%</span></div><small>Clientes atendidos</small><b>1.086</b><div class="mini-bars peach-bars">@for(bar of [40,34,52,47,62,57,73,65,82,95];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">214 clientes recorrentes</span></article><article class="metric-card"><div class="metric-top"><span class="metric-icon lilac">▧</span><span class="trend">↗ 12,1%</span></div><small>Pedidos concluídos</small><b>842</b><div class="mini-bars lilac-bars">@for(bar of [31,46,41,59,52,71,62,80,74,96];track $index){<i [style.height.%]="bar"></i>}</div><span class="metric-foot">Ticket médio R$ 45,63</span></article></div>
        <div class="chart-grid"><article class="chart-card"><div class="chart-heading"><div><small>FATURAMENTO</small><h3>Vendas ao longo do período</h3></div><span class="chart-total">{{storeChartTotal()}} <em>{{periodChange()}}</em></span></div><div class="line-chart"><div class="chart-guides"><span>R$ 8 mil</span><span>R$ 6 mil</span><span>R$ 4 mil</span><span>R$ 0</span></div><svg viewBox="0 0 680 190" preserveAspectRatio="none" role="img" aria-label="Gráfico de vendas do restaurante"><defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e99b57" stop-opacity=".24"/><stop offset="1" stop-color="#e99b57" stop-opacity="0"/></linearGradient></defs><path [attr.d]="storeAreaPath()" fill="url(#sales-fill)"/><path [attr.d]="storeLinePath()" fill="none" stroke="#d98c4b" stroke-width="3" stroke-linecap="round" class="animated-line"/>@for(point of chartPoints('sales');track $index){<g class="chart-point sales-point" tabindex="0" role="img" [attr.aria-label]="point.label + ': faturamento ' + point.value + ', ' + point.detail"><circle [attr.cx]="point.x" [attr.cy]="point.y" r="7"/><g class="chart-point-popover"><rect [attr.x]="point.x<500?point.x+12:point.x-151" [attr.y]="Math.max(3,point.y-57)" width="139" height="48" rx="7"/><text [attr.x]="point.x<500?point.x+21:point.x-142" [attr.y]="Math.max(19,point.y-39)">{{point.label}} · {{point.title}}</text><text class="point-value" [attr.x]="point.x<500?point.x+21:point.x-142" [attr.y]="Math.max(34,point.y-21)">{{point.value}} · {{point.detail}}</text></g></g>}</svg></div><div class="chart-labels"><span>{{periodLabel(0)}}</span><span>{{periodLabel(1)}}</span><span>{{periodLabel(2)}}</span><span>{{periodLabel(3)}}</span><span>{{periodLabel(4)}}</span><span>{{periodLabel(5)}}</span></div></article><article class="chart-card composition-card"><div class="chart-heading"><div><small>PERFIL DE CLIENTES</small><h3>Quem pede na sua loja</h3></div></div><div class="composition"><div class="donut customer-donut"><div><b>1.086</b><small>clientes</small></div></div><div class="composition-legend"><span><i class="green-dot"></i>Recorrentes <b>46%</b></span><span><i class="amber-dot"></i>Novos <b>32%</b></span><span><i class="gray-dot"></i>Reativados <b>22%</b></span></div></div><div class="composition-footer"><span>Clientes que voltaram</span><b>+ 214 <em>neste mês</em></b></div></article></div>
        <article class="management-card product-performance"><div class="chart-heading"><div><small>ITENS MAIS PEDIDOS</small><h3>O que seus clientes adoram</h3><p>Produtos com mais pedidos no período selecionado.</p></div><button class="export-note" type="button">Ver cardápio →</button></div>@for(product of products;track product.name){<div class="product-bar-row"><div class="product-label"><span>{{product.icon}}</span><b>{{product.name}}<small>{{product.orders}} pedidos</small></b></div><div class="product-bar"><i [style.width.%]="product.share"></i></div><strong>{{product.share}}%</strong></div>}</article>
      </section>
    }
  `,
  styleUrl: './analytics-panel.component.css',
})
export class AnalyticsPanelComponent {
  private readonly exporter = inject(ReportExportService);
  @Input() scope: AnalyticsScope = 'admin';
  readonly period = signal('Últimos 30 dias');
  readonly Math = Math;
  readonly entities: AdminDashboardEntity[] = ['Usuários', 'Restaurantes', 'Entregadores'];
  readonly selectedEntity = signal<AdminDashboardEntity>('Usuários');
  readonly selectedAccount = signal<AdminDashboardAccount | null>(null);
  readonly accountOverrides = signal<Record<string, AdminDashboardAccountStatus>>({});
  readonly products = [{ name: 'Brasa Clássico', icon: '🍔', orders: 164, share: 84 }, { name: 'Fritas da casa', icon: '🍟', orders: 128, share: 66 }, { name: 'Duplo Cheddar', icon: '🍔', orders: 96, share: 49 }];
  entityCount(entity: AdminDashboardEntity): string { return ({ Usuários: '24,8k', Restaurantes: '1,2k', Entregadores: '862' })[entity]; }
  accountsForSelected(): AdminDashboardAccount[] { return ADMIN_DASHBOARD_ACCOUNTS[this.selectedEntity()]; }
  accountStatus(account: AdminDashboardAccount): AdminDashboardAccountStatus { return this.accountOverrides()[account.id] ?? account.status; }
  toggleAccountStatus(account: AdminDashboardAccount): void {
    const nextStatus = this.accountStatus(account) === 'Ativa' ? 'Em análise' : 'Ativa';
    this.accountOverrides.update(values => ({ ...values, [account.id]: nextStatus }));
  }
  exportAccounts(): void { this.exporter.downloadCsv(`clickeat-${this.selectedEntity().toLocaleLowerCase('pt-BR')}.csv`, ['Nome', 'Detalhe', 'Cadastro', 'Atividade', 'Status'], this.accountsForSelected().map(account => [account.name, account.detail, account.joined, account.activity, this.accountStatus(account)])); }
  private get points(): string {
    if (this.period() === 'Últimos 7 dias') return '0,164 80,145 163,151 247,109 330,125 413,80 496,91 580,48 680,25';
    if (this.period() === 'Este ano') return '0,169 80,160 163,140 247,146 330,113 413,94 496,101 580,57 680,19';
    return this.selectedEntity() === 'Restaurantes' ? '0,156 80,140 163,119 247,128 330,92 413,100 496,64 580,72 680,26' : this.selectedEntity() === 'Entregadores' ? '0,162 80,143 163,151 247,112 330,123 413,82 496,94 580,48 680,30' : '0,155 80,137 163,146 247,106 330,117 413,77 496,88 580,44 680,18';
  }
  linePath(): string { return `M${this.points.replaceAll(' ', ' L')}`; }
  chartPoints(kind: 'base'|'sales'): { x:number; y:number; label:string; title:string; value:string; detail:string }[] {
    const coords = (kind === 'base' ? this.points : this.salesPoints).split(' ').map(pair => pair.split(',').map(Number));
    const max = kind === 'sales' ? 8000 : this.selectedEntity() === 'Usuários' ? 30000 : this.selectedEntity() === 'Restaurantes' ? 1500 : 1000;
    const labels = this.period() === 'Últimos 7 dias' ? ['24 out','25 out','26 out','27 out','28 out','30 out'] : this.period() === 'Este ano' ? ['mai','jun','jul','ago','set','out'] : ['01 out','06 out','12 out','18 out','24 out','30 out'];
    return coords.map(([x,y], index) => {
      const amount = Math.round((190-y)/190*max);
      const previous = index ? Math.round((190-(coords[index-1]?.[1] ?? y))/190*max) : amount;
      const change = amount-previous;
      return { x, y, label: labels[Math.min(labels.length-1, Math.round(index*(labels.length-1)/Math.max(1,coords.length-1)))], title: kind === 'sales' ? 'Faturamento' : this.selectedEntity(), value: kind === 'sales' ? `R$ ${amount.toLocaleString('pt-BR')}` : amount.toLocaleString('pt-BR'), detail: index === 0 ? 'início do período' : `${change >= 0 ? '+' : ''}${kind === 'sales' ? `R$ ${change.toLocaleString('pt-BR')}` : change.toLocaleString('pt-BR')} desde o ponto anterior` };
    });
  }
  areaPath(): string { return `${this.linePath()} L680 190 L0 190 Z`; }
  private get salesPoints(): string { return this.period() === 'Últimos 7 dias' ? '0,148 80,119 163,139 247,88 330,101 413,72 496,88 580,45 680,19' : this.period() === 'Este ano' ? '0,166 80,151 163,137 247,146 330,108 413,94 496,73 580,48 680,22' : '0,155 80,123 163,108 247,97 333,75 411,67 497,52 580,39 680,16'; }
  storeLinePath(): string { return `M${this.salesPoints.replaceAll(' ', ' L')}`; }
  storeAreaPath(): string { return `${this.storeLinePath()} L680 190 L0 190 Z`; }
  storeChartTotal(): string { return ({ 'Últimos 7 dias': 'R$ 9.860', 'Últimos 30 dias': 'R$ 38.420', 'Este ano': 'R$ 286.940' })[this.period()] ?? 'R$ 38.420'; }
  periodChange(): string { return this.period() === 'Este ano' ? '↗ 22,6%' : this.period() === 'Últimos 7 dias' ? '↗ 7,2%' : '↗ 18,4%'; }
  periodLabel(index: number): string { const labels = this.period() === 'Últimos 7 dias' ? ['24 out', '25 out', '26 out', '27 out', '28 out', '30 out'] : this.period() === 'Este ano' ? ['mai', 'jun', 'jul', 'ago', 'set', 'out'] : ['01 out', '06 out', '12 out', '18 out', '24 out', '30 out']; return labels[index]; }
}
