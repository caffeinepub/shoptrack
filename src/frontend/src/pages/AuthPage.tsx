import { Button } from "@/components/ui/button";
import { Package, Shield, ShoppingCart, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { useAuth } from "../hooks/useAuth";

interface AuthPageProps {
  auth: ReturnType<typeof useAuth>;
}

export function AuthPage({ auth }: AuthPageProps) {
  const features = [
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Track all your orders",
    },
    { icon: <TrendingUp className="h-5 w-5" />, label: "Spending analytics" },
    { icon: <Shield className="h-5 w-5" />, label: "Private & secure" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col items-center justify-center p-12">
        {/* Background pattern */}
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

      {/* Right panel - auth */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm text-center"
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

          <div className="flex justify-center mb-6 lg:flex">
            <div className="hidden lg:flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome to ShopTrack
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
            Sign in securely to manage and track all your online purchases.
          </p>

          <Button
            size="lg"
            className="w-full gap-2 text-base font-semibold"
            onClick={auth.login}
            disabled={auth.isInitializing}
            data-ocid="auth.login_button"
          >
            {auth.isInitializing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Sign in with Internet Identity
              </>
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Secure, decentralized login — no passwords required
          </p>
        </motion.div>
      </div>
    </div>
  );
}
