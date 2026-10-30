import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  template: `
    <div class="notice-viewport" aria-live="polite" aria-atomic="true">
      @if (notifications.current(); as notice) {
        <section class="notice-card" [class]="'notice-card ' + notice.kind" animate.enter="notice-enter" animate.leave="notice-exit" [attr.role]="notice.kind === 'error' ? 'alert' : 'status'">
          <span class="notice-icon" aria-hidden="true">
            @switch (notice.kind) {
              @case ('success') { <svg viewBox="0 0 32 32"><circle class="check-ring" cx="16" cy="16" r="13"/><path class="check-mark" d="m9 16 4.5 4.5L23 11"/></svg> }
              @case ('info') { <svg viewBox="0 0 32 32"><circle class="icon-outline" cx="16" cy="16" r="12"/><path class="icon-mark info-mark" d="M16 14v8"/><circle class="icon-dot" cx="16" cy="10" r="1.3"/></svg> }
              @case ('warning') { <svg viewBox="0 0 32 32"><path class="icon-outline warning-outline" d="M16 4.5 29 27H3L16 4.5Z"/><path class="icon-mark warning-mark" d="M16 12v7"/><circle class="icon-dot" cx="16" cy="23" r="1.2"/></svg> }
              @case ('error') { <svg viewBox="0 0 32 32"><circle class="icon-outline" cx="16" cy="16" r="12"/><path class="icon-mark error-mark" d="m12 12 8 8m0-8-8 8"/></svg> }
            }
          </span>
          <span class="notice-copy"><strong>{{ notice.title }}</strong><span>{{ notice.message }}</span></span>
          <button class="notice-close" type="button" aria-label="Fechar aviso" (click)="notifications.dismiss()">×</button>
          <span class="notice-progress" aria-hidden="true"></span>
        </section>
      }
    </div>
  `,
  styleUrl: './notification-toast.component.css',
})
export class NotificationToastComponent {
  readonly notifications = inject(NotificationService);
}
