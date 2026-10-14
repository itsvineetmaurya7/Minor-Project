// Shared login state for the app: pages read the user/token here, while login state persists in sessionStorage.
import { createContext, useContext, useState } from "react";
import { api } from "../api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
const load = () => { try { return JSON.parse(sessionStorage.getItem("session")); } catch { return null; } };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(load);
  // Keep React state and the browser session in sync so protected routes survive a page refresh.
  const save = (s) => {
    setSession(s);
    try { s ? sessionStorage.setItem("session", JSON.stringify(s)) : sessionStorage.removeItem("session"); } catch {}
  };
  const login = async (email, password) => { const s = await api.login(email, password); save(s); return s.user; };
  const logout = () => save(null);
  const update = (u) => save({ ...session, user: { ...session.user, ...u } });
  return <Ctx.Provider value={{ user: session?.user, token: session?.token, login, logout, update }}>{children}</Ctx.Provider>;
}
