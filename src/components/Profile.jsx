import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./Sidebar";
import { Avatar, AVATAR_ICON_OPTIONS } from "./Avatar";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

const ACCOUNT_SETTINGS = [
  { icon: "solar:user-id-outline", label: "Personal Information", sub: "Update your name and view account details", to: "/profile/personal-information" },
  { icon: "solar:card-outline", label: "Payment Methods", sub: "Manage your saved cards and billing", to: "/profile/payment-methods" },
  { icon: "solar:bell-bing-outline", label: "Notifications", sub: "Choose what updates you want to receive", to: "/profile/notifications" },
];

const SUPPORT_SETTINGS = [
  { icon: "solar:question-circle-outline", label: "Help & Support", sub: "Get help with your account or orders", to: "/profile/help-support" },
  { icon: "solar:shield-warning-outline", label: "Privacy & Security", sub: "Manage your data and security settings", to: "/profile/privacy-security" },
];

export function Profile() {
  const navigate = useNavigate();
  const { profile, redemptions, updateProfile, uploadAvatar } = useAppData();
  const { signOut } = useAuth();
  const settingsSectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handlePickIcon = async (iconId) => {
    setShowAvatarPicker(false);
    setAvatarError("");
    const { error } = await updateProfile({ avatar_icon: iconId });
    if (error) setAvatarError(error.message);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;

    setAvatarError("");

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 2MB.");
      return;
    }

    setShowAvatarPicker(false);
    setUploading(true);
    const { error } = await uploadAvatar(file);
    setUploading(false);
    if (error) setAvatarError(error.message);
  };

  const memberSinceYear = profile?.member_since ? new Date(profile.member_since).getFullYear() : "—";

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
          <button
            type="button"
            onClick={() => settingsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="btn btn-circle btn-ghost btn-md bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
            aria-label="Jump to account settings"
          >
            <Icon icon="solar:settings-outline" className="size-6" />
          </button>
        </div>
      </header>

      <div className="px-5 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* ── Left: Avatar + Stats ── */}
          <div className="lg:col-span-4 space-y-8 lg:space-y-12">
            <section className="card bg-card border border-border shadow-md">
              <div className="card-body p-8 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {uploading ? (
                    <div className="size-32 rounded-full ring-4 ring-primary/20 ring-offset-4 shadow-md flex items-center justify-center bg-input">
                      <Icon icon="solar:crown-star-bold" className="size-8 text-primary animate-pulse" />
                    </div>
                  ) : (
                    <Avatar profile={profile} className="size-32 ring-4 ring-primary/20 ring-offset-4 shadow-md" />
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker((v) => !v)}
                    disabled={uploading}
                    className="btn btn-circle btn-primary btn-sm absolute bottom-0 right-0 shadow-md disabled:opacity-60"
                    aria-label="Change profile photo"
                  >
                    <Icon icon="solar:pen-outline" className="size-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelected}
                  />

                  {showAvatarPicker && (
                    <div className="absolute z-30 top-full mt-3 left-1/2 -translate-x-1/2 w-72 card bg-card border border-border shadow-xl">
                      <div className="card-body p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAvatarPicker(false);
                            fileInputRef.current?.click();
                          }}
                          className="btn btn-primary btn-sm w-full rounded-xl font-bold mb-4"
                        >
                          <Icon icon="solar:upload-outline" className="size-4" />
                          Upload a photo
                        </button>

                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Or choose an icon
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {AVATAR_ICON_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handlePickIcon(opt.id)}
                              className={`size-14 rounded-full flex items-center justify-center hover:ring-2 hover:ring-primary transition-all ${opt.bg}`}
                              aria-label={opt.id}
                            >
                              <Icon icon={opt.id} className={`size-7 ${opt.color}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {avatarError && (
                  <p className="text-xs font-semibold text-primary bg-primary/10 rounded-xl px-3 py-2 mb-4 max-w-xs">
                    {avatarError}
                  </p>
                )}

                <h2 className="text-2xl font-bold">{profile?.full_name || "—"}</h2>
                <p className="text-sm text-muted-foreground mt-1">{profile?.email || "—"}</p>
                <div className="badge badge-lg bg-accent/10 text-accent-foreground border-none font-bold mt-4 p-4 gap-2">
                  <Icon icon="solar:crown-star-outline" className="size-5 text-accent" />
                  {profile?.tier ?? "Gold"} Member Since {memberSinceYear}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="card bg-card border border-border shadow-sm hover:border-accent/30">
                <div className="card-body p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lifetime Points</p>
                  <p className="mt-2 text-3xl font-bold text-accent">
                    {(profile?.lifetime_points ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="card bg-card border border-border shadow-sm hover:border-primary/20">
                <div className="card-body p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rewards Claimed</p>
                  <p className="mt-2 text-3xl font-bold text-primary">{redemptions.length}</p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Right: Settings menus ── */}
          <div className="lg:col-span-8 space-y-12 lg:space-y-16" ref={settingsSectionRef}>

            <section>
              <h3 className="font-bold text-lg mb-4">Account Settings</h3>
              <div className="card bg-card border border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {ACCOUNT_SETTINGS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-input flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Icon icon={item.icon} className="size-6" />
                        </div>
                        <div className="text-left">
                          <span className="block text-base font-bold">{item.label}</span>
                          <span className="block text-sm text-muted-foreground mt-0.5">{item.sub}</span>
                        </div>
                      </div>
                      <Icon icon="solar:alt-arrow-right-outline" className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-4">Support & Privacy</h3>
              <div className="card bg-card border border-border shadow-sm overflow-hidden">
                <div className="divide-y divide-border">
                  {SUPPORT_SETTINGS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-input flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Icon icon={item.icon} className="size-6" />
                        </div>
                        <div className="text-left">
                          <span className="block text-base font-bold">{item.label}</span>
                          <span className="block text-sm text-muted-foreground mt-0.5">{item.sub}</span>
                        </div>
                      </div>
                      <Icon icon="solar:alt-arrow-right-outline" className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="pt-2 pb-8">
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-error btn-outline w-full md:w-auto px-10 rounded-xl font-bold"
              >
                <Icon icon="solar:logout-2-outline" className="size-5" />
                Log Out
              </button>
            </section>
          </div>

        </div>
      </div>

      <MobileNav />
    </main>
  );
}
