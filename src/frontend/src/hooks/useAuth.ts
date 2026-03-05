import { useCallback, useEffect, useRef, useState } from "react";
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
    loginError,
    isLoginError,
  } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Track whether we've ever successfully loaded a profile in this session.
  // This ref stays true once the first successful profile load completes and
  // prevents the white-screen that occurs when loginStatus resets to "idle"
  // before the profile finishes loading.
  const profileLoadedRef = useRef(false);

  // Track whether a login was initiated so we can hold the loading state
  // even after loginStatus resets from "success" back to "idle".
  const loginInitiatedRef = useRef(false);

  // Set the flag when login is triggered
  const wasLoggingIn = loginStatus === "logging-in";
  useEffect(() => {
    if (wasLoggingIn) {
      loginInitiatedRef.current = true;
    }
  }, [wasLoggingIn]);

  // True when we have an authenticated identity but actor/profile hasn't loaded yet
  const hasAuthenticatedIdentity =
    !!identity && !identity.getPrincipal().isAnonymous();

  // Consider fully initializing (show spinner) if:
  // 1. II is still initializing, OR
  // 2. Login is actively in progress, OR
  // 3. We have an authenticated identity but the actor is still fetching, OR
  // 4. Profile is currently loading, OR
  // 5. We have an authenticated identity but no actor yet (brief gap), OR
  // 6. Login was initiated but profile hasn't loaded yet (catches the loginStatus "idle" reset race)
  const isFullyInitializing =
    isInitializing ||
    loginStatus === "logging-in" ||
    loginStatus === "success" ||
    (hasAuthenticatedIdentity && isFetching) ||
    (hasAuthenticatedIdentity && isLoadingProfile) ||
    (hasAuthenticatedIdentity && !actor && !isFetching && !user) ||
    (loginInitiatedRef.current && !profileLoadedRef.current && !user);

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
        // Reset flags on logout/anonymous
        loginInitiatedRef.current = false;
        profileLoadedRef.current = false;
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
          profileLoadedRef.current = true;
        } else {
          const defaultName = "User";
          const defaultEmail = "";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (actor as any)
            .createOrUpdateProfile(defaultName, defaultEmail)
            .then(() => {
              setUser({ name: defaultName, email: defaultEmail });
              profileLoadedRef.current = true;
            });
        }
      })
      .catch(() => {
        setUser(null);
        // On error reset so user can try again
        loginInitiatedRef.current = false;
        profileLoadedRef.current = false;
      })
      .finally(() => setIsLoadingProfile(false));
  }, [actor, isFetching, identity, isInitializing]);

  const login = useCallback(() => {
    loginInitiatedRef.current = true;
    profileLoadedRef.current = false;
    iiLogin();
  }, [iiLogin]);

  const logout = useCallback(() => {
    iiClear();
    setUser(null);
    loginInitiatedRef.current = false;
    profileLoadedRef.current = false;
  }, [iiClear]);

  return {
    user,
    login,
    logout,
    isInitializing: isFullyInitializing,
    isLoadingProfile,
    loginError: isLoginError ? loginError : undefined,
    isLoginError,
  };
}
