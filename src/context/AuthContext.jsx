import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, getStoredToken, setToken } from "../lib/apiClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already saved, try to restore the session.
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/auth/getUser")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // token missing/expired/invalid — clear it and fall back to logged out
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Create a new account. Does NOT log the user in — the backend requires
  // email verification before a login is allowed, so the caller should
  // route to the verify-email page next.
  const signUp = async ({ firstName, lastName, email, phone, password }) => {
    try {
      const res = await apiRequest("/auth/createUser", {
        method: "POST",
        body: { firstName, lastName, email, phone, password },
      });
      return { data: res.data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  };

  const verifyEmail = async ({ email, code }) => {
    try {
      const res = await apiRequest("/auth/verifyEmail", {
        method: "POST",
        body: { email, code },
      });
      return { data: res, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  };

  const resendVerificationCode = async (email) => {
    try {
      const res = await apiRequest("/auth/resendVerificationCode", {
        method: "POST",
        body: { email },
      });
      return { data: res, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const res = await apiRequest("/auth/loginUser", {
        method: "POST",
        body: { email, password },
      });
      setToken(res.data.token);
      setUser(res.data.user);
      return { data: res.data, error: null };
    } catch (err) {
      // The backend sends this exact message when the account exists but
      // hasn't verified their email yet — use it to route to /verify-email.
      const needsVerification = /verify your email/i.test(err.message || "");
      return { data: null, error: { message: err.message, needsVerification } };
    }
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  // Re-fetches the current user from the backend (used after profile/avatar updates).
  const refreshUser = async () => {
    try {
      const res = await apiRequest("/auth/getUser");
      setUser(res.data.user);
      return res.data.user;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    }
  };

  const updatePassword = async ({ currentPassword, newPassword }) => {
    await apiRequest("/auth/changePassword", {
      method: "PATCH",
      body: { currentPassword, newPassword },
    });
  };

  const deactivateAccount = async () => {
    await apiRequest("/auth/deactivateAccount", { method: "PATCH" });
    await signOut();
  };

  const value = {
    user,
    loading,
    signUp,
    verifyEmail,
    resendVerificationCode,
    signIn,
    signOut,
    refreshUser,
    updatePassword,
    deactivateAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
