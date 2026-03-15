import { View, Text, StyleSheet } from "react-native";

export default function Riwayat() {
  return (
    <View style={styles.container}>
      <Text>Status & Riwayat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});