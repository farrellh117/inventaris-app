import { Session } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  nama_lengkap?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fungsi untuk mengambil data profil tambahan dari tabel public.users
  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error, status } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();
        
        if (error) {
          console.error("Error Code:", error.code); // Contoh: 'PGRST116' (no rows) atau '42501' (RLS violation)
          console.error("Error Message:", error.message);
          console.log("HTTP Status:", status);
        }

      if (!error && data) {
        setUser({
          id: userId,
          email: email,
          username: data.username,
          nama_lengkap: data.nama_lengkap,
          role: data.role,
        });
      } else {
        // Fallback jika profil belum ada di public.users
        setUser({ id: userId, email: email });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    // Cek sesi saat aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Pantau perubahan status (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await fetchProfile(data.user.id, data.user.email);
  };

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username, nama_lengkap: fullName },
      },
    });
    if (error) throw error;
    if (data.user) await fetchProfile(data.user.id, data.user.email);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};