import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase/client";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailAset() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("aset")
        .select("*, kategori(nama_kategori)")
        .eq("aset_id", id)
        .single();

      if (error) throw error;
      setAsset(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Aset</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.label}>Nama Barang</Text>
          <Text style={styles.value}>{asset?.nama_barang}</Text>

          <Text style={styles.label}>Kode Barcode</Text>
          <Text style={styles.value}>{asset?.kode_barcode}</Text>

          <Text style={styles.label}>Kategori</Text>
          <Text style={styles.value}>{asset?.kategori?.nama_kategori}</Text>
          
          <Text style={styles.label}>Kondisi</Text>
          <Text style={styles.value}>{asset?.kondisi?.toUpperCase()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderColor: "#EEE" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  card: { backgroundColor: "#F8F9FA", padding: 20, borderRadius: 15 },
  label: { fontSize: 12, color: "#888", marginTop: 10 },
  value: { fontSize: 16, fontWeight: "bold", color: "#333" },
});