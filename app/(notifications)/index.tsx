import BackButton from "@/components/BackButton";
import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text } from "react-native";

export default function NotificationsScreen() {
  const { colors } = useTheme();

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          title="Notifications"
          leftContent={<BackButton />}
          showBottomBorder
        />

        {/* 🔔 Notification Card */}
        <ThemedView style={styles.deliveryCard}>
          <ThemedView style={styles.cardHeader}>
            <ThemedView style={styles.dot} />
            <ThemedText style={styles.cardTitle}>Delivery Completed</ThemedText>
            <ThemedText style={styles.cardTime}>01:38 pm</ThemedText>
          </ThemedView>

          <Text style={styles.cardText}>
            Van 1 (Ravi) delivered 300L diesel (₹27,750) to L&T Construction at 10:30 AM
          </Text>
        </ThemedView>

        {/* Optional fallback message */}
        {/* <View style={styles.content}>
          <Ionicons name="notifications-outline" size={48} color="#fff" />
          <Text style={styles.title}>No new notifications</Text>
          <Text style={styles.subtitle}>
            You’ll see your activity and alerts here.
          </Text>
        </View> */}

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
deliveryCard: {
  backgroundColor: "#e8f2ff",
  borderRadius: 12,
  padding: 12,
  margin: 16,
  borderColor: "#add6ff",
  borderWidth: 1,
},
cardHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6,
},
dot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#007bff",
  marginRight: 6,
},
cardTitle: {
  fontWeight: "600",
  fontSize: 14,
  flex: 1,
  color: "#000",
},
cardTime: {
  fontSize: 12,
  color: "#666",
},
cardText: {
  fontSize: 13,
  color: "#444",
  marginTop: 4,
},


})
