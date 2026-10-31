import { Component, input, output, signal } from '@angular/core';
import { AdminDashboardAccount } from '../../models/admin-dashboard-account.model';

type DialogView = 'details' | 'password-setup' | 'password-complete';

@Component({
  selector: 'app-admin-account-details-dialog',
  standalone: true,
  template: `
    <div class="account-details-overlay" [class.closing]="closing()" (click)="close()">
      <section
        class="account-details-dialog"
        [class.closing]="closing()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="view() === 'details' ? 'account-details-title' : 'account-access-title'"
        (click)="$event.stopPropagation()"
      >
        <button class="details-close" type="button" aria-label="Fechar detalhes" (click)="close()">×</button>

        @if (view() === 'details') {
          <div class="account-details-content">
            <header class="account-profile-header">
              <span class="account-profile-avatar">{{ account().initial }}</span>
              <div class="account-profile-copy">
                <div class="account-profile-eyebrow">{{ account().kind }} · DETALHES DO CADASTRO</div>
                <h2 id="account-details-title">{{ account().name }}</h2>
                <p>{{ account().detail }}</p>
              </div>
              <span class="account-profile-status" [class.pending]="status() === 'Em análise'" [class.paused]="status() === 'Pausada'">
                <i></i>{{ status() }}
              </span>
            </header>

            <section class="account-information" aria-labelledby="account-information-title">
              <div class="details-section-heading">
                <span class="details-section-icon" aria-hidden="true">⌑</span>
                <div><h3 id="account-information-title">Informações de cadastro</h3><p>Dados registrados nesta demonstração.</p></div>
              </div>
              <dl class="account-information-grid">
                <div><dt>E-mail</dt><dd>{{ account().email }}</dd></div>
                <div><dt>Telefone</dt><dd>{{ account().phone }}</dd></div>
                <div><dt>Localidade</dt><dd>{{ account().location }}</dd></div>
                <div><dt>Data de cadastro</dt><dd>{{ account().joined }}</dd></div>
                <div><dt>Atividade recente</dt><dd>{{ account().activity }}</dd></div>
                <div><dt>Situação da conta</dt><dd>{{ status() }}</dd></div>
              </dl>
            </section>

            @if (account().kind === 'Usuários') {
              <section class="account-access-section" aria-labelledby="account-access-heading">
                <div class="details-section-heading">
                  <span class="details-section-icon access-icon" aria-hidden="true">♙</span>
                  <div><h3 id="account-access-heading">Acesso e recuperação</h3><p>Opções demonstrativas para recuperar o acesso do cliente.</p></div>
                </div>

                <div class="account-access-actions">
                  <button class="access-action temporary-action" type="button" (click)="generateTemporaryPassword()">
                    <span class="access-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5zM12 14v2"/></svg></span>
                    <span><b>Gerar senha temporária</b><small>Crie uma senha provisória para a demonstração.</small></span>
                    <span class="access-action-arrow" aria-hidden="true">→</span>
                  </button>
                  <button class="access-action invite-action" type="button" (click)="prepareInvite()">
                    <span class="access-action-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span>
                    <span><b>Preparar convite de acesso</b><small>{{ invitePrepared() ? 'Convite de demonstração preparado.' : 'O cliente define uma nova senha ao acessar.' }}</small></span>
                    <span class="access-action-arrow" aria-hidden="true">→</span>
                  </button>
                </div>

                @if (temporaryPassword()) {
                  <div class="temporary-password-result" role="status">
                    <div class="temporary-password-copy"><span>Senha temporária de demonstração</span><code>{{ temporaryPassword() }}</code></div>
                    <button type="button" class="copy-password-button" (click)="copyTemporaryPassword()">Copiar</button>
                    <p>Não altera uma credencial real. A geração segura será feita pelo backend.</p>
                  </div>
                }

                @if (invitePrepared()) {
                  <div class="invite-preview" role="status">
                    <span class="invite-preview-check" aria-hidden="true">✓</span>
                    <div><b>Prévia do convite pronta</b><small>O envio por e-mail será conectado ao backend.</small></div>
                    <button type="button" (click)="openPasswordSetup()">Ver etapa de nova senha</button>
                  </div>
                }
              </section>
            }

            <footer class="account-details-footer">
              <button class="account-status-action" type="button" (click)="statusToggle.emit()">
                {{ status() === 'Ativa' ? 'Sinalizar para análise' : 'Reativar conta' }}
              </button>
              <p>Contas e credenciais são dados de demonstração neste protótipo.</p>
            </footer>
          </div>
        } @else if (view() === 'password-setup') {
          <div class="password-setup-content">
            <button class="dialog-back-link" type="button" (click)="view.set('details')">← Voltar aos detalhes</button>
            <span class="password-setup-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5zM12 14v2"/></svg></span>
            <div class="account-profile-eyebrow">PRÉVIA DO CONVITE</div>
            <h2 id="account-access-title">Crie uma nova senha</h2>
            <p class="password-setup-description">Olá, {{ account().name.split(' ')[0] }}. Para acessar sua conta, escolha uma nova senha.</p>
            <form class="password-setup-form" (submit)="$event.preventDefault(); submitPasswordSetup()">
              <label>Nova senha<input required minlength="8" autocomplete="new-password" type="password" [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" placeholder="Pelo menos 8 caracteres"></label>
              <label>Confirmar nova senha<input required minlength="8" autocomplete="new-password" type="password" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" placeholder="Digite a senha novamente"></label>
              @if (passwordError()) { <p class="password-form-error" role="alert">{{ passwordError() }}</p> }
              <button class="password-submit" type="submit">Salvar nova senha</button>
              <small class="password-demo-note">Prévia de interface · a senha não será salva nem alterada neste protótipo.</small>
            </form>
          </div>
        } @else {
          <div class="password-complete-content">
            <span class="password-complete-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7"/></svg></span>
            <div class="account-profile-eyebrow">PRÉVIA CONCLUÍDA</div>
            <h2 id="account-access-title">Nova senha validada</h2>
            <p>A etapa foi simulada com sucesso. Nenhuma credencial real foi alterada.</p>
            <button class="password-submit" type="button" (click)="view.set('details')">Voltar aos detalhes</button>
          </div>
        }
      </section>
    </div>
  `,
  styleUrl: './admin-account-details-dialog.component.css',
})
export class AdminAccountDetailsDialogComponent {
  readonly account = input.required<AdminDashboardAccount>();
  readonly status = input.required<string>();
  readonly closed = output<void>();
  readonly statusToggle = output<void>();

  readonly view = signal<DialogView>('details');
  readonly closing = signal(false);
  readonly temporaryPassword = signal('');
  readonly invitePrepared = signal(false);
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly passwordError = signal('');

  close(): void {
    if (this.closing()) return;

    this.closing.set(true);
    window.setTimeout(() => this.closed.emit(), 220);
  }

  generateTemporaryPassword(): void {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
    const randomValues = new Uint32Array(14);
    window.crypto.getRandomValues(randomValues);
    this.temporaryPassword.set(Array.from(randomValues, value => alphabet[value % alphabet.length]).join(''));
  }

  async copyTemporaryPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.temporaryPassword());
    } catch {
      // Clipboard access can be unavailable in insecure contexts or restricted browsers.
    }
  }

  prepareInvite(): void {
    this.invitePrepared.set(true);
  }

  openPasswordSetup(): void {
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordError.set('');
    this.view.set('password-setup');
  }

  submitPasswordSetup(): void {
    if (this.newPassword().length < 8) {
      this.passwordError.set('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('As senhas não correspondem. Confira e tente novamente.');
      return;
    }

    this.passwordError.set('');
    this.view.set('password-complete');
  }
}
