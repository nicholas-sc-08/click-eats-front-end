import { Component, computed, inject, Input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ReportExportService } from '../../core/reports/report-export.service';

type ReportScope = 'admin' | 'store';
type ReportType = 'all' | 'sales' | 'orders' | 'products' | 'couriers' | 'reviews';
type ReportFieldKey = 'date' | 'reference' | 'store' | 'product' | 'category' | 'quantity' | 'amount' | 'status' | 'customer' | 'courier';
type ReportRow = Record<ReportFieldKey, string | number> & { type: Exclude<ReportType, 'all'> };

interface ReportField { key: ReportFieldKey; label: string; }

const REPORT_FIELDS: ReportField[] = [
  { key: 'date', label: 'Data' }, { key: 'reference', label: 'Pedido / referência' },
  { key: 'store', label: 'Loja' }, { key: 'product', label: 'Produto' },
  { key: 'category', label: 'Categoria' }, { key: 'quantity', label: 'Quantidade' },
  { key: 'amount', label: 'Valor' }, { key: 'status', label: 'Status' },
  { key: 'customer', label: 'Cliente' }, { key: 'courier', label: 'Entregador' },
];

const DEMO_ROWS: ReportRow[] = [
  { type: 'orders', date: '2026-10-30', reference: 'CE-8421', store: 'Brasa & Ponto', product: 'Combo Brasa Clássico', category: 'Hambúrguer', quantity: 2, amount: 86.9, status: 'Entregue', customer: 'Marina Costa', courier: 'Rafael Oliveira' },
  { type: 'orders', date: '2026-10-30', reference: 'CE-8420', store: 'Forno da Vila', product: 'Pizza Margherita', category: 'Pizza', quantity: 1, amount: 64.5, status: 'Preparando', customer: 'Lucas Almeida', courier: '—' },
  { type: 'products', date: '2026-10-29', reference: 'PD-104', store: 'Brasa & Ponto', product: 'Duplo Cheddar', category: 'Hambúrguer', quantity: 38, amount: 1423.76, status: 'Em promoção', customer: '—', courier: '—' },
  { type: 'orders', date: '2026-10-29', reference: 'CE-8419', store: 'Casa Nori', product: 'Combinado Nori', category: 'Japonesa', quantity: 2, amount: 112, status: 'Entregue', customer: 'Ana Souza', courier: 'João Mendes' },
  { type: 'sales', date: '2026-10-28', reference: 'VND-2810', store: 'Brasa & Ponto', product: 'Vendas do dia', category: 'Hambúrguer', quantity: 42, amount: 1842, status: 'Fechado', customer: '—', courier: '—' },
  { type: 'orders', date: '2026-10-28', reference: 'CE-8408', store: 'Brasa & Ponto', product: 'Brasa Clássico', category: 'Hambúrguer', quantity: 1, amount: 38.9, status: 'Cancelado', customer: 'Pedro Lima', courier: '—' },
  { type: 'couriers', date: '2026-10-28', reference: 'ENT-008', store: 'Brasa & Ponto', product: 'Entregas concluídas', category: 'Logística', quantity: 8, amount: 184.5, status: 'Concluído', customer: '—', courier: 'Rafael Oliveira' },
  { type: 'reviews', date: '2026-10-27', reference: 'AVA-392', store: 'Brasa & Ponto', product: 'Brasa Clássico', category: 'Avaliação', quantity: 1, amount: 5, status: 'Publicada', customer: 'Camila Rocha', courier: '—' },
];

@Component({
  selector: 'app-reports-panel',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <section class="report-page">
      <header class="report-heading"><div><div class="eyebrow">{{reportScope()==='admin'?'INTELIGÊNCIA DA OPERAÇÃO':'DESEMPENHO DA LOJA'}}</div><h1>Relatórios <span>e dados.</span></h1><p>Escolha o recorte e os campos. Sem filtros, você recebe o relatório geral.</p></div><span class="demo-data-pill">Dados de demonstração</span></header>
      <section class="report-filters panel"><div class="filter-heading"><div><h2>Personalize seu relatório</h2><p>Selecione um tipo e refine apenas o que for relevante.</p></div><button type="button" class="clear-filters" (click)="resetFilters()">Limpar filtros</button></div>
        <div class="filter-grid"><label>Tipo de relatório<select [value]="reportType()" (change)="reportType.set($any($event.target).value)">@for(option of reportTypes();track option.value){<option [value]="option.value">{{option.label}}</option>}</select></label><label>Período<select [value]="period()" (change)="period.set($any($event.target).value)"><option value="all">Todo o período</option><option value="today">Hoje</option><option value="7d">Últimos 7 dias</option><option value="30d">Últimos 30 dias</option></select></label><label>Status<select [value]="status()" (change)="status.set($any($event.target).value)"><option value="all">Todos os status</option>@for(value of availableStatuses();track value){<option [value]="value">{{value}}</option>}</select></label><label class="search-filter">Buscar<input type="search" placeholder="Pedido, produto, loja..." [value]="query()" (input)="query.set($any($event.target).value)"></label></div>
        <div class="field-picker"><div><b>Campos incluídos</b><small>Escolha as colunas que devem aparecer no arquivo.</small></div><div class="field-options">@for(field of availableFields();track field.key){<label><input type="checkbox" [checked]="selectedFields().includes(field.key)" (change)="toggleField(field.key,$any($event.target).checked)">{{field.label}}</label>}</div></div>
      </section>
      <div class="report-summary"><article><small>REGISTROS</small><b>{{filteredRows().length}}</b><span>no recorte atual</span></article><article><small>VALOR TOTAL</small><b>{{totalAmount()|currency:'BRL':'symbol':'1.2-2':'pt-BR'}}</b><span>somatório filtrado</span></article><article><small>PERÍODO</small><b>{{periodLabel()}}</b><span>{{reportScope()==='admin'?'Toda a operação':'Sua loja'}}</span></article></div>
      <section class="report-results panel"><div class="results-heading"><div><h2>{{reportTitle()}}</h2><p>{{filteredRows().length}} registros · {{selectedFields().length}} campos selecionados</p></div><div class="export-actions"><button type="button" class="export-csv" [disabled]="!canExport()" (click)="exportCsv()"><span>↓</span> Exportar CSV</button><button type="button" class="export-pdf" [disabled]="!canExport()" (click)="exportPdf()"><span>▤</span> Salvar como PDF</button></div></div>
        @if(!selectedFields().length){<div class="report-empty"><span>▤</span><b>Selecione ao menos um campo</b><p>O arquivo precisa ter pelo menos uma coluna.</p></div>}@else if(!filteredRows().length){<div class="report-empty"><span>⌕</span><b>Nenhum registro encontrado</b><p>Altere os filtros para ampliar os resultados.</p></div>}@else{
          <div class="report-table-scroll"><table><thead><tr>@for(field of selectedFieldDefinitions();track field.key){<th>{{field.label}}</th>}</tr></thead><tbody>@for(row of filteredRows();track row['reference']){<tr>@for(field of selectedFieldDefinitions();track field.key){<td>{{formatValue(row[field.key],field.key)}}</td>}</tr>}</tbody></table></div>
        }
      </section>
      <section class="report-print-area" aria-hidden="true"><div class="print-brand">click<span>eat</span></div><h1>{{reportTitle()}}</h1><p>{{reportScope()==='admin'?'Visão geral da plataforma':'Relatório da loja Brasa & Ponto'}} · {{periodLabel()}} · Gerado em {{generatedAt()}}</p><p>Filtros: {{filterSummary()}}</p><table><thead><tr>@for(field of selectedFieldDefinitions();track field.key){<th>{{field.label}}</th>}</tr></thead><tbody>@for(row of filteredRows();track row['reference']){<tr>@for(field of selectedFieldDefinitions();track field.key){<td>{{formatValue(row[field.key],field.key)}}</td>}</tr>}</tbody></table><small>Relatório demonstrativo · ClickEat</small></section>
    </section>
  `,
  styleUrl: './reports-panel.component.css',
})
export class ReportsPanelComponent {
  private readonly scopeValue = signal<ReportScope | null>(null);
  @Input({ required: true }) set scope(value: ReportScope) {
    this.scopeValue.set(value);
    this.selectedFields.set(REPORT_FIELDS.map(field => field.key));
  }
  reportScope(): ReportScope { return this.scopeValue() ?? 'admin'; }
  private readonly exporter = inject(ReportExportService);
  readonly reportType = signal<ReportType>('all');
  readonly period = signal('all');
  readonly status = signal('all');
  readonly query = signal('');
  readonly selectedFields = signal<ReportFieldKey[]>(REPORT_FIELDS.map(field => field.key));
  readonly reportTypes = signal([
    { value: 'all', label: 'Relatório geral' }, { value: 'sales', label: 'Vendas e faturamento' },
    { value: 'orders', label: 'Pedidos' }, { value: 'products', label: 'Produtos' },
    { value: 'couriers', label: 'Entregas' }, { value: 'reviews', label: 'Avaliações' },
  ]);
  readonly availableFields = signal(REPORT_FIELDS);
  readonly selectedFieldDefinitions = computed(() => this.availableFields().filter(field => this.selectedFields().includes(field.key)));
  readonly scopedRows = computed(() => DEMO_ROWS.filter(row => this.reportScope() === 'admin' || row.store === 'Brasa & Ponto'));
  readonly filteredRows = computed(() => {
    const cutoff = this.period() === 'today' ? '2026-10-30' : this.period() === '7d' ? '2026-10-23' : this.period() === '30d' ? '2026-09-30' : '';
    const search = this.query().trim().toLocaleLowerCase('pt-BR');
    return this.scopedRows().filter(row => {
      if (this.reportType() !== 'all' && row.type !== this.reportType()) return false;
      if (cutoff && row.date < cutoff) return false;
      if (this.status() !== 'all' && row.status !== this.status()) return false;
      return !search || Object.values(row).some(value => String(value).toLocaleLowerCase('pt-BR').includes(search));
    });
  });
  readonly availableStatuses = computed(() => [...new Set(this.scopedRows().map(row => row.status))].sort());
  totalAmount(): number { return this.filteredRows().reduce((total, row) => total + Number(row.amount), 0); }
  periodLabel(): string { return ({ all: 'Todo período', today: 'Hoje', '7d': '7 dias', '30d': '30 dias' })[this.period()] ?? 'Todo período'; }
  reportTitle(): string { return this.reportTypes().find(type => type.value === this.reportType())?.label ?? 'Relatório geral'; }
  readonly canExport = computed(() => this.selectedFieldDefinitions().length > 0 && this.filteredRows().length > 0);

  toggleField(field: ReportFieldKey, selected: boolean): void {
    this.selectedFields.update(fields => selected ? [...new Set([...fields, field])] : fields.filter(current => current !== field));
  }
  resetFilters(): void { this.reportType.set('all'); this.period.set('all'); this.status.set('all'); this.query.set(''); this.selectedFields.set(this.availableFields().map(field => field.key)); }
  formatValue(value: string | number, field: ReportFieldKey): string {
    if (field === 'amount') return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (field === 'date') return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
    return String(value);
  }
  filterSummary(): string { return `tipo: ${this.reportTitle()} · período: ${this.periodLabel()} · status: ${this.status() === 'all' ? 'todos' : this.status()} · busca: ${this.query().trim() || 'sem busca'}`; }
  generatedAt(): string { return new Date().toLocaleString('pt-BR'); }
  exportCsv(): void {
    const fields = this.selectedFieldDefinitions();
    const headers = fields.map(field => field.label);
    const rows = this.filteredRows().map(row => fields.map(field => this.formatValue(row[field.key], field.key)));
    const safeName = this.reportTitle().toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    this.exporter.downloadCsv(`clickeat-${this.reportScope()}-${safeName}.csv`, headers, rows);
  }
  exportPdf(): void { if (this.canExport()) window.print(); }
}
