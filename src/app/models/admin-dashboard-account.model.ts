export type AdminDashboardEntity = 'Usuários' | 'Restaurantes' | 'Entregadores';
export type AdminDashboardAccountStatus = 'Ativa' | 'Em análise' | 'Pausada';

export interface AdminDashboardAccount {
  id: string;
  kind: AdminDashboardEntity;
  initial: string;
  name: string;
  detail: string;
  email: string;
  phone: string;
  location: string;
  joined: string;
  activity: string;
  status: AdminDashboardAccountStatus;
}
