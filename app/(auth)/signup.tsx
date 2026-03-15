import { useRouter } from "expo-router";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subTitle}>Daftar untuk memulai</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email..."
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password..."
            autoComplete="password"
            autoCapitalize="none"
            secureTextEntry={true}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.signupLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#233",
  },
  subTitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
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