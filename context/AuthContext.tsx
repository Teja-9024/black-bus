import AuthServices from "@/services/AuthService";
import ProfileServices from "@/services/ProfileService";
import { ThemeType, useThemeStore } from "@/store/themeStore";
import { AuthSession } from "@/types/auth-session.type";
import { User } from "@/types/user.type";
import {
  getAuthSession,
  removeAuthSession,
  storeAuthSession,
} from "@/utils/auth-storage";
import { removeFilterSettings } from "@/utils/filter-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  session: AuthSession | null;
  authLoading: boolean;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  updateUserTheme: (theme: ThemeType) => Promise<void>;
  user: User | null;
  loadUserProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  accessToken: string | null;
  userRole: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("worker");
  const setThemeFromStore = useThemeStore((state) => state.setTheme);
  const availableThemes = useThemeStore((state) => state.availableThemes);

  useLayoutEffect(() => {
    (async () => {
      try {
        const storedSessionString = await getAuthSession();
        if (!storedSessionString) {
          setIsAuthenticated(false);
          setAccessToken(null);
          return;
        }

        const parsedSession: AuthSession = JSON.parse(storedSessionString);
        setSession(parsedSession);
        setAccessToken(parsedSession.accessToken || null);

        if (
          parsedSession.theme &&
          availableThemes.includes(parsedSession.theme as ThemeType)
        ) {
          setThemeFromStore(parsedSession.theme as ThemeType);
        }

        try {
          await loadUserProfile(parsedSession.accessToken);
          setIsAuthenticated(true);
        } catch {
          await signOut();
        }
      } catch (err) {
        setIsAuthenticated(false);
        setAccessToken(null);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, [setThemeFromStore, availableThemes]);

  const signIn = async (sessionData: AuthSession) => {
    console.log("signIn method called with sessionData:", sessionData);
    await storeAuthSession(sessionData);
    await AsyncStorage.setItem("userToken", sessionData.accessToken);
    setSession(sessionData);
    setAccessToken(sessionData.accessToken || null);
    setIsAuthenticated(true);
    if (
      sessionData.theme &&
      availableThemes.includes(sessionData.theme as ThemeType)
    ) {
      setThemeFromStore(sessionData.theme as ThemeType);
    }
    console.log("About to call loadUserProfile");
    await loadUserProfile(sessionData.accessToken);
    console.log("loadUserProfile completed");
  };

  const signOut = async () => {
    await removeAuthSession();
    await removeFilterSettings();
    await AsyncStorage.removeItem("userToken");
    setSession(null);
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const signUp = async (email: string, password: string) => {
    await AuthServices.signUp({ email, password });
  };

  const updateUserTheme = async (theme: ThemeType) => {
    if (!session) {
      throw new Error("No active session to update theme.");
    }

    try {
      await AuthServices.updateTheme(session.accessToken, theme);
      const updatedSession = { ...session, theme };
      setSession(updatedSession);
      await storeAuthSession(updatedSession);
      setThemeFromStore(theme);
    } catch (error) {
      throw error;
    }
  };

  const loadUserProfile = async (tokenOverride?: string | null) => {
    const token = tokenOverride || (await AsyncStorage.getItem("userToken"));
    try {
      if (token) {
        if (token === "mock-access-token") {
          setUser({
            _id: "mock-user-id",
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            theme: "dark",
            isVerified: true,
            isPrivate: false,
            role: "worker",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return;
        }
        // const userProfile = await ProfileServices.getProfile(token);
        // setUser(userProfile);
      }
    } catch (error: any) {
      console.error("Error while fetching profile:", error);
      // Don't sign out immediately on profile fetch error
      // Just log the error and continue with the session
      // The user can still use the app, profile can be fetched later
      console.log("Profile fetch failed, but continuing with session");
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      if (!accessToken) {
        throw new Error("No access token available for profile update.");
      }

      const formData = new FormData();
      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("gender", profileData.gender);
      const dob =
        profileData.dob instanceof Date
          ? profileData.dob
          : new Date(profileData.dob);
      formData.append("dob", dob.toISOString().split("T")[0]);

      if (profileData.profileImage) {
        const uriParts = profileData.profileImage.split(".");
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `profile.${fileType}`;
        formData.append("profileImage", {
          uri: profileData.profileImage,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
      }

      const response = await ProfileServices.updateProfile(formData, accessToken);
      setUser(response.user);
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw new Error("Failed to update profile");
    }
  };
  
  useEffect(() => {
    const getRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole) {
          setUserRole(storedRole);
         
        } else if (user?.role) {
          setUserRole(user.role);
        
        }
      } catch (error) {
        console.error("Error getting role:", error);
      }
    };

    getRole();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        session,
        authLoading,
        signIn,
        signOut,
        signUp,
        updateUserTheme,
        user,
        loadUserProfile,
        updateProfile,
        accessToken,
        userRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};