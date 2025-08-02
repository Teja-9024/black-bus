import AppLogo from "@/components/AppLogo";
import AuthScreenWrapper from "@/components/AuthScreenWrapper";
import Button from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function AuthChoiceScreen() {
  const router = useRouter();

  const handleGoogleSignIn = () => alert("Google Sign-In pressed");
  const handleAppleSignIn = () => alert("Apple Sign-In pressed");

  return (
    <AuthScreenWrapper>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.logoHeader}>
          <AppLogo
            showText
            text="Welcome to Sonu Petroleum Service
"
            textStyle={{ fontSize: 18, fontWeight: 'bold',  }}
          />
        </ThemedView>
        <ThemedView style={styles.buttonGroup}>
          <Button
            title="Login with Email"
            onPress={() => router.push("/(auth)/login")}
          />
          {/* <Divider text="or" />
          <Button
            title="Sign Up with Email"
            onPress={() => router.push("/(auth)/signup")}
          /> */}
        </ThemedView>

        {/* <Divider text="or continue with" /> */}

        {/* <ThemedView style={styles.buttonGroup}>
          <Button title="Continue with Google" onPress={() => router.push("/(auth)/verify-otp")} />
          {Platform.OS === "ios" && (
            <Button title="Continue with Apple" onPress={handleAppleSignIn} />
          )}
        </ThemedView> */}
      </ThemedView>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '95%',
    margin: 'auto',
    justifyContent: "center",
  },
  logoHeader: {
    marginBottom: 40,
    alignItems: "center",
  },
  buttonGroup: {
    marginVertical: 14,
  },
});
