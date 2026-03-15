import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
