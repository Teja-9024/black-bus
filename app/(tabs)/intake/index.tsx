import CommonHeader from "@/components/CommonHeader";
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
import { LinearGradient } from "expo-linear-gradient";

export default function IntakeScreen() {
  const { colors } = useTheme();
  const router = useRouter();


  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Add Diesel Intake</ThemedText>
              <ThemedText style={styles.titletext}>Record diesel received from pump</ThemedText>
              {/* <RoleBadge style={styles.roleBadge} /> */}
            </View>
          }
          rightContent1={
            <TouchableOpacity onPress={() => router.push("/(notifications)")} style={styles.notificationIconContainer}>
              <SimpleLineIcons name="bell" size={24} color={colors.text} />
              {/* {hasUnreadNotifications && (
                        <ThemedView style={[styles.notificationDot, { backgroundColor: 'red' }]} />
                      )} */}
            </TouchableOpacity>
          }
          showBottomBorder={true}
        />
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
    // flexDirection: 'row',
    // alignItems: 'center',
    // gap: 10,
  },
  titletext:{
    fontSize:14
  },
  roleBadge: {
    marginLeft: 8,
  },
  chatIconContainer: {
    position: 'relative',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 18,
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
});