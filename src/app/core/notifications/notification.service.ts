import { Injectable, signal } from '@angular/core';
import { Notice, NoticeKind } from './notice.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly current = signal<Notice | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private nextId = 0;

  success(message: string): void { this.show('success', message); }
  info(message: string): void { this.show('info', message); }
  warning(message: string): void { this.show('warning', message); }
  error(message: string): void { this.show('error', message); }

  dismiss(): void {
    clearTimeout(this.timeoutId);
    this.current.set(null);
  }

  private show(kind: NoticeKind, message: string): void {
    clearTimeout(this.timeoutId);
    const id = ++this.nextId;
    const titleByKind: Record<NoticeKind, string> = {
      success: 'Tudo certo',
      info: 'Só para você saber',
      warning: 'Atenção',
      error: 'Não foi possível concluir',
    };

    this.current.set({ id, kind, title: titleByKind[kind], message });
    this.timeoutId = setTimeout(() => {
      if (this.current()?.id === id) this.current.set(null);
    }, 4600);
  }
}
