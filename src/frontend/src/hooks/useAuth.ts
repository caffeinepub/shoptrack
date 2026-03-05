import { useCallback, useState } from "react";
import { getUser, removeUser, saveUser } from "../lib/storage";
import type { User } from "../lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getUser());

  const login = useCallback(
    (
      email: string,
      _password: string,
      name?: string,
    ): { success: boolean; error?: string } => {
      if (!email || !_password)
        return { success: false, error: "Email and password are required." };
      if (_password.length < 6)
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };

      const userName = name ?? email.split("@")[0];
      const newUser: User = { name: userName, email };
      saveUser(newUser);
      setUser(newUser);
      return { success: true };
    },
    [],
  );

  const register = useCallback(
    (
      name: string,
      email: string,
      password: string,
    ): { success: boolean; error?: string } => {
      if (!name || !email || !password)
        return { success: false, error: "All fields are required." };
      if (password.length < 6)
        return {
          success: false,
          error: "Password must be at least 6 characters.",
        };
      if (!email.includes("@"))
        return { success: false, error: "Invalid email address." };

      const newUser: User = { name, email };
      saveUser(newUser);
      setUser(newUser);
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    removeUser();
    setUser(null);
  }, []);

  return { user, login, register, logout };
}
