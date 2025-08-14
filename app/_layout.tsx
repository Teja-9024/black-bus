import CustomToast from "@/components/CustomToast";
import { ThemedView } from "@/components/ThemedView";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoadingDialogProvider } from "@/context/LoadingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SocketProvider } from "@/context/SocketContext";
import { SuccessDialogProvider } from "@/context/SuccessContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { SyncProvider } from "@/sync/SyncProvider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

function RootLayoutContent() {
  const { colors } = useTheme();
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(chat)" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar
        style={colors.isDark ? "light" : "dark"}
        translucent={true}
        backgroundColor="transparent"
      />
      <Toast
        config={{
          success: (props) => <CustomToast {...props} />,
          error: (props) => <CustomToast {...props} />,
          info: (props) => <CustomToast {...props} />,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const theme  = useTheme();

  if (!loaded) {
    console.log("Fonts not loaded yet.");
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={styles.container}>
        <ThemeProvider>
          <LoadingDialogProvider>
            <SuccessDialogProvider>
              <AuthProvider>
                <SyncProvider>
                  {/* Wrap RootLayoutContent with SocketProvider */}
                  <SocketProvider>
                    <NotificationProvider>
                      <RootLayoutContent />
                    </NotificationProvider>
                  </SocketProvider>
                </SyncProvider>
              </AuthProvider>
            </SuccessDialogProvider>
          </LoadingDialogProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </PaperProvider>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});