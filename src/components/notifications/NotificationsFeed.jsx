import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsFeed() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="btn btn-circle btn-ghost btn-md border border-border bg-card shadow-sm"
            >
              <Icon icon="solar:arrow-left-outline" className="size-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="px-5 md:px-8 mt-6 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="card bg-card border border-border shadow-sm">
            <div className="card-body p-10 items-center text-center">
              <Icon icon="solar:bell-outline" className="size-10 text-muted-foreground mb-2" />
              <p className="font-bold">You're all caught up</p>
              <p className="text-sm text-muted-foreground mt-1">No notifications yet.</p>
            </div>
          </div>
        ) : (
          <div className="card bg-card border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.is_read && markNotificationRead(n.id)}
                  className={`w-full text-left flex items-start gap-4 p-5 transition-colors hover:bg-muted/20 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon icon="solar:bell-bold" className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm md:text-base">{n.title}</p>
                      {!n.is_read && <span className="size-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
