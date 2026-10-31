import { Component, computed, inject, signal } from '@angular/core';
import { AccountKind, AccountStatus, ManagedAccount, ManagedAccountsService } from '../../core/management/managed-accounts.service';
import { ReportExportService } from '../../core/reports/report-export.service';

@Component({
  selector: 'app-account-management',
  standalone: true,
  template: `
    <section class="management-card account-management" aria-labelledby="accounts-title">
      <header class="management-head"><div><small>GESTÃO DA PLATAFORMA</small><h3 id="accounts-title">Cadastros da plataforma</h3><p>Visão organizada de clientes, restaurantes e entregadores.</p></div><button class="primary-action" type="button" (click)="create()"><span aria-hidden="true">＋</span> Novo cadastro</button></header>
      <div class="management-summary" aria-label="Resumo das contas">
        <article><span class="summary-icon total-icon">▦</span><div><small>Total de contas</small><b>{{summary().total}}</b></div></article>
        <article><span class="summary-icon store-icon">⌂</span><div><small>Restaurantes</small><b>{{summary().restaurants}}</b></div></article>
        <article><span class="summary-icon active-icon">✓</span><div><small>Contas ativas</small><b>{{summary().active}}</b></div></article>
        <article><span class="summary-icon review-icon">◷</span><div><small>Em análise</small><b>{{summary().review}}</b></div></article>
      </div>
      <div class="account-toolbar"><div class="entity-switch" role="tablist" aria-label="Tipo de conta">@for(kind of kinds;track kind){<button type="button" role="tab" [attr.aria-selected]="selectedKind()===kind" [class.active]="selectedKind()===kind" (click)="selectedKind.set(kind)">{{kind}} <span>{{count(kind)}}</span></button>}</div><label class="account-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar cadastros" placeholder="Buscar por nome, e-mail ou cidade" [value]="query()" (input)="query.set($any($event.target).value)"></label><button class="export-note" type="button" (click)="export()"><span aria-hidden="true">⇩</span> Exportar CSV</button></div>
      <div class="table-scroll-hint">Deslize a tabela para ver todos os dados <span aria-hidden="true">↔</span></div>
      <div class="account-table" role="table" aria-label="Cadastros filtrados">
        <div class="table-head" role="row"><span role="columnheader">CADASTRO</span><span role="columnheader">CONTATO</span><span role="columnheader">LOCALIZAÇÃO</span><span role="columnheader">STATUS</span><span role="columnheader">AÇÕES</span></div>
        @for(account of filtered();track account.id){<div class="account-row" role="row"><div class="account-name" role="cell"><span>{{initial(account.name)}}</span><b>{{account.name}}<small>{{account.detail}}</small></b></div><span class="contact-cell" role="cell">{{account.email}}<small>{{account.phone}}</small></span><span role="cell">{{account.location}}</span><i role="cell" class="account-status" [class.pending]="account.status==='Em análise'" [class.paused]="account.status==='Pausada'">{{account.status}}</i><div role="cell" class="row-actions"><button type="button" aria-label="Editar cadastro" title="Editar" (click)="edit(account)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z"/><path d="m14.8 5.7 3.5 3.5"/></svg></button><button type="button" class="delete-action" aria-label="Excluir cadastro" title="Excluir" (click)="askDelete(account)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></div></div>}
        @empty {<div class="empty-state"><span>⌕</span><b>Nenhum cadastro encontrado</b><small>Ajuste a busca ou cadastre uma nova conta.</small></div>}
      </div>
      <footer class="management-foot"><span>{{filtered().length}} {{selectedKind().toLocaleLowerCase('pt-BR')}} nesta visualização</span><span>Dados de demonstração · salvos neste navegador</span></footer>
    </section>
    @if(editorOpen()){<div class="dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeEditor()"><section class="account-dialog" [class.closing]="dialogClosing()" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" (click)="$event.stopPropagation()"><button class="dialog-close" type="button" aria-label="Fechar" (click)="closeEditor()">×</button><div class="dialog-icon">{{editingId()?'✎':'＋'}}</div><small class="dialog-eyebrow">GESTÃO DA PLATAFORMA</small><h2 id="account-dialog-title">{{editingId()?'Editar cadastro':'Novo cadastro'}}</h2><p>Preencha as informações principais para manter a operação organizada.</p><form (submit)="$event.preventDefault();submit()"><label>Tipo de conta<select [value]="kind()" (change)="kind.set($any($event.target).value)">@for(option of kinds;track option){<option [value]="option">{{option}}</option>}</select></label><label>Nome<input required [value]="name()" (input)="name.set($any($event.target).value)" placeholder="Nome completo ou nome da loja"></label><div class="form-pair"><label>E-mail<input required type="email" [value]="email()" (input)="email.set($any($event.target).value)" placeholder="nome@email.com"></label><label>Telefone<input [value]="phone()" (input)="phone.set($any($event.target).value)" placeholder="(11) 99999-0000"></label></div><div class="form-pair"><label>Cidade / bairro<input [value]="location()" (input)="location.set($any($event.target).value)" placeholder="Pinheiros, São Paulo"></label><label>Status<select [value]="status()" (change)="status.set($any($event.target).value)"><option>Ativa</option><option>Em análise</option><option>Pausada</option></select></label></div><label>Observação<input [value]="detail()" (input)="detail.set($any($event.target).value)" placeholder="Ex.: Cliente · 8 pedidos"></label><div class="dialog-actions"><button type="button" class="cancel-action" (click)="closeEditor()">Cancelar</button><button type="submit" class="primary-action">{{editingId()?'Salvar alterações':'Criar cadastro'}}</button></div></form></section></div>}
    @if(deleteTarget();as account){<div class="dialog-backdrop" [class.closing]="dialogClosing()" (click)="closeDelete()"><section class="account-dialog compact-dialog" [class.closing]="dialogClosing()" role="alertdialog" aria-modal="true" aria-labelledby="delete-account-title" (click)="$event.stopPropagation()"><div class="dialog-icon danger-icon">⌫</div><small class="dialog-eyebrow">EXCLUIR CADASTRO</small><h2 id="delete-account-title">Remover {{account.name}}?</h2><p>Essa conta será removida desta demonstração. Você poderá criá-la novamente depois.</p><div class="dialog-actions"><button class="cancel-action" type="button" (click)="closeDelete()">Cancelar</button><button class="delete-confirm" type="button" (click)="confirmDelete()">Excluir cadastro</button></div></section></div>}
  `,
  styleUrl: './account-management.component.css',
})
export class AccountManagementComponent {
  readonly service = inject(ManagedAccountsService);
  private readonly exporter = inject(ReportExportService);
  readonly kinds: AccountKind[] = ['Usuários', 'Restaurantes', 'Entregadores'];
  readonly selectedKind = signal<AccountKind>('Usuários');
  readonly query = signal('');
  readonly summary = computed(() => {
    const accounts = this.service.accounts();
    return { total: accounts.length, restaurants: accounts.filter(account => account.kind === 'Restaurantes').length, active: accounts.filter(account => account.status === 'Ativa').length, review: accounts.filter(account => account.status === 'Em análise').length };
  });
  readonly filtered = computed(() => { const query = this.query().trim().toLocaleLowerCase('pt-BR'); return this.service.accounts().filter(account => account.kind === this.selectedKind() && (!query || `${account.name} ${account.email} ${account.location}`.toLocaleLowerCase('pt-BR').includes(query))); });
  readonly editorOpen = signal(false);
  readonly dialogClosing = signal(false);
  readonly editingId = signal('');
  readonly kind = signal<AccountKind>('Usuários');
  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly location = signal('');
  readonly detail = signal('');
  readonly status = signal<AccountStatus>('Ativa');
  readonly deleteTarget = signal<ManagedAccount | null>(null);

  count(kind: AccountKind): number { return this.service.accounts().filter(account => account.kind === kind).length; }
  initial(name: string): string { return name.trim().charAt(0).toUpperCase(); }
  create(): void { this.dialogClosing.set(false); this.editingId.set(''); this.kind.set(this.selectedKind()); this.name.set(''); this.email.set(''); this.phone.set(''); this.location.set(''); this.detail.set(''); this.status.set('Ativa'); this.editorOpen.set(true); }
  edit(account: ManagedAccount): void { this.dialogClosing.set(false); this.editingId.set(account.id); this.kind.set(account.kind); this.name.set(account.name); this.email.set(account.email); this.phone.set(account.phone); this.location.set(account.location); this.detail.set(account.detail); this.status.set(account.status); this.editorOpen.set(true); }
  submit(): void { this.service.save({ id: this.editingId() || undefined, kind: this.kind(), name: this.name().trim(), email: this.email().trim(), phone: this.phone().trim(), location: this.location().trim(), detail: this.detail().trim(), status: this.status() }); this.selectedKind.set(this.kind()); this.closeEditor(); }
  closeEditor(): void { this.closeWithAnimation(() => this.editorOpen.set(false)); }
  askDelete(account: ManagedAccount): void { this.dialogClosing.set(false); this.deleteTarget.set(account); }
  closeDelete(): void { this.closeWithAnimation(() => this.deleteTarget.set(null)); }
  confirmDelete(): void { const account = this.deleteTarget(); if (account) this.service.remove(account.id); this.closeDelete(); }
  private closeWithAnimation(close: () => void): void { if (this.dialogClosing()) return; this.dialogClosing.set(true); window.setTimeout(() => { close(); this.dialogClosing.set(false); }, 220); }
  export(): void { this.exporter.downloadCsv(`clickeat-${this.selectedKind().toLocaleLowerCase('pt-BR')}.csv`, ['Tipo', 'Nome', 'E-mail', 'Telefone', 'Localização', 'Observação', 'Status'], this.filtered().map(account => [account.kind, account.name, account.email, account.phone, account.location, account.detail, account.status])); }
}
