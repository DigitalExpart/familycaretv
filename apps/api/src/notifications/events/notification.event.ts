export class NotificationEvent {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  scheduledAt?: Date;
  expiresAt?: Date;
  priority?: string;
  isInternal?: boolean;
}
