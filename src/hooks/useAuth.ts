'use client';

// Auth is no longer required - system is open to everyone
export function useAuth() {
  return {
    user: null,
    profile: null,
    loading: false,
    signUp: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    isCreator: true,
    isAdmin: false,
    fetchProfile: async () => {},
  };
}
