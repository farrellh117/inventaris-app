import { useAuth } from "@/src/context/AuthContext"
import { useRouter } from "expo-router";
import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // 1. Optimasi: Tambahkan .trim() untuk email agar tidak error karena spasi
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !password) {
      return Alert.alert("Perhatian", "Masukkan email dan password Anda.");
    }
    
    setIsLoading(true);
    try {
      // 2. Proses login melalui context
      await signIn(cleanEmail, password);
      // Catatan: Biasanya navigasi ditangani otomatis oleh root layout 
      // yang memantau perubahan session di AuthContext.
    } catch (error: any) {
      console.error("Login Error:", error.message);
      
      let msg = "Terjadi kesalahan koneksi.";
      if (error.message.includes("Invalid login credentials")) {
        msg = "Email atau password yang Anda masukkan salah.";
      } else if (error.message.includes("network")) {
        msg = "Koneksi internet tidak stabil.";
      }
      
      Alert.alert("Login Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Agar klik tombol lancar saat keyboard muncul
        >
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="cube-outline" size={60} color="#007AFF" />
            </View>
            <Text style={styles.title}>Inventory Manager</Text>
            <Text style={styles.subTitle}>Kelola stok barang dengan mudah</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Masukkan password..."
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color="#888" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={"#fff"} />
                  <Text style={styles.loadingText}>Menghubungkan...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>Signup</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 25 },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 100, height: 100,
    backgroundColor: "#F0F7FF",
    borderRadius: 50,
    justifyContent: "center", alignItems: "center",
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  subTitle: { fontSize: 14, color: "#888", marginTop: 5 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: "500", color: "#444" },
  input: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E9ECEF", fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#f5f5f5", borderRadius: 12, borderWidth: 1, borderColor: "#E9ECEF" },
  passwordInput: { flex: 1, padding: 16, fontSize: 16 },
  eyeIcon: { paddingHorizontal: 15 },
  button: { backgroundColor: "#007AFF", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 15 },
  buttonDisabled: { opacity: 0.7, backgroundColor: "#A2CFFE" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
  signupContainer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  signupText: { color: "#666", fontSize: 14 },
  signupLink: { color: "#007AFF", fontSize: 14, fontWeight: "bold" },
});