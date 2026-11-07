import React, { useState, useEffect, Suspense, lazy } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@components/ui/ToastProvider";
import { SyncStatusProvider } from "@components/ui/SyncStatusProvider";
import { Toaster } from "react-hot-toast";
import { ScrollProgress } from "@components/ui/ScrollProgress";
import { ShowcaseNav } from "@components/ui/ShowcaseNav";
import { Navbar } from "@components/layout/Navbar";
import { Hero } from "@components/sections/Hero";
import { Services } from "@components/sections/Services";
import { Recommendations } from "@components/sections/Recommendations";
import { Pricing } from "@components/sections/Pricing";
import { Contact } from "@components/sections/Contact";
import { Footer } from "@components/layout/Footer";
import { AuthModal } from "@components/ui/AuthModal";
import { FloatingAssistant } from "@components/ui/FloatingAssistant";
import { CookieConsent } from "@components/ui/CookieConsent";
import AdinkraBackground from "@components/ui/AdinkraBackground";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import { useTheme } from "./hooks/useTheme";
import { Analytics } from "@vercel/analytics/react";

// Lazy load pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const About = lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About }))
);
const ComponentsPage = lazy(() =>
  import("./pages/ComponentsPage").then((module) => ({
    default: module.ComponentsPage,
  }))
);
const DocsPage = lazy(() =>
  import("./pages/DocsPage").then((module) => ({ default: module.DocsPage }))
);
const ThemesPage = lazy(() =>
  import("./pages/ThemesPage").then((module) => ({
    default: module.ThemesPage,
  }))
);
const PerformancePage = lazy(() =>
  import("./pages/PerformancePage").then((module) => ({
    default: module.PerformancePage,
  }))
);
const Careers = lazy(() =>
  import("./pages/Careers").then((module) => ({ default: module.Careers }))
);
const PrivacyPolicy = lazy(() =>
  import("./pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  }))
);
const CookiePolicy = lazy(() =>
  import("./pages/CookiePolicy").then((module) => ({
    default: module.CookiePolicy,
  }))
);
const TermsOfService = lazy(() =>
  import("./pages/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  }))
);
const PlanCompletion = lazy(() =>
  import("./pages/PlanCompletion").then((module) => ({
    default: module.PlanCompletion,
  }))
);

export default function App() {
  const [view, setView] = useState("landing"); // landing | dashboard | portfolio | plan-completion | careers | privacy | cookie | terms
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { mode, cycleTheme } = useTheme();

  useEffect(() => {
    // Attempt to fetch user using cookie
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Session expired");
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, []);

  // Prevent dead-end view traps if not authenticated
  useEffect(() => {
    if (view === "dashboard" && !user && !isLoadingUser) {
      setView("landing");
      setAuthModalOpen(true);
    }
  }, [view, user, isLoadingUser]);

  const handleLogin = (email, password) => {
    return fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || "Login failed");
        }
        return res.json();
      })
      .then((data) => {
        // Token is now in HTTP-only cookie
        setUser(data.user);
        setAuthModalOpen(false);
        // Correctly route to dashboard for both admin and client
        // The Dashboard component handles the inner routing based on role
        setView("dashboard");
      });
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" })
      .then(() => {
        setUser(null);
        setView("landing");
      })
      .catch((err) => console.error("Logout failed", err));
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setView("plan-completion");
    window.scrollTo(0, 0);
  };

  const handleNavigate = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
    if (newView !== "plan-completion") setSelectedPlan(null);
  };

  const handleGoogleLogin = (tokenResponse) => {
    const token =
      tokenResponse?.access_token ||
      tokenResponse?.credential ||
      tokenResponse?.id_token ||
      (typeof tokenResponse === "string" ? tokenResponse : null);

    if (!token) {
      return Promise.reject(new Error("No valid token received from Google"));
    }

    return fetch("/api/signup/verify-google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || errData.details || "Google auth verification failed"
          );
        }
        return res.json();
      })
      .then((data) => {
        // Token is now in HTTP-only cookie
        setUser(data.user);
        setAuthModalOpen(false);
        setView("dashboard");
        return data.user;
      });
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) {
      console.error(
        "Critical Error: VITE_GOOGLE_CLIENT_ID is missing in environment variables. Google Auth will fail."
      );
    } else {
      // Debug log to ensure Client ID is loaded (masked for security)
      console.log(
        "Google Client ID loaded:",
        googleClientId.substring(0, 10) + "..."
      );
    }
  }, [googleClientId]);

  const activeGoogleClientId =
    googleClientId ||
    "336631405778-sngll5qo5a8mo57ifn9ru8ol1m7r7cgs.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider
      clientId={activeGoogleClientId}
      onScriptLoadError={() =>
        console.error("Google Sign-In script failed to load")
      }
    >
      <div className={`min-h-screen ${mode} transition-colors duration-300`}>
        <Analytics />
        <ToastProvider>
          <SyncStatusProvider>
            <div className="bg-white dark:bg-akatech-black text-gray-900 dark:text-white min-h-screen transition-colors duration-300">
              {/* <AdinkraBackground /> */}
              <img
                src="/background-accent.jpg"
                alt=""
                className="fixed bottom-0 left-0 pointer-events-none w-[300px] md:w-[500px] opacity-100 z-0"
              />
              {view === "landing" && <ScrollProgress />}
              {view !== "dashboard" && (
                <Navbar
                  toggleAuth={() =>
                    view === "dashboard"
                      ? setView("landing")
                      : user
                      ? setView("dashboard")
                      : setAuthModalOpen(true)
                  }
                  isLoggedIn={!!user}
                  user={user}
                  mode={mode}
                  cycleTheme={cycleTheme}
                  onViewChange={handleNavigate}
                />
              )}
              {view === "dashboard" && isLoadingUser && (
                <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-akatech-dark">
                  <div className="w-12 h-12 border-4 border-akatech-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
                    Authenticating session...
                  </p>
                </div>
              )}

              {view === "landing" && (
                <ErrorBoundary>
                  <Hero />
                  <Services />
                  <Recommendations />
                  <Pricing onSelectPlan={handleSelectPlan} />
                  <Contact />
                </ErrorBoundary>
              )}
              <ErrorBoundary>
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-akatech-dark">
                      <div className="w-12 h-12 border-4 border-akatech-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  {view === "dashboard" && user && (
                    <Dashboard
                      user={user}
                      onLogout={handleLogout}
                      onUserUpdate={handleUserUpdate}
                    />
                  )}

                  {view === "about" && <About />}
                  {view === "components" && <ComponentsPage />}
                  {view === "docs" && <DocsPage />}
                  {view === "themes" && (
                    <ThemesPage mode={mode} cycleTheme={cycleTheme} />
                  )}
                  {view === "performance" && <PerformancePage />}

                  {view === "careers" && (
                    <Careers onHome={() => handleNavigate("landing")} />
                  )}

                  {view === "privacy" && (
                    <PrivacyPolicy onHome={() => handleNavigate("landing")} />
                  )}

                  {view === "cookie" && (
                    <CookiePolicy onHome={() => handleNavigate("landing")} />
                  )}

                  {view === "terms" && (
                    <TermsOfService onHome={() => handleNavigate("landing")} />
                  )}

                  {view === "plan-completion" && selectedPlan && (
                    <PlanCompletion
                      plan={selectedPlan}
                      onBack={() => handleNavigate("landing")}
                      onNavigate={handleNavigate}
                      onUserUpdate={handleUserUpdate}
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
              {view !== "dashboard" && <Footer onNavigate={handleNavigate} />}
              {view === "landing" && (
                <ErrorBoundary fallback={null}>
                  <Suspense fallback={null}>
                    <FloatingAssistant />
                  </Suspense>
                </ErrorBoundary>
              )}
              <CookieConsent />
              <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
              />
              <Toaster position="top-center" />
            </div>
          </SyncStatusProvider>
        </ToastProvider>
      </div>
    </GoogleOAuthProvider>
  );
}
