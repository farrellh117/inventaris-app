import { useAuth } from "@/src/context/AuthContext";
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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    // Trim input untuk mencegah spasi tak sengaja
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    const cleanFullName = fullName.trim();

    if (!cleanEmail || !password || !cleanUsername || !cleanFullName) {
      return Alert.alert("Perhatian", "Mohon lengkapi semua data pendaftaran.");
    }
    if (password.length < 6) {
      return Alert.alert("Error", "Password minimal harus 6 karakter.");
    }

    setIsLoading(true);
    try {
      await signUp(cleanEmail, password, cleanUsername, cleanFullName);
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan masuk.", [
        { text: "OK", onPress: () => router.push("/(auth)/login") }
      ]);
    } catch (error: any) {
      console.error("Signup Error:", error.message);
      Alert.alert("Gagal Daftar", error.message || "Terjadi kesalahan saat mendaftar.");
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
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* Konsisten menggunakan icon cube/barcode sesuai branding */}
              <Ionicons name="cube-outline" size={60} color="#007AFF" />
            </View>
            <Text style={styles.title}>Inventory Manager</Text>
            <Text style={styles.subTitle}>Daftar akun mahasiswa baru</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama sesuai KTM..."
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Budi_IF22"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@gmail.com"
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
                  placeholder="Buat password aman..."
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
              onPress={handleSignUp} 
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={"#fff"} />
                  <Text style={styles.loadingText}>Mendaftarkan...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Signup</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signupLink}>Login</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#F0F7FF",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 3 }
    })
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subTitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
    color: "#444",
  },
  input: {
    backgroundColor: "#f8f9fa",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#A2CFFE",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "bold"
  },
});