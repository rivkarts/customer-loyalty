import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, resolveBackendFileUrl } from "../lib/apiClient";
import { useAuth } from "./AuthContext";
import { demoPaymentMethods, makeDemoNotificationPrefs } from "../data/demoData";

const AppDataContext = createContext(undefined);

/* ============================================================
   NOTE ON BACKEND COVERAGE
   The MongoDB backend currently has real routes for: auth/profile,
   products, purchases, points history, and rewards/redemption.
   It has NO routes yet for: vouchers, payment methods, notifications,
   notification preferences, or support tickets. Those stay as local,
   in-memory state below (clearly marked) so the screens don't crash —
   nothing in those sections is actually saved to the backend yet.
   ============================================================ */

function mapUserToProfile(user) {
  if (!user) return null;

  // avatarUrl is either "icon:<iconify-id>" (a preset) or an uploaded
  // file path like "/uploads/avatars/xyz.jpg" — tell them apart here.
  const isIconAvatar = user.avatarUrl?.startsWith("icon:");

  return {
    id: user.id,
    full_name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar_icon: isIconAvatar ? user.avatarUrl.slice("icon:".length) : null,
    avatar_url: isIconAvatar ? null : resolveBackendFileUrl(user.avatarUrl),
    points_balance: user.pointsBalance ?? 0,
    // The backend doesn't track tiers or lifetime points separately yet —
    // lifetime_points currently mirrors the live balance as the closest
    // available stand-in, and tier is a static placeholder until that's built.
    lifetime_points: user.pointsBalance ?? 0,
    tier: "Member",
    member_since: user.createdAt,
    member_code: user.id ? `#${user.id.slice(-8).toUpperCase()}` : null,
  };
}

function mapReward(reward) {
  return {
    id: reward._id,
    title: reward.name,
    description: reward.description,
    category: "rewards",
    points_cost: reward.pointsRequired,
    icon: "solar:gift-outline",
    badge_label: null,
    is_featured: false,
    quantity: reward.quantity,
  };
}

export function AppDataProvider({ children }) {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [activity, setActivity] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // These have no backend support yet — kept local-only so the UI still works.
  const [vouchers, setVouchers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState(demoPaymentMethods);
  const [notificationPrefs, setNotificationPrefs] = useState(makeDemoNotificationPrefs);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setProfile(mapUserToProfile(user));
  }, [user]);

  const refreshProfile = useCallback(async () => {
    const freshUser = await refreshUser();
    setProfile(mapUserToProfile(freshUser));
  }, [refreshUser]);

  const refreshRewards = useCallback(async () => {
    try {
      const res = await apiRequest("/rewards/getRewards");
      setRewards((res.data.rewards || []).map(mapReward));
    } catch {
      setRewards([]);
    }
  }, []);

  const refreshRedemptions = useCallback(async () => {
    try {
      const res = await apiRequest("/rewards/getMyRedemptionHistory");
      setRedemptions(
        (res.data.redemptions || []).map((r) => ({
          id: r._id,
          reward_id: r.reward?._id,
          reward_title: r.reward?.name,
          points_spent: r.pointsUsed,
          redeemed_at: r.createdAt,
        }))
      );
    } catch {
      setRedemptions([]);
    }
  }, []);

  const refreshActivity = useCallback(async () => {
    try {
      const res = await apiRequest("/points/getMyPointsHistory");
      setActivity(
        (res.data.transactions || []).map((t) => ({
          id: t._id,
          title: t.description,
          points_delta: t.type === "Redeemed" ? -t.points : t.points,
          kind: t.type === "Redeemed" ? "redeem" : "earn",
          created_at: t.createdAt,
        }))
      );
    } catch {
      setActivity([]);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRewards([]);
      setActivity([]);
      setRedemptions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([refreshRewards(), refreshActivity(), refreshRedemptions()]);
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, refreshRewards, refreshActivity, refreshRedemptions]);

  const redeemReward = useCallback(
    async (rewardId) => {
      try {
        await apiRequest("/rewards/redeemReward", {
          method: "POST",
          body: { rewardId },
        });
        await Promise.all([refreshProfile(), refreshActivity(), refreshRedemptions(), refreshRewards()]);
        return { error: null };
      } catch (err) {
        return { error: new Error(err.message) };
      }
    },
    [refreshProfile, refreshActivity, refreshRedemptions, refreshRewards]
  );

  const updateProfile = useCallback(
    async (fields) => {
      try {
        // Only firstName/lastName/phone are supported by the backend's
        // updateUser route — anything else (like avatar_url) is handled
        // by uploadAvatar instead and shouldn't be sent here.
        const body = {};
        if (fields.first_name !== undefined) body.firstName = fields.first_name;
        if (fields.last_name !== undefined) body.lastName = fields.last_name;
        if (fields.phone !== undefined) body.phone = fields.phone;
        if (fields.avatar_icon !== undefined) body.avatarIcon = fields.avatar_icon;

        if (Object.keys(body).length > 0) {
          await apiRequest("/auth/updateUser", { method: "PATCH", body });
        }
        await refreshProfile();
        return { error: null };
      } catch (err) {
        return { error: new Error(err.message) };
      }
    },
    [refreshProfile]
  );

  // Uploads a new avatar file (a File object from an <input type="file">).
  const uploadAvatar = useCallback(
    async (file) => {
      try {
        const formData = new FormData();
        formData.append("avatar", file);
        await apiRequest("/auth/uploadAvatar", {
          method: "PATCH",
          body: formData,
          isFormData: true,
        });
        await refreshProfile();
        return { error: null };
      } catch (err) {
        return { error: new Error(err.message) };
      }
    },
    [refreshProfile]
  );

  // ---- Everything below has no backend route yet — local-only stubs ----

  const useVoucher = useCallback(async (voucherId) => {
    const voucher = vouchers.find((v) => v.id === voucherId && v.is_active);
    if (!voucher) return { error: new Error("Voucher not found or already used") };
    setVouchers((vs) => vs.map((v) => (v.id === voucherId ? { ...v, is_active: false } : v)));
    return { error: null };
  }, [vouchers]);

  const updateNotificationPrefs = useCallback(async (fields) => {
    setNotificationPrefs((p) => ({ ...p, ...fields }));
    return { error: null };
  }, []);

  const addPaymentMethod = useCallback(async (method) => {
    setPaymentMethods((pm) => [...pm, { id: `local-${Date.now()}`, ...method }]);
    return { error: null };
  }, []);

  const removePaymentMethod = useCallback(async (id) => {
    setPaymentMethods((pm) => pm.filter((m) => m.id !== id));
    return { error: null };
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id) => {
    setPaymentMethods((pm) => pm.map((m) => ({ ...m, is_default: m.id === id })));
    return { error: null };
  }, []);

  const submitSupportTicket = useCallback(async () => {
    // No support-ticket route on the backend yet — this currently does nothing.
    return { error: null };
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    return { error: null };
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
  }, []);

  const value = {
    profile,
    rewards,
    activity,
    vouchers,
    redemptions,
    paymentMethods,
    notificationPrefs,
    notifications,
    loading,
    refreshProfile,
    redeemReward,
    useVoucher,
    updateProfile,
    uploadAvatar,
    updateNotificationPrefs,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    submitSupportTicket,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (ctx === undefined) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}
