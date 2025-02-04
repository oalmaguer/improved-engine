import { supabase } from "./supabase";

export type AuthChangeCallback = (isSignedIn: boolean) => void;
let authChangeCallbacks: AuthChangeCallback[] = [];

export function onAuthStateChange(callback: AuthChangeCallback) {
  authChangeCallbacks.push(callback);

  // Initial auth check
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(!!session);
  });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session);
  });

  // Return cleanup function
  return () => {
    authChangeCallbacks = authChangeCallbacks.filter((cb) => cb !== callback);
    subscription.unsubscribe();
  };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
