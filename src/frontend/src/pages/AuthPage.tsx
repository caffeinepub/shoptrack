import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Package,
  Shield,
  ShoppingCart,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { useAuth } from "../hooks/useAuth";

interface AuthPageProps {
  auth: ReturnType<typeof useAuth>;
}

export function AuthPage({ auth }: AuthPageProps) {
  const [showHelp, setShowHelp] = useState(false);

  const features = [
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Track all your orders",
    },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Spending analytics" },
    { icon: <Shield className="h-5 w-5" />, label: "Private & secure" },
  ];

  const steps = [
    {
      icon: <Shield className="h-4 w-4" />,
      title: 'Click "Sign in" below',
      desc: "A login window will open (allow popups if asked)",
    },
    {
      icon: <UserCircle2 className="h-4 w-4" />,
      title: "Create or select your anchor",
      desc: "Use an existing Internet Identity anchor number, or create a new one for free",
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" />,
      title: "Authenticate",
      desc: "Use your device fingerprint, Face ID, PIN, or a security key",
    },
  ];

  const handleLogin = () => {
    // Make sure popups are not blocked by triggering on user gesture
    auth.login();
  };

  const isError = !!(auth as any).isLoginError;
  const loginError = (auth as any).loginError as Error | undefined;

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-40 w-40 rounded-full border-2 border-white" />
          <div className="absolute top-32 left-32 h-24 w-24 rounded-full border border-white" />
          <div className="absolute bottom-20 right-10 h-60 w-60 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-40 h-16 w-16 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/3 h-32 w-32 rounded-full border border-white" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            ShopTrack
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xs mx-auto">
            The smart way to track all your online purchases in one place.
          </p>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90 text-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  {f.icon}
                </div>
                {f.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              ShopTrack
            </span>
          </div>

          <div className="flex justify-center mb-6">
            <div className="hidden lg:flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
            Welcome to ShopTrack
          </h2>
          <p className="text-muted-foreground text-sm mb-6 text-center max-w-xs mx-auto">
            Sign in with Internet Identity -- a free, secure, passwordless
            login. No email or phone number required.
          </p>

          {/* Error alert */}
          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError?.message?.includes("closed")
                      ? "The login window was closed. Please try again and complete the sign-in process."
                      : loginError?.message?.includes("popup")
                        ? "Popup was blocked by your browser. Please allow popups for this site and try again."
                        : "Login failed. Please try again."}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works steps */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 mb-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              How to sign in
            </p>
            {steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Login button */}
          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold"
            onClick={handleLogin}
            disabled={auth.isInitializing}
            data-ocid="auth.login_button"
          >
            {auth.isInitializing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Sign in with Internet Identity
              </>
            )}
          </Button>

          {/* Popup warning */}
          <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
            A popup window will open -- please allow popups if your browser
            asks.
          </p>

          {/* Help toggle */}
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="mt-4 w-full text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            data-ocid="auth.toggle"
          >
            {showHelp ? "Hide help" : "Popup not opening? Click here for help"}
          </button>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground text-sm">
                    If the login window does not open:
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>
                      Look for a <strong>popup blocked</strong> icon in your
                      browser address bar and click it to allow popups
                    </li>
                    <li>
                      In Chrome: Settings &rarr; Privacy &rarr; Site Settings
                      &rarr; Pop-ups and redirects &rarr; Allow
                    </li>
                    <li>
                      In Safari: Preferences &rarr; Websites &rarr; Pop-up
                      Windows &rarr; Allow
                    </li>
                    <li>
                      Try opening in a different browser (Chrome or Firefox
                      recommended)
                    </li>
                    <li>
                      Disable any ad-blocker or popup-blocking extension
                      temporarily
                    </li>
                  </ul>
                  <a
                    href="https://identity.ic0.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    data-ocid="auth.link"
                  >
                    Open Internet Identity directly{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
