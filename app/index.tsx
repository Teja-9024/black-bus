import Button from "@/components/Button";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeType } from "@/store/themeStore";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";

interface IndexScreenProps {
  theme?: ThemeType;
}

export default function IndexScreen({ theme }: IndexScreenProps) {
  const { colors, setTheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, authLoading } = useAuth();

  useEffect(() => {
    if (theme) {
      setTheme(theme);
    }
    console.log("welcome theme", theme);
  }, [theme, setTheme]);

  if (authLoading) return null;
  if (isAuthenticated) return <Redirect href="/home" />;

  return (
    <>
      <LinearGradient colors={colors.gradient} style={styles.container}>
        <ThemedSafeArea style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText
              type="title"
              style={styles.title}
            >
              Sonu Petroleum Service
            </ThemedText>
            {/* <ThemedText
              type="default"
              style={styles.tagline}
            >
              Skip the red. Ride the black.
            </ThemedText> */}
          </ThemedView>

          <LottieView
            source={require("../assets/animations/busLoader.json")}
            autoPlay
            loop
            style={styles.animation}
          />

          <ThemedView style={styles.joinButton}>
            <Button
              title="Book"
              onPress={() => router.push("/(auth)/login")}
            />
          </ThemedView>
        </ThemedSafeArea>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  animation: {
    width: 300,
    height: 300,
  },
  joinButton: {
    width: "65%",
  },
});
