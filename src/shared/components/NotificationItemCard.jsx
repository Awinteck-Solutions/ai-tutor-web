import { Bell, BellRing, Check } from 'lucide-react';
import { AdesiaBadge } from './AdesiaBadge';
import { formatDateTime } from '../utils/formatters';

const NotificationItemCard = ({ notification, onMarkRead }) => {
  const id = notification.id || notification._id;
  const isUnread = !notification.read;
  const message = notification.message || notification.body || 'No message provided.';

  return (
    <article
      className={`rounded-xl border p-4 transition ${
        isUnread
          ? 'border-primary/25 bg-primary/[0.06] shadow-sm'
          : 'border-border/50 bg-card/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isUnread ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {isUnread ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="font-display text-sm font-semibold leading-snug text-foreground">
              {notification.title || 'Notification'}
            </h4>
            <AdesiaBadge status={isUnread ? 'active' : 'draft'}>
              {isUnread ? 'Unread' : 'Read'}
            </AdesiaBadge>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {formatDateTime(notification.createdAt)}
          </p>
        </div>
      </div>

      {isUnread && onMarkRead && (
        <button
          type="button"
          onClick={() => onMarkRead(id)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:border-primary/35 hover:bg-primary/5 sm:w-auto"
        >
          <Check className="h-3.5 w-3.5" />
          Mark as read
        </button>
      )}
    </article>
  );
};

export default NotificationItemCard;
