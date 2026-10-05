import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./components/Home";
import { Rewards } from "./components/Rewards";
import { Wallet } from "./components/Wallet";
import { Profile } from "./components/Profile";
import { Sidebar } from "./components/Sidebar";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { VerifyEmail } from "./components/auth/VerifyEmail";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PersonalInformation } from "./components/settings/PersonalInformation";
import { PaymentMethods } from "./components/settings/PaymentMethods";
import { NotificationsSettings } from "./components/settings/NotificationsSettings";
import { PrivacySecurity } from "./components/settings/PrivacySecurity";
import { HelpSupport } from "./components/settings/HelpSupport";
import { NotificationsFeed } from "./components/notifications/NotificationsFeed";

function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="relative mx-auto w-full max-w-[1200px] flex-1">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppShell><Home /></AppShell>} />
        <Route path="/rewards" element={<AppShell><Rewards /></AppShell>} />
        <Route path="/wallet" element={<AppShell><Wallet /></AppShell>} />
        <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
        <Route path="/notifications" element={<AppShell><NotificationsFeed /></AppShell>} />
        <Route path="/profile/personal-information" element={<AppShell><PersonalInformation /></AppShell>} />
        <Route path="/profile/payment-methods" element={<AppShell><PaymentMethods /></AppShell>} />
        <Route path="/profile/notifications" element={<AppShell><NotificationsSettings /></AppShell>} />
        <Route path="/profile/privacy-security" element={<AppShell><PrivacySecurity /></AppShell>} />
        <Route path="/profile/help-support" element={<AppShell><HelpSupport /></AppShell>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
