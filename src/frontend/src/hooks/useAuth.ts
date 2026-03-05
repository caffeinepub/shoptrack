import { useCallback, useEffect, useState } from "react";
import type { User } from "../lib/types";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAuth() {
  const {
    identity,
    login: iiLogin,
    clear: iiClear,
    isInitializing,
    loginStatus,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // True when we have an authenticated identity but actor/profile hasn't loaded yet
  const hasAuthenticatedIdentity =
    !!identity && !identity.getPrincipal().isAnonymous();

  // Consider initializing if:
  // 1. II is still initializing, OR
  // 2. We have a valid identity but the actor is still being fetched (post-login gap), OR
  // 3. Login just succeeded (success state) but user profile hasn't loaded yet, OR
  // 4. We have a valid identity but actor/profile are not ready yet
  const isFullyInitializing =
    isInitializing ||
    loginStatus === "logging-in" ||
    (loginStatus === "success" && !user) ||
    (hasAuthenticatedIdentity && isFetching) ||
    (hasAuthenticatedIdentity && isLoadingProfile) ||
    (hasAuthenticatedIdentity &&
      !actor &&
      !isFetching &&
      !user &&
      !isLoadingProfile);

  // Load profile from backend when actor + identity are ready
  useEffect(() => {
    if (
      !actor ||
      isFetching ||
      !identity ||
      identity.getPrincipal().isAnonymous()
    ) {
      if (
        !isInitializing &&
        (!identity || identity.getPrincipal().isAnonymous())
      ) {
        setUser(null);
      }
      return;
    }

    setIsLoadingProfile(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (actor as any)
      .getMyProfile()
      .then((result: [{ name: string; email: string }] | []) => {
        const profile = result[0];
        if (profile) {
          setUser({ name: profile.name, email: profile.email });
        } else {
          const defaultName = "User";
          const defaultEmail = "";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (actor as any)
            .createOrUpdateProfile(defaultName, defaultEmail)
            .then(() => {
              setUser({ name: defaultName, email: defaultEmail });
            });
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoadingProfile(false));
  }, [actor, isFetching, identity, isInitializing]);

  const login = useCallback(() => {
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(() => {
    iiClear();
    setUser(null);
  }, [iiClear]);

  return {
    user,
    login,
    logout,
    isInitializing: isFullyInitializing,
    isLoadingProfile,
  };
}
