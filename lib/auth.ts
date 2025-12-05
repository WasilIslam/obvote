// Simple client-side auth utilities

export interface Session {
  token: string;
  expiry: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  unitId: string | null;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  const sessionStr = localStorage.getItem("obvote_session");
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr) as Session;

    // Check if session is expired
    if (session.expiry < Date.now()) {
      clearAuth();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("obvote_user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("obvote_session");
  localStorage.removeItem("obvote_user");
}

export function setAuth(session: Session, user: User): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("obvote_session", JSON.stringify(session));
  localStorage.setItem("obvote_user", JSON.stringify(user));
}
