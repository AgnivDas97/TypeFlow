import { useEffect, useState, createContext, useContext } from "react";
import * as authService from "../services/auth";
import { User } from "../types";

type AuthContextType = { user: User | null, setUser: (u: User | null) => void };

const AuthContext = createContext<AuthContextType>({ user: null, setUser: ()=>{} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.me().then(u => { if (u) setUser(u) });
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { 
  return useContext(AuthContext); 
}
