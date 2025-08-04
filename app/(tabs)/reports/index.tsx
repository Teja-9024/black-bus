import CommonHeader from "@/components/CommonHeader";
import RoleBadge from "@/components/RoleBadge";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LinearGradient } from "expo-linear-gradient";

export default function ReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Reports Dashboard</ThemedText>
              <RoleBadge style={styles.roleBadge} />
            </View>
          }
          rightContent1={
            <TouchableOpacity onPress={() => router.push("/(notifications)")} style={styles.notificationIconContainer}>
              <SimpleLineIcons name="heart" size={24} color={colors.text} />
              {/* {hasUnreadNotifications && (
                <ThemedView style={[styles.notificationDot, { backgroundColor: 'red' }]} />
              )} */}
            </TouchableOpacity>
          }
          showBottomBorder={true}
        />
        
        {/* Reports Content */}
        <ThemedView style={styles.reportsContent}>
          <ThemedText style={styles.welcomeText}>
            Welcome to the Reports Dashboard
          </ThemedText>
          <ThemedText style={[styles.descriptionText, { color: colors.textDim }]}>
            This section is only accessible to owners. Here you can view analytics, generate reports, and manage business data.
          </ThemedText>
        </ThemedView>
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
  activityIndicator: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    marginLeft: 8,
  },
  notificationIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 1,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportsContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});