import { useState } from "react";
import { Icon } from "@iconify/react";
import { SettingsHeader } from "./SettingsHeader";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";

export function PersonalInformation() {
  const { profile, updateProfile } = useAppData();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error } = await updateProfile({ first_name: firstName, last_name: lastName, phone });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!profile) {
    return (
      <main className="w-full min-h-screen">
        <SettingsHeader title="Personal Information" />
      </main>
    );
  }

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <SettingsHeader title="Personal Information" />

      <div className="px-5 md:px-8 mt-6 max-w-lg">
        <form onSubmit={handleSave} className="card bg-card border border-border shadow-sm">
          <div className="card-body p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Email</label>
              <div className="input input-bordered w-full mt-1.5 bg-muted/40 border-transparent rounded-xl flex items-center text-muted-foreground">
                {user?.email}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Contact support to change the email on your account.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold">Member since</label>
              <div className="input input-bordered w-full mt-1.5 bg-muted/40 border-transparent rounded-xl flex items-center text-muted-foreground">
                {new Date(profile.member_since).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Member ID</label>
              <div className="input input-bordered w-full mt-1.5 bg-muted/40 border-transparent rounded-xl flex items-center text-muted-foreground font-mono">
                {profile.member_code}
              </div>
            </div>

            {error && (
              <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
            >
              {saving ? "Saving…" : saved ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="size-5" /> Saved
                </span>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
