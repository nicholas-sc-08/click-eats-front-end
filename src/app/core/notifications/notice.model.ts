export type NoticeKind = 'success' | 'info' | 'warning' | 'error';

export interface Notice {
  id: number;
  kind: NoticeKind;
  title: string;
  message: string;
}
