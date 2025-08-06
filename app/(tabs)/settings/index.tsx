import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

import Button from "@/components/Button";
import CustomTextInput from "@/components/CustomTextInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [rate, setRate] = useState<string>('92.5');
  const [newRate, setNewRate] = useState<string>('');

  const {
    control,
    setValue,
  } = useForm({
    defaultValues: {
      litres: '',
      amount: '',
    },
  });

  const calculateFromLitres = (val: string) => {
    const parsed = parseFloat(val) || 0;
    return (parsed * parseFloat(rate)).toFixed(2);
  };

  const handleRateUpdate = () => {
    if (newRate) {
      setRate(newRate);
      setNewRate('');
    }
  };

    const vanData = [
    { id: '1', name: 'Van 1', driver: 'Ravi Kumar', stock: 1500 },
    { id: '2', name: 'Van 2', driver: 'Ramesh Singh', stock: 1200 },
    ];


  return (
      <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
          <ThemedSafeArea style={styles.container}>
              <CommonHeader
                  leftContent={
                      <View style={styles.leftContent}>
                          <ThemedText style={styles.title}>Settings</ThemedText>
                      </View>
                  }
                  rightContent1={
                      <TouchableOpacity
                          onPress={() => router.push("/(notifications)")}
                          style={styles.notificationIconContainer}
                      >
                          <SimpleLineIcons name="bell" size={24} color={colors.text} />
                      </TouchableOpacity>
                  }
                  showBottomBorder={true}
              />

              <ScrollView>
                  <ThemedView style={styles.reportsContent}>
                      <ThemedView style={styles.titleContainer}>
                          <Ionicons name="speedometer-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
                          <ThemedText style={styles.title}>Diesel Rate Management</ThemedText>
                      </ThemedView>

                      <ThemedView style={[styles.currentRateBox]}>
                          <ThemedText style={styles.subtitle}>Current Rate</ThemedText>
                          <ThemedText style={styles.welcomeText}>₹{rate}/L</ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.inputRow}>
                          <ThemedView style={{ flex: 0.7 }}>
                              <Controller
                                  control={control}
                                  name="litres"
                                  render={({ field: { value, onChange } }) => (
                                      <CustomTextInput
                                          label="New Rate (₹/L)"
                                          value={value}
                                          placeholder="Enter new rate"
                                          onChangeText={(text) => {
                                              onChange(text);
                                              setValue("amount", calculateFromLitres(text));
                                          }}
                                          keyboardType="decimal-pad"
                                          bordered
                                      />
                                  )}
                              />
                          </ThemedView>

                          <ThemedView style={{ flex: 0.3, marginTop: 26 }}>
                              <Button title="Update" onPress={handleRateUpdate} style={styles.button} />
                          </ThemedView>

                      </ThemedView>
                  </ThemedView>

                  <ThemedView style={styles.vanInfoBox}>
                      <ThemedView style={styles.vanInfoHeader}>
                          <Ionicons name="bus-outline" size={18} color="#007AFF" style={{ marginRight: 6 }} />
                          <ThemedText style={styles.vanInfoTitle}>Van Information</ThemedText>
                      </ThemedView>

                      {vanData.map((van) => (
                          <ThemedView key={van.id} style={styles.vanCard}>
                              <ThemedView>
                                  <ThemedText style={styles.vanName}>{van.name}</ThemedText>
                                  <ThemedText style={styles.driverName}>{van.driver}</ThemedText>
                              </ThemedView>
                              <ThemedView style={{ alignItems: 'flex-end' }}>
                                  <ThemedText style={styles.stock}>{van.stock}L</ThemedText>
                                  <ThemedText style={styles.stockLabel}>Current Stock</ThemedText>
                              </ThemedView>
                          </ThemedView>
                      ))}
                  </ThemedView>

                  <ThemedView style={styles.appInfoBox}>
                      <ThemedText style={styles.appInfoTitle}>App Information</ThemedText>

                      <ThemedView style={styles.infoRow}>
                          <ThemedText style={styles.label}>Version:</ThemedText>
                          <ThemedText style={styles.value}>1.0.0</ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.infoRow}>
                          <ThemedText style={styles.label}>Last Updated:</ThemedText>
                          <ThemedText style={styles.value}>06 Aug 2025</ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.infoRow}>
                          <ThemedText style={styles.label}>Total Entries:</ThemedText>
                          <ThemedText style={styles.value}>2</ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.infoRow}>
                          <ThemedText style={styles.label}>Active Vans:</ThemedText>
                          <ThemedText style={styles.value}>2</ThemedText>
                      </ThemedView>
                  </ThemedView>
              </ScrollView>
                 
          </ThemedSafeArea>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
  },
  leftContent: {
    gap: 2,
  },
  notificationIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportsContent: {
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal:15,
    marginVertical: 15,
    borderRadius:10
    
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    // textAlign: 'center',
    marginBottom: 16,
    color: '#fff',
  },
  currentRateBox: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#323436ff',
    
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
  },
  vanInfoBox: {
  padding: 16,
  borderRadius: 12,
  marginTop: 24,
  marginHorizontal:15,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
vanInfoHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},
vanInfoTitle: {
  fontSize: 18,
  fontWeight: "600",},
vanCard: {
  borderRadius: 15,
  padding: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
  backgroundColor: "#323436ff",
},
vanName: {
  fontSize: 17,
  fontWeight: "600",
},
driverName: {
  fontSize: 14,
  color: "#ddd",
  marginTop: 2,
},
stock: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#007AFF",
},
stockLabel: {
  fontSize: 12,
  color: "#ddd",
},
appInfoBox: {
  padding: 16,
  borderRadius: 12,
  marginTop: 24,
  marginHorizontal:15,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
appInfoTitle: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
  marginBottom: 12,
},
infoRow: {
  flexDirection: "row",
  marginBottom: 6,
},
label: {
  fontWeight: "bold",
  width: 130,
},
value:{}

});
