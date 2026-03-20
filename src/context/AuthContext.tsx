import { createContext, ReactNode, useContext, useState } from "react";
import { supabase } from "../lib/supabase/client";

// 1. DAFTAR DATA: Menentukan data apa saja yang harus ada pada profil 'User'
export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'staff';
  profileImage?: string;
}

// 2. DAFTAR FUNGSI: Menentukan fitur apa saja yang bisa dipakai halaman lain (data 'User' & fungsi 'signUp')
interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

// 3. WADAH UTAMA: Membuat tempat penyimpanan data login agar bisa diakses semua halaman
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. PENGATUR PUSAT: Komponen yang mengatur semua urusan masuk/keluar akun
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Variable untuk menyimpan data user yang sedang login (awalnya null)
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    // Perintah untuk mendaftarkan email & password ke server Supabase
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
    });

    // Jika error (e.g email sudah terdaftar), kirim pesan error ke halaman signup
    if (error) throw error;

    // Jika berhasil, data user baru akan muncul di console log
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
      })
    }
  };

  // 5. PENYEBAR DATA: Perintah agar 'User' dan 'signUp' bisa dipakai oleh halaman di dalamnya (children)
  return (
    <AuthContext.Provider value={{ user, signUp, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. TOMBOL PANGGIL: Caracepat bagi halaman lain (e.g signup.tsx) untuk mengambil fungsi di atas
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("Must be inside the provider");
  }

  return context;
}
