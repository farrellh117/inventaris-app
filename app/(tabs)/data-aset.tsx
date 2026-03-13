import { View, Text, StyleSheet } from "react-native";

export default function DataAset() {
    return (
        <View style={styles.container}>
            <Text>Data Aset</Text>
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