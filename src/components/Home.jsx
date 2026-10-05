import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./Sidebar";
import { Avatar } from "./Avatar";
import { useAppData } from "../context/AppDataContext";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Today, ${new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function Home() {
  const navigate = useNavigate();
  const { profile, rewards, activity, notifications, redeemReward } = useAppData();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const points = profile?.points_balance ?? 0;
  const nextGoal = 3000;
  const toNextTier = Math.max(nextGoal - points, 0);
  const progressPct = Math.min(Math.round((points / nextGoal) * 100), 100);

  const featured = rewards.find((r) => r.is_featured);
  const highlightRewards = rewards.filter((r) => !r.is_featured).slice(0, 2);

  const handleRedeem = async (rewardId) => {
    const { error } = await redeemReward(rewardId);
    if (error) alert(error.message);
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar profile={profile} className="size-12 md:size-14 ring-2 ring-primary/20 shadow-sm" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Good day,</p>
              <p className="text-xl md:text-2xl font-semibold tracking-tight">
                {profile?.full_name || "there"} <span className="ml-1 text-accent">✦</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
            className="btn btn-circle btn-ghost btn-md relative border border-border bg-card shadow-sm hover:shadow-md"
          >
            <Icon icon="solar:bell-outline" className="size-6 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
            )}
          </button>
        </div>
      </header>

      <div className="px-5 md:px-8 mt-6 space-y-16 lg:space-y-24">
        {/* ── Points banner ── */}
        <section className="rounded-3xl bg-gradient-to-br from-primary to-[#D64545] p-6 md:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <Icon icon="solar:crown-star-bold" className="size-64 -mr-16 -mt-16" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80 mb-2">
                Available points
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl md:text-6xl font-bold leading-none tracking-tight">
                  {points.toLocaleString()}
                </p>
                <span className="text-lg font-medium text-white/80">pts</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span className="badge badge-outline border-white/40 bg-white/10 text-white py-3 px-4 font-bold">
                  {profile?.tier ?? "Gold"} Member
                </span>
                <span className="font-medium">
                  {toNextTier > 0 ? `${toNextTier.toLocaleString()} pts to Platinum` : "Platinum unlocked!"}
                </span>
              </div>
            </div>

            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => navigate("/wallet")}
                className="btn bg-white hover:bg-white/90 text-primary border-none shadow-md hover:shadow-lg rounded-2xl h-14"
                aria-label="Show barcode to earn points"
              >
                <Icon icon="solar:qr-code-outline" className="size-6" />
                Scan to earn
              </button>
              <div className="bg-black/10 rounded-2xl p-4 border border-white/10">
                <div className="mb-2 flex justify-between text-xs font-semibold text-white/90">
                  <span>Progress to Platinum</span>
                  <span>{progressPct}%</span>
                </div>
                <progress className="progress bg-black/20 w-full" value={progressPct} max="100" style={{ '--progress-color': 'white' }}></progress>
              </div>
            </div>
          </div>
        </section>

        {/* ── Your Rewards ── */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Your Rewards</h2>
            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured && (
              <div className="card bg-card border border-border shadow-sm hover:border-accent/30 cursor-pointer">
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Icon icon={featured.icon || "solar:crown-star-outline"} className="size-8 text-accent" />
                    </div>
                    <span className="badge border-none bg-accent/10 text-accent-foreground font-bold py-3 px-3">
                      {featured.badge_label || "Exclusive"}
                    </span>
                  </div>
                  <h3 className="card-title text-lg">{featured.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 flex-grow">
                    {featured.description}
                  </p>
                  <div className="card-actions mt-auto">
                    <button
                      type="button"
                      onClick={() => navigate("/rewards")}
                      className="btn btn-primary w-full"
                    >
                      View reward
                    </button>
                  </div>
                </div>
              </div>
            )}

            {highlightRewards.map((reward) => (
              <div key={reward.id} className="card bg-card border border-border shadow-sm hover:border-primary/20 cursor-pointer">
                <div className="card-body p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon icon={reward.icon || "solar:cup-star-outline"} className="size-8 text-primary" />
                    </div>
                    <span className="badge border-none bg-primary/10 text-primary font-bold py-3 px-3">
                      {reward.points_cost.toLocaleString()} points
                    </span>
                  </div>
                  <h3 className="card-title text-lg">{reward.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 flex-grow">{reward.description}</p>
                  <div className="card-actions mt-auto">
                    <button
                      type="button"
                      disabled={points < reward.points_cost}
                      onClick={() => handleRedeem(reward.id)}
                      className="btn btn-dark w-full disabled:opacity-50"
                    >
                      {points < reward.points_cost ? "Not enough points" : "Redeem now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Two-column: Earn more / Recent activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Earn more points</h2>
              <button
                type="button"
                onClick={() => navigate("/rewards")}
                className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
              >
                Explore
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => navigate("/rewards")}
                className="card bg-card border border-border shadow-sm hover:border-primary/30 cursor-pointer group text-left"
              >
                <div className="card-body p-5">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon icon="solar:cart-large-2-outline" className="size-6 text-primary" />
                  </div>
                  <h4 className="mt-4 text-base font-bold">Shop this week</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-snug">Earn 2× points on jollof combos</p>
                  <span className="mt-4 block text-sm font-bold text-primary">+200 pts</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/wallet")}
                className="card bg-card border border-border shadow-sm hover:border-accent/40 cursor-pointer group text-left"
              >
                <div className="card-body p-5">
                  <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon icon="solar:users-group-rounded-outline" className="size-6 text-accent" />
                  </div>
                  <h4 className="mt-4 text-base font-bold">Invite a friend</h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-snug">You both get a bonus</p>
                  <span className="mt-4 block text-sm font-bold text-accent">+500 pts</span>
                </div>
              </button>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Recent activity</h2>
              <button
                type="button"
                onClick={() => navigate("/wallet")}
                className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
              >
                View all
              </button>
            </div>
            <div className="card bg-card border border-border shadow-sm overflow-hidden">
              {activity.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No activity yet — go redeem something!</div>
              ) : (
                <div className="divide-y divide-border">
                  {activity.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors">
                      <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${entry.points_delta >= 0 ? "bg-accent/10" : "bg-muted"}`}>
                        <Icon
                          icon={entry.points_delta >= 0 ? "solar:cup-star-bold" : "solar:gift-bold"}
                          className={`size-6 ${entry.points_delta >= 0 ? "text-accent" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold truncate">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{timeAgo(entry.created_at)}</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${entry.points_delta >= 0 ? "text-accent bg-accent/10" : "text-primary bg-primary/10"}`}>
                        {entry.points_delta >= 0 ? "+" : ""}{entry.points_delta}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      <MobileNav />
    </main>
  );
}
