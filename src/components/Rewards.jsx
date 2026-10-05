import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";

const CATEGORIES = [
  { key: "all", label: "All", icon: "solar:cup-star-outline" },
  { key: "drinks", label: "Drinks", icon: "solar:cup-paper-outline" },
  { key: "food", label: "Food", icon: "solar:donut-outline" },
  { key: "discounts", label: "Discounts", icon: "solar:ticket-sale-outline" },
];

export function Rewards() {
  const { profile, rewards, vouchers, redeemReward, useVoucher } = useAppData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const points = profile?.points_balance ?? 0;
  const featured = rewards.find((r) => r.is_featured);
  const activeVoucher = vouchers.find((v) => v.is_active);

  const filtered = useMemo(() => {
    return rewards.filter((r) => {
      if (r.is_featured) return false;
      const matchesCategory = activeCategory === "all" || r.category === activeCategory;
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [rewards, activeCategory, search]);

  const quickSips = filtered.filter((r) => r.points_cost < 500);
  const signatureTreats = filtered.filter((r) => r.points_cost >= 500 && r.points_cost <= 1500);
  const bigTreats = filtered.filter((r) => r.points_cost > 1500);

  const favoriteRewards = rewards.filter((r) => favorites.includes(r.id));

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleRedeem = async (rewardId) => {
    setBusyId(rewardId);
    const { error } = await redeemReward(rewardId);
    setBusyId(null);
    if (error) alert(error.message);
  };

  const handleUseVoucher = async () => {
    if (!activeVoucher) return;
    setBusyId(activeVoucher.id);
    const { error } = await useVoucher(activeVoucher.id);
    setBusyId(null);
    if (error) alert(error.message);
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rewards</h1>
            <span className="badge badge-lg bg-primary/10 text-primary border-none font-bold px-4">
              {points.toLocaleString()} pts
            </span>
          </div>

          <div className="relative w-full md:w-[400px]">
            <Icon
              icon="streamline-sharp:magnifying-glass"
              className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search treats, discounts & perks..."
              className="input input-bordered w-full pl-12 bg-input border-transparent focus:border-primary rounded-full"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-5 grid grid-cols-4 gap-2 md:gap-3">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`btn btn-sm md:btn-md w-full flex-col md:flex-row gap-1.5 rounded-2xl py-3 md:py-2 font-semibold transition-all ${
                activeCategory === key
                  ? "bg-dark text-white hover:bg-dark/90 border-none shadow-sm"
                  : "bg-card text-foreground border border-border hover:border-primary/30 hover:text-primary shadow-sm"
              }`}
            >
              <Icon icon={icon} className="size-4 md:size-[18px] shrink-0" />
              <span className="text-[10px] md:text-sm leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 md:px-8 mt-6 space-y-16 lg:space-y-24">

        {/* ── Featured + Goal side-by-side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featured && (
            <section className="lg:col-span-2 rounded-[1.5rem] bg-gradient-to-br from-primary to-[#D64545] p-6 md:p-8 text-white shadow-lg flex flex-col justify-between">
              <div>
                <span className="badge border-white/30 bg-white/20 text-white font-bold uppercase tracking-wider mb-4 px-4 py-3">
                  {featured.badge_label || "Featured this week"}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{featured.title}</h2>
                <p className="mt-2 text-sm md:text-base text-white/85 max-w-md">{featured.description}</p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-2xl md:text-3xl font-bold">{featured.points_cost.toLocaleString()} pts</span>
                <button
                  type="button"
                  disabled={points < featured.points_cost || busyId === featured.id}
                  onClick={() => handleRedeem(featured.id)}
                  className="btn bg-white text-primary hover:bg-white/90 border-none rounded-xl px-6 font-bold shadow-md disabled:opacity-60"
                >
                  {busyId === featured.id ? "Unlocking…" : points < featured.points_cost ? "Not enough points" : "Unlock now"}
                </button>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-6">
            <section className="card bg-card border border-border shadow-sm">
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Next milestone
                  </span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    {Math.max(3000 - points, 0).toLocaleString()} pts to go
                  </span>
                </div>
                <h3 className="font-bold text-lg leading-snug mt-1">Free Premium Beverage</h3>
                <progress
                  className="progress progress-primary w-full mt-4 bg-input"
                  value={Math.min(Math.round((points / 3000) * 100), 100)}
                  max="100"
                ></progress>
                <div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>{points.toLocaleString()} pts</span>
                  <span>Goal: 3,000 pts</span>
                </div>
              </div>
            </section>

            {activeVoucher && (
              <section className="card bg-accent/10 border border-accent/30 shadow-sm">
                <div className="card-body p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="solar:clock-circle-bold" className="size-4 text-accent" />
                    <span className="text-sm font-bold text-accent-foreground">
                      {activeVoucher.expires_at
                        ? `Expires ${new Date(activeVoucher.expires_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                        : "Active voucher"}
                    </span>
                  </div>
                  <p className="text-base font-bold text-foreground">{activeVoucher.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">Auto-applied voucher in wallet</p>
                  <button
                    type="button"
                    disabled={busyId === activeVoucher.id}
                    onClick={handleUseVoucher}
                    className="btn btn-accent btn-sm mt-4 font-bold rounded-lg disabled:opacity-60"
                  >
                    {busyId === activeVoucher.id ? "Applying…" : "Use today"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ── Saved favorites + Browse ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-20">

          <section className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-5">Saved favorites</h2>
            {favoriteRewards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tap the heart on any reward below to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {favoriteRewards.map((item) => (
                  <div key={item.id} className="card bg-card border border-border shadow-sm hover:border-primary/30 cursor-pointer group">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="badge bg-primary/10 text-primary border-none font-bold">
                          {item.points_cost.toLocaleString()} pts
                        </span>
                        <button type="button" onClick={() => toggleFavorite(item.id)} aria-label="Remove favorite">
                          <Icon icon="solar:heart-bold" className="size-5 text-primary group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <button
                        type="button"
                        disabled={points < item.points_cost || busyId === item.id}
                        onClick={() => handleRedeem(item.id)}
                        className="btn btn-sm mt-5 w-full bg-muted text-foreground hover:bg-primary hover:text-white border-none font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        {busyId === item.id ? "Redeeming…" : "Redeem"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-span-3 space-y-12 lg:space-y-16">
            <h2 className="text-xl font-bold">Browse by points</h2>

            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No rewards match your search.</p>
            )}

            {quickSips.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Quick sips — Under 500 pts
                </h3>
                <RewardRow items={quickSips} points={points} busyId={busyId} onRedeem={handleRedeem} favorites={favorites} onToggleFavorite={toggleFavorite} />
              </div>
            )}

            {signatureTreats.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Signature treats — 500 to 1,500 pts
                </h3>
                <RewardRow items={signatureTreats} points={points} busyId={busyId} onRedeem={handleRedeem} favorites={favorites} onToggleFavorite={toggleFavorite} />
              </div>
            )}

            {bigTreats.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Big treats — Over 1,500 pts
                </h3>
                <RewardRow items={bigTreats} points={points} busyId={busyId} onRedeem={handleRedeem} favorites={favorites} onToggleFavorite={toggleFavorite} />
              </div>
            )}
          </section>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}

function RewardRow({ items, points, busyId, onRedeem, favorites, onToggleFavorite }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div key={item.id} className="card bg-card border border-border shadow-sm hover:shadow-md">
          <div className="card-body p-5 flex-row items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon icon={item.icon || "solar:cup-star-outline"} className="size-6 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold truncate">{item.title}</p>
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                aria-label="Toggle favorite"
                className="btn btn-circle btn-ghost btn-sm"
              >
                <Icon
                  icon={favorites.includes(item.id) ? "solar:heart-bold" : "solar:heart-outline"}
                  className={`size-5 ${favorites.includes(item.id) ? "text-primary" : "text-muted-foreground"}`}
                />
              </button>
              <button
                type="button"
                disabled={points < item.points_cost || busyId === item.id}
                onClick={() => onRedeem(item.id)}
                className="btn btn-primary rounded-xl px-4 disabled:opacity-50"
              >
                {busyId === item.id ? "…" : `${item.points_cost.toLocaleString()} pts`}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
