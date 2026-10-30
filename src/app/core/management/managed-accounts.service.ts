import { Injectable, signal } from '@angular/core';

export type AccountKind = 'Usuários' | 'Restaurantes' | 'Entregadores';
export type AccountStatus = 'Ativa' | 'Em análise' | 'Pausada';
export interface ManagedAccount { id: string; kind: AccountKind; name: string; email: string; phone: string; location: string; detail: string; status: AccountStatus; }

const SEED: ManagedAccount[] = [
  { id:'u1',kind:'Usuários',name:'Marina Costa',email:'marina.costa@email.com',phone:'(11) 98888-1001',location:'Pinheiros, São Paulo',detail:'Cliente · 8 pedidos',status:'Ativa' },
  { id:'u2',kind:'Usuários',name:'Lucas Almeida',email:'lucas.almeida@email.com',phone:'(11) 98888-1002',location:'Vila Madalena, São Paulo',detail:'Cliente · 5 pedidos',status:'Ativa' },
  { id:'u3',kind:'Usuários',name:'Camila Rocha',email:'camila.rocha@email.com',phone:'(11) 98888-1003',location:'Pinheiros, São Paulo',detail:'Cliente · 1 pedido',status:'Em análise' },
  { id:'r1',kind:'Restaurantes',name:'Brasa & Ponto',email:'contato@brasaponto.com.br',phone:'(11) 3030-1010',location:'Pinheiros, São Paulo',detail:'Hambúrguer · 42 pedidos hoje',status:'Ativa' },
  { id:'r2',kind:'Restaurantes',name:'Forno da Vila',email:'oi@fornodavila.com.br',phone:'(11) 3030-1011',location:'Vila Madalena, São Paulo',detail:'Pizza · 31 pedidos hoje',status:'Ativa' },
  { id:'r3',kind:'Restaurantes',name:'Casa Nori',email:'contato@casanori.com.br',phone:'(11) 3030-1012',location:'Pinheiros, São Paulo',detail:'Japonesa · revisão cadastral',status:'Em análise' },
  { id:'d1',kind:'Entregadores',name:'Rafael Oliveira',email:'rafael@email.com',phone:'(11) 97777-2001',location:'São Paulo, SP',detail:'Entrega ClickEat · 8 entregas hoje',status:'Ativa' },
  { id:'d2',kind:'Entregadores',name:'João Mendes',email:'joao@email.com',phone:'(11) 97777-2002',location:'São Paulo, SP',detail:'Entrega própria · 6 entregas hoje',status:'Ativa' },
  { id:'d3',kind:'Entregadores',name:'André Lima',email:'andre@email.com',phone:'(11) 97777-2003',location:'São Paulo, SP',detail:'Entrega ClickEat · documentos pendentes',status:'Em análise' },
];

@Injectable({ providedIn: 'root' })
export class ManagedAccountsService {
  readonly accounts = signal<ManagedAccount[]>(this.load());
  private load(): ManagedAccount[] { try { const saved = localStorage.getItem('clickeat.accounts'); return saved ? JSON.parse(saved) as ManagedAccount[] : SEED; } catch { return SEED; } }
  save(account: Omit<ManagedAccount, 'id'> & { id?: string }): void {
    const id = account.id ?? `a${Date.now()}`;
    this.accounts.update(current => { const index = current.findIndex(item => item.id === id); const next = [...current]; if (index < 0) next.unshift({ ...account, id }); else next[index] = { ...account, id }; this.persist(next); return next; });
  }
  remove(id: string): void { this.accounts.update(current => { const next = current.filter(account => account.id !== id); this.persist(next); return next; }); }
  private persist(accounts: ManagedAccount[]): void { try { localStorage.setItem('clickeat.accounts', JSON.stringify(accounts)); } catch { /* A sessão continua editável quando o armazenamento não está disponível. */ } }
}
