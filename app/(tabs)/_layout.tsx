import { HapticTab } from "@/components/HapticTab";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("worker");
  const basePaddingTop = 5; 
  const basePaddingBottomAndroid = 5;
  const basePaddingBottomIos = 20;

  const dynamicPaddingBottom = Platform.select({
    ios: Math.max(basePaddingBottomIos, insets.bottom),
    android: basePaddingBottomAndroid + insets.bottom,
    default: basePaddingBottomAndroid + insets.bottom,
  });

  const contentHeight = 55;
  const totalTabBarHeight =
    contentHeight + basePaddingTop + dynamicPaddingBottom;

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBarBase,
          {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.tabBarBorder,
            height: totalTabBarHeight,
            paddingBottom: dynamicPaddingBottom,
            paddingTop: basePaddingTop,
          },
          Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        ],
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="intake"
        options={{
          title: "Intake",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name={focused ? "gas-pump" : "gas-pump"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="delivery"
        options={{
          title: "Delivery",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? "truck-delivery" : "truck-delivery-outline"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}  
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          href: userRole === 'owner' ? '/reports' : null, // This will hide the tab completely
          tabBarIcon: ({ focused }) => (
            <Octicons
              name={focused ? "report" : "report"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={focused ? colors.tabBarActive : colors.tabBarInactive}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBase: {
    borderTopWidth: 0.5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});