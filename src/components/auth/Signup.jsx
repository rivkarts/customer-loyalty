import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const { error } = await signUp({ firstName, lastName, email, phone, password });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // The backend requires email verification before login is allowed —
    // send the user straight to the verification page with their email prefilled.
    navigate("/verify-email", { replace: true, state: { email } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Icon icon="solar:crown-star-bold" className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join LoyaltyApp and start earning points</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold" htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="Chidinma"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="Okafor"
              />
            </div>
          </div>
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
            <label className="text-sm font-semibold" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="08012345678"
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
              placeholder="At least 6 characters"
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
