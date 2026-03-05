import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Package,
  Shield,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { useAuth } from "../hooks/useAuth";

interface AuthPageProps {
  auth: ReturnType<typeof useAuth>;
}

export function AuthPage({ auth }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = auth.login(loginEmail, loginPassword);
    if (!result.success) {
      toast.error(result.error ?? "Login failed");
    } else {
      toast.success("Welcome back!");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const result = auth.register(regName, regEmail, regPassword);
    if (!result.success) {
      toast.error(result.error ?? "Registration failed");
    } else {
      toast.success(`Welcome, ${regName}! Your account is ready.`);
    }
  };

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

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
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

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="border-border shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">
                    Welcome back
                  </CardTitle>
                  <CardDescription>
                    Sign in to your ShopTrack account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email">Email address</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        data-ocid="auth.email_input"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          data-ocid="auth.password_input"
                          autoComplete="current-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      data-ocid="auth.login_button"
                    >
                      Sign In
                    </Button>
                  </form>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Demo: any email + 6+ character password
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="border-border shadow-card">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">
                    Create account
                  </CardTitle>
                  <CardDescription>
                    Start tracking your shopping today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name">Full name</Label>
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Alex Johnson"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">Email address</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        data-ocid="auth.email_input"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          data-ocid="auth.password_input"
                          autoComplete="new-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      data-ocid="auth.register_button"
                    >
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
