import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return `Today · ${new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  if (days === 1) return "Yesterday";
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function copyText(text, onDone) {
  try {
    await navigator.clipboard.writeText(text);
    onDone("Copied!");
  } catch {
    onDone("Copy failed — long-press to copy");
  }
  setTimeout(() => onDone(null), 2000);
}

export function Wallet() {
  const navigate = useNavigate();
  const { profile, vouchers, activity, useVoucher } = useAppData();
  const [copiedMsg, setCopiedMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const activeVouchers = vouchers.filter((v) => v.is_active);
  const referralCode = profile ? `${(profile.full_name || "MEMBER").split(" ")[0].toUpperCase()}-REWARD` : "";

  const handleShare = async () => {
    const shareData = {
      title: "LoyaltyApp",
      text: `${profile?.full_name ?? "I"} just shared my LoyaltyApp membership card. Member ID: ${profile?.member_code ?? ""}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled share — no-op */
      }
    } else {
      copyText(shareData.text, setCopiedMsg);
    }
  };

  const handleUseVoucher = async (id) => {
    setBusyId(id);
    const { error } = await useVoucher(id);
    setBusyId(null);
    if (error) alert(error.message);
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pass & Wallet</h1>
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-circle btn-ghost btn-md bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
            aria-label="Share membership card"
          >
            <Icon icon="solar:share-circle-outline" className="size-6" />
          </button>
        </div>
        {copiedMsg && <p className="text-xs font-semibold text-primary mt-2">{copiedMsg}</p>}
      </header>

      <div className="px-5 md:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── Left: Pass, Birthday, Vouchers ── */}
          <div className="space-y-10 lg:space-y-14">

            {/* Membership pass — dark card */}
            <section className="card bg-dark text-white shadow-xl relative overflow-hidden">
              <div className="card-body p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                      {profile?.tier ?? "Gold"} Tier Member
                    </span>
                    <p className="mt-1 text-xl font-bold">{profile?.full_name ?? "Member"}</p>
                  </div>
                  <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-accent">
                    <Icon icon="solar:crown-line-duotone" className="size-7" />
                  </div>
                </div>

                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-sm font-medium text-white/60">Points balance</span>
                    <p className="text-4xl font-bold text-white mt-1">
                      {(profile?.points_balance ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-white/60">Member ID</span>
                    <p className="font-mono text-base font-semibold text-white/90 mt-1">
                      {profile?.member_code ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Barcode */}
                <div className="rounded-2xl bg-white p-5 text-center">
                  <div className="flex h-16 w-full items-stretch justify-center gap-1 py-1 px-4">
                    {[1.5,0.5,2.5,1.5,1,2,1,2.5,0.5,2,1,0.5,2.5,1.5,0.5,2,2.5,1,0.5,2.5,1.5,0.5].map((w, i) => (
                      <div key={i} className="bg-dark" style={{ width: `${w * 4}px` }} />
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground">
                    SCAN AT CHECKOUT
                  </p>
                </div>
              </div>
            </section>

            {/* Birthday perk */}
            <section className="card bg-accent/10 border border-accent/30 shadow-sm">
              <div className="card-body p-6 flex-row items-center gap-5">
                <div className="size-14 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon icon="solar:gift-bold" className="size-7 text-accent" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    Upcoming perk
                  </span>
                  <p className="text-lg font-bold mt-1">Birthday Free Specialty Drink</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Auto-applied during your birthday month</p>
                </div>
                <span className="badge bg-accent text-accent-foreground border-none font-bold py-3 px-4 hidden sm:inline-flex">
                  Auto-claim
                </span>
              </div>
            </section>

            {/* Voucher codes */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Active voucher codes</h2>
                <span className="badge bg-primary/10 text-primary border-none font-bold">
                  {activeVouchers.length} Active
                </span>
              </div>
              {activeVouchers.length === 0 ? (
                <div className="card bg-card border border-border shadow-sm">
                  <div className="card-body p-6 text-sm text-muted-foreground">
                    No active vouchers right now. Redeem a reward to unlock one.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeVouchers.map((v, i) => (
                    <div key={v.id} className="card bg-card border border-border shadow-sm hover:shadow-md">
                      <div className="card-body p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${i % 2 === 0 ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                              <Icon icon="solar:ticket-sale-outline" className="size-6" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-bold truncate">{v.title}</p>
                              <p className="font-mono text-sm font-bold text-muted-foreground mt-0.5">{v.code}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => copyText(v.code, setCopiedMsg)}
                              className={`btn btn-sm btn-outline w-full sm:w-auto ${i % 2 === 0 ? "btn-primary" : "btn-accent"}`}
                            >
                              Copy code
                            </button>
                            <button
                              type="button"
                              disabled={busyId === v.id}
                              onClick={() => handleUseVoucher(v.id)}
                              className={`btn btn-sm w-full sm:w-auto ${i % 2 === 0 ? "btn-primary" : "btn-accent"} disabled:opacity-60`}
                            >
                              {busyId === v.id ? "…" : "Mark used"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right: Referral, History, How to earn ── */}
          <div className="space-y-10 lg:space-y-14">

            {/* Referral */}
            <section className="card bg-card border border-border shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon icon="solar:users-group-two-rounded-outline" className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Invite friends, earn 500 points</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      They get a free drink on their first order, and you get rewarded too.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 rounded-xl bg-input px-4 py-3 font-mono text-sm font-bold text-center text-foreground border border-border/50">
                    {referralCode || "—"}
                  </div>
                  <button type="button" onClick={handleShare} className="btn btn-primary w-full sm:w-auto">
                    Share link
                  </button>
                </div>
              </div>
            </section>

            {/* Points history */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Points history</h2>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
                >
                  Full history
                </button>
              </div>
              <div className="card bg-card border border-border shadow-sm overflow-hidden">
                {activity.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">No points activity yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {activity.slice(0, 6).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-5 hover:bg-muted/10 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold leading-snug">{entry.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {timeAgo(entry.created_at)} · {entry.kind === "redeem" ? "Spent" : entry.kind === "bonus" ? "Bonus" : "Earned"}
                          </p>
                        </div>
                        <span
                          className={`self-start sm:self-center text-sm font-bold px-3 py-1.5 rounded-full shrink-0 ${
                            entry.points_delta >= 0 ? "text-accent bg-accent/10" : "text-primary bg-primary/10"
                          }`}
                        >
                          {entry.points_delta >= 0 ? "+" : ""}{entry.points_delta} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* How to earn */}
            <section className="card bg-muted/30 border border-border shadow-sm">
              <div className="card-body p-6">
                <h2 className="font-bold text-lg mb-4">How to earn points</h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                  {[
                    "Earn 10 points for every ₦100 spent in-store or online",
                    "Bring your own tumbler for +50 bonus points",
                    "Order ahead via mobile app for 1.5× points",
                  ].map((tip) => (
                    <div key={tip} className="flex items-start gap-3">
                      <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="size-2 rounded-full bg-primary" />
                      </div>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
