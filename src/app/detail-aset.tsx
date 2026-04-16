import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router"; // Ditambahkan useFocusEffect
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/src/lib/supabase/client";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function DetailAset() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi fetch dipisahkan agar bisa dipanggil berulang kali
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
      Alert.alert("Error", "Gagal mengambil detail aset");
    } finally {
      setLoading(false);
    }
  };

  // Logic Auto-Refresh: Jalankan fetchDetail setiap kali halaman ini muncul di layar
  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert(
      "Hapus Aset",
      "Apakah Anda yakin ingin menghapus aset ini secara permanen?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive", 
          onPress: async () => {
            try {
              const { error } = await supabase.from("aset").delete().eq("aset_id", id);
              if (error) throw error;
              Alert.alert("Berhasil", "Aset telah dihapus");
              router.replace("/(tabs)/data-aset");
            } catch (err: any) {
              Alert.alert("Gagal", err.message);
            }
          }
        }
      ]
    );
  };

  if (loading && !asset) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Aset</Text>
        
        {user?.role === 'admin' ? (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => router.push({ pathname: "/edit-aset", params: { id: id } })}>
              <Ionicons name="create-outline" size={24} color="#007AFF" style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : <View style={{ width: 24 }} />}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {asset?.image_url ? (
          <Image source={{ uri: asset.image_url }} style={styles.imageLarge} />
        ) : (
          <View style={[styles.imageLarge, styles.imagePlaceholder]}>
             <Ionicons name="image-outline" size={50} color="#CCC" />
          </View>
        )}
        
        <View style={styles.card}>
          <Text style={styles.label}>Nama Barang</Text>
          <Text style={styles.value}>{asset?.nama_barang}</Text>

          <Text style={styles.label}>Kode Barcode</Text>
          <Text style={styles.value}>{asset?.kode_barcode}</Text>

          <View style={styles.row}>
            <View style={{flex: 1}}>
               <Text style={styles.label}>Merek</Text>
               <Text style={styles.value}>{asset?.merek || "-"}</Text>
            </View>
            <View style={{flex: 1}}>
               <Text style={styles.label}>Tipe</Text>
               <Text style={styles.value}>{asset?.tipe || "-"}</Text>
            </View>
          </View>

          <Text style={styles.label}>Kategori</Text>
          <Text style={styles.value}>{asset?.kategori?.nama_kategori || "-"}</Text>
          
          <Text style={styles.label}>Kondisi</Text>
          <View style={styles.badgeContainer}>
             <Text style={styles.badgeText}>{asset?.kondisi?.toUpperCase()}</Text>
          </View>

          <Text style={styles.label}>Status Ketersediaan</Text>
          <Text style={[styles.value, { color: asset?.status_ketersediaan === 'tersedia' ? '#2E7D32' : '#EF6C00' }]}>
            {asset?.status_ketersediaan?.toUpperCase()}
          </Text>

          <Text style={styles.label}>Keterangan</Text>
          <Text style={styles.valueKeterangan}>{asset?.keterangan || "Tidak ada keterangan"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderColor: "#EEE" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  imageLarge: { width: '100%', height: 250, borderRadius: 15, marginBottom: 20, backgroundColor: '#F0F0F0' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: "#F8F9FA", padding: 20, borderRadius: 15 },
  label: { fontSize: 12, color: "#888", marginTop: 15 },
  value: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 2 },
  valueKeterangan: { fontSize: 15, fontWeight: "bold", color: "#444", marginTop: 5, lineHeight: 22 },
  row: { flexDirection: 'row', marginTop: 5 },
  badgeContainer: { alignSelf: 'flex-start', backgroundColor: '#E1F5FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#0288D1' }
});