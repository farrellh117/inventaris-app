import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  const router = useRouter();
  let isAuth = false;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuth) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuth, router]);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}
