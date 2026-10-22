import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services';
import { setUnauthorizedHandler } from '../services/http';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);
  const value = useMemo(() => ({
    user, ready,
    login: async (b) => { const u = await api.auth.login(b); setUser(u); return u; },
    register: async (b) => { const u = await api.auth.register(b); setUser(u); return u; },
    logout: async () => { try { await api.auth.logout(); } finally { setUser(null); } },
    refresh: async () => setUser(await api.auth.me()),
  }), [user, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
