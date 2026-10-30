import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkspaceRole, WorkspaceSection } from '../../../models/workspace.models';

interface NavigationItem { id: WorkspaceSection; icon: string; label: string; }

@Component({
  selector: 'app-workspace-sidebar',
  standalone: true,
  template: `
    <aside class="sidebar workspace-sidebar" [class.open]="open">
      <a class="brand" href="#" (click)="$event.preventDefault(); sectionChange.emit('overview')"><span class="brand-mark">c</span><span>click<span class="brand-eat">eat</span><small>comida boa, sem complicação</small></span></a>
      <div class="workspace-badge"><span class="workspace-role-icon">{{ roleIcon }}</span><div><small>ESPAÇO DE TRABALHO</small><b>{{ roleLabel }}</b></div></div>
      <div class="side-label">{{ sectionHeading }}</div>
      @for (item of navigationItems; track item.id) {
        <button class="side-link" type="button" [class.active]="section===item.id" (click)="sectionChange.emit(item.id)"><span>{{item.icon}}</span>{{item.label}}</button>
      }
      <div class="sidebar-divider"></div>
      <div class="role-sidebar-note"><span>✳</span><b>{{ noteTitle }}</b><p>{{ noteText }}</p></div>
      <div class="side-bottom workspace-user"><div class="avatar">{{ roleInitial }}</div><div><b>{{ userName }}</b><small>{{ roleLabel }}</small></div><button class="switch-account" type="button" (click)="switchToCustomer.emit()">Trocar<br>perfil</button></div>
    </aside>
  `,
  styles: [`
    .workspace-sidebar{gap:2px}.workspace-badge{display:flex;align-items:center;gap:10px;margin:0 0 26px;padding:11px;border:1px solid #e9eee9;border-radius:11px;background:#f8faf7}.workspace-role-icon{display:grid;place-items:center;width:35px;height:35px;border-radius:10px;background:#e5f1e8;color:#24745f;font-size:17px}.workspace-badge>div{display:grid;gap:4px}.workspace-badge small{color:#98a198;font-size:7px;letter-spacing:.8px;font-weight:750}.workspace-badge b{color:#36443a;font-size:11px}.workspace-sidebar .side-label{margin-top:2px}.role-sidebar-note{margin-top:auto;padding:13px 11px;border:1px solid #e4ece4;border-radius:10px;background:#f2f7f1}.role-sidebar-note>span{display:grid;place-items:center;width:24px;height:24px;margin-bottom:9px;border-radius:8px;background:#e0eee1;color:#3a805d}.role-sidebar-note>b{display:block;color:#364139;font-size:10px;line-height:1.4}.role-sidebar-note p{margin:5px 0 0;color:#869087;font-size:8px;line-height:1.5}.workspace-user{margin-top:15px}.switch-account{margin-left:auto;padding:5px 7px;border:1px solid #e6ebe6;border-radius:7px;background:white;color:#67736a;font-size:8px;line-height:1.3}.workspace-sidebar .side-link{display:flex;align-items:center;gap:7px}.workspace-sidebar .side-link>span{width:22px}
  `],
})
export class WorkspaceSidebarComponent {
  @Input({ required: true }) role: WorkspaceRole = 'admin';
  @Input({ required: true }) section: WorkspaceSection = 'overview';
  @Input() open = false;
  @Output() sectionChange = new EventEmitter<WorkspaceSection>();
  @Output() switchToCustomer = new EventEmitter<void>();

  get roleLabel(): string { return ({ admin: 'Administração', store: 'Brasa & Ponto', courier: 'Entregador' })[this.role]; }
  get roleIcon(): string { return ({ admin: '▦', store: '⌂', courier: '↗' })[this.role]; }
  get roleInitial(): string { return ({ admin: 'A', store: 'B', courier: 'R' })[this.role]; }
  get userName(): string { return ({ admin: 'Equipe ClickEat', store: 'Brasa & Ponto', courier: 'Rafael Oliveira' })[this.role]; }
  get sectionHeading(): string { return ({ admin: 'GESTÃO', store: 'RESTAURANTE', courier: 'ENTREGAS' })[this.role]; }
  get noteTitle(): string { return ({ admin: 'Tudo em um só lugar', store: 'Sua loja, no seu ritmo', courier: 'Boa rota, Rafa!' })[this.role]; }
  get noteText(): string { return ({ admin: 'Acompanhe indicadores e decisões da operação.', store: 'Pedidos, cardápio e vendas organizados para você.', courier: 'Mantenha sua disponibilidade atualizada para receber rotas.' })[this.role]; }
  get navigationItems(): NavigationItem[] {
    const navigation: Record<WorkspaceRole, NavigationItem[]> = {
      admin: [
        { id: 'overview', icon: '⌂', label: 'Visão geral' }, { id: 'reports', icon: '▤', label: 'Relatórios' },
        { id: 'orders', icon: '▧', label: 'Pedidos' }, { id: 'shops', icon: '◇', label: 'Lojas' },
        { id: 'coupons', icon: '♧', label: 'Cupons' }, { id: 'settings', icon: '⚙', label: 'Configurações' },
      ],
      store: [
        { id: 'overview', icon: '⌂', label: 'Visão geral' }, { id: 'orders', icon: '▧', label: 'Pedidos' },
        { id: 'catalog', icon: '▤', label: 'Cardápio e ofertas' }, { id: 'reports', icon: '▥', label: 'Relatórios' },
        { id: 'reviews', icon: '☆', label: 'Avaliações' }, { id: 'settings', icon: '⚙', label: 'Configurações' },
      ],
      courier: [
        { id: 'overview', icon: '⌂', label: 'Início' }, { id: 'orders', icon: '↗', label: 'Entrega atual' },
        { id: 'earnings', icon: '$', label: 'Ganhos' }, { id: 'history', icon: '◷', label: 'Histórico' },
        { id: 'settings', icon: '⚙', label: 'Minha conta' },
      ],
    };
    return navigation[this.role];
  }
}
