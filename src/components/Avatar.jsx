import { Icon } from "@iconify/react";

// Preset icon avatars — used wherever a profile picture would otherwise show.
export const AVATAR_ICON_OPTIONS = [
  { id: "solar:cat-bold", bg: "bg-primary/15", color: "text-primary" },
  { id: "solar:crown-star-bold", bg: "bg-accent/15", color: "text-accent" },
  { id: "solar:star-bold", bg: "bg-amber-500/15", color: "text-amber-500" },
  { id: "solar:fire-bold", bg: "bg-orange-500/15", color: "text-orange-500" },
  { id: "solar:leaf-bold", bg: "bg-emerald-500/15", color: "text-emerald-500" },
  { id: "solar:moon-stars-bold", bg: "bg-indigo-500/15", color: "text-indigo-500" },
  { id: "solar:bolt-bold", bg: "bg-sky-500/15", color: "text-sky-500" },
  { id: "solar:heart-bold", bg: "bg-rose-500/15", color: "text-rose-500" },
  { id: "solar:cup-star-bold", bg: "bg-violet-500/15", color: "text-violet-500" },
];

export function iconStyleFor(iconId) {
  return AVATAR_ICON_OPTIONS.find((o) => o.id === iconId) || AVATAR_ICON_OPTIONS[0];
}

// Renders either the user's uploaded photo or their chosen icon avatar.
// Never falls back to a stock human photo.
// `className` should include sizing (e.g. "size-12") plus any ring/shadow
// styling the caller wants — it's applied as-is, nothing is baked in here.
export function Avatar({ profile, className = "size-12" }) {
  if (profile?.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile?.full_name || "Profile photo"}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  const style = iconStyleFor(profile?.avatar_icon);
  return (
    <div
      className={`${className} aspect-square rounded-full flex items-center justify-center ${style.bg}`}
    >
      <Icon icon={style.id} className={`${style.color}`} style={{ width: "55%", height: "55%" }} />
    </div>
  );
}
