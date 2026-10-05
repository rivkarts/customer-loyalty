import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmail() {
  const { verifyEmail, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer the email passed via navigation state (from signup/login).
  // Fall back to a manual field if someone lands here directly.
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Enter the email you signed up with.");
      return;
    }
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    const { error } = await verifyEmail({ email, code: code.trim() });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Email verified! Redirecting you to sign in…");
    setTimeout(() => {
      navigate("/login", { replace: true, state: { verified: true } });
    }, 1200);
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setError("");
    setSuccess("");
    setResending(true);
    const { data, error } = await resendVerificationCode(email);
    setResending(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(data?.message || "A new code has been sent.");
    startCooldown();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
            <Icon icon="solar:letter-unread-bold" className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter the 6-digit code we sent to your email to activate your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold" htmlFor="code">Verification code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl tracking-[0.5em] text-center text-lg font-bold"
              placeholder="000000"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-semibold text-accent bg-accent/10 rounded-xl px-4 py-3">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0 || !email}
          className="btn btn-ghost w-full rounded-xl h-11 font-bold mt-3 disabled:opacity-50"
        >
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : resending
            ? "Sending…"
            : "Resend code"}
        </button>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already verified?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
