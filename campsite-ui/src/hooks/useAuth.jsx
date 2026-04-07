import { useApp } from "../context/useApp";

export function useAuth() {
  const { user } = useApp();
  return {
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    user,
  };
}
