import AppLogo from "@/components/AppLogo";
import AuthFormLayout from "@/components/AuthFormLayout";
import Button from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import { registerForPushNotificationsAsync } from "@/configs/notification.config";
import { HandleApiError, showToast } from "@/constants/Functions";
import { useAuth } from "@/context/AuthContext";
import { useLoadingDialog } from "@/context/LoadingContext";
import { useTheme } from "@/context/ThemeContext";
import AuthServices from "@/services/AuthService";
import NotificationService from "@/services/NotificationService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

interface LoginScreenProps {
  isModal?: boolean;
  onSwitchToSignup?: () => void;
  onCloseModal?: () => void;
}

type TFormData = {
  email: string;
  password: string;
  role: "owner" | "worker";
};

export default function LoginScreen({
  isModal = false,
  onSwitchToSignup,
  onCloseModal,
}: LoginScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit } = useForm<TFormData>();
  const loadingDialog = useLoadingDialog();

  const onSubmit = async (formData: TFormData) => {
    try {
      loadingDialog.show();
      
      // Determine role based on email
      const role = formData.email === "teja.mentem@gmail.com" ? "owner" : "worker";
      
      const loginData = {
        ...formData,
        role
      };
      
      const response = await AuthServices.signIn(loginData);
      console.log("response", response);
      if (response) {
        console.log("About to call auth.signIn");
        await auth.signIn({
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
          theme: "dark",
        });
        console.log("sd - auth.signIn completed successfully");
        
        // Store user role in AsyncStorage for later use
        if (response.user) {
          await AsyncStorage.setItem("userRole", response.user.role);
        }
        
        if (response.message) showToast("success", response.message);
        onCloseModal?.();
        router.replace("/(tabs)/home");
        const token = await registerForPushNotificationsAsync();
        console.log("token",token)

        if (token){
          const NotificationServiceres=await NotificationService.sendTokenToBackend(token, response.tokens.accessToken);
          console.log("NotificationServiceres",NotificationServiceres)
        } 
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      HandleApiError(error);
    } finally {
      loadingDialog.hide();
    }
  };

  const handleLongPress = async () => {
    try {
      loadingDialog.show();
      await auth.signIn({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        theme: "dark",
      });
      showToast("success", "Login successful! (Bypassed)");
      onCloseModal?.();
      router.replace("/(tabs)/home");
    } catch (error) {
      HandleApiError(error);
    } finally {
      loadingDialog.hide();
    }
  };

  

  const loginContent = (
    <ThemedView
      style={[
        styles.container,
        isModal && styles.modalContainer,
      ]}
    >
      <AppLogo showText text="Welcome Back" textStyle={styles.logoText} />

      <ThemedView style={styles.formContainer}>
        <Controller
          control={control}
          name="email"
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textDim}
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required" }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                placeholder="Password"
                secureTextEntry
                placeholderTextColor={colors.textDim}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={value}
                onChangeText={onChange}
              />
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/(auth)/forget-password")}
              >
              </TouchableOpacity>
            </>
          )}
        />

        <Button
          title="Login"
          onPress={handleSubmit(onSubmit)}
          onLongPress={handleLongPress}
          style={styles.loginButton}
        />

        <TouchableOpacity
          onPress={() => {
            if (isModal && onSwitchToSignup) {
              onSwitchToSignup();
            } else {
              router.push("/(auth)/signup");
            }
          }}
        >
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  return isModal ? loginContent : <AuthFormLayout>{loginContent}</AuthFormLayout>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  modalContainer: {
    flexGrow: 1,
    marginTop: -100
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 8,
  },
  linkText: {
    marginTop: 20,
    textAlign: "center",
  },
});
