import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";
  const justVerified = location.state?.verified === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error } = await signIn({ email, password });
    setSubmitting(false);
    if (error) {
      if (error.needsVerification) {
        navigate("/verify-email", { replace: true, state: { email } });
        return;
      }
      setError(error.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Icon icon="solar:crown-star-bold" className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your LoyaltyApp account</p>
        </div>

        {justVerified && (
          <p className="text-sm font-semibold text-accent bg-accent/10 rounded-xl px-4 py-3 mb-4">
            Your email is verified. Sign in to continue.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-semibold" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
