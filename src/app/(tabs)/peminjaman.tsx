import { View, Text, StyleSheet } from "react-native";

export default function Peminjaman() {
  return (
    <View style={styles.container}>
      <Text>Peminjaman</Text>
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