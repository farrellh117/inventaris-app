import { View, Text, StyleSheet } from "react-native";

export default function Pengembalian() {
    return (
        <View style={styles.container}>
            <Text>Pengembalian</Text>
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