import CommonHeader from "@/components/CommonHeader";
import RoleBadge from "@/components/RoleBadge";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import RecentDeliveries from "@/components/RecentDeliveries";
import SummaryCard from "@/components/SummaryCard";
import { ThemedText } from "@/components/ThemedText";
import { VanCard } from "@/components/VanCard";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, authLoading, user, accessToken, signOut } = useAuth();
  // const { socket } = useSocket();
  const router = useRouter();

  // const [unreadChatIds, setUnreadChatIds] = useState<Set<string>>(new Set());
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  // const totalUnreadChats = unreadChatIds.size;

  // const fetchInitialUnreadChats = useCallback(async () => {
  //   if (!accessToken) return;

  //   try {
  //     const res = await ChatService.getUserChats(accessToken, 1, 1000);
  //     const chats: ChatPreviewResponse[] = res.chats || [];

  //     const initialUnreadSet = new Set<string>();
  //     chats.forEach(chat => {
  //       if (chat.unreadCount > 0) {
  //         initialUnreadSet.add(chat.id);
  //       }
  //     });
  //     setUnreadChatIds(initialUnreadSet);
  //   } catch (err) {
  //     console.error("Error fetching initial unread chats:", err);
  //   }
  // }, [accessToken]);

  // const fetchInitialUnreadNotificationCount = useCallback(async () => {
  //   if (!accessToken) return;
  //   try {
  //     const res = await NotificationService.getUnreadNotificationCount(accessToken);
  //     setHasUnreadNotifications(res.count > 0);
  //   } catch (err) {
  //     console.error("Error fetching initial unread notification count:", err);
  //   }
  // }, [accessToken]);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     fetchInitialUnreadChats();
  //     fetchInitialUnreadNotificationCount();
  //   }
  // }, [isAuthenticated, fetchInitialUnreadChats, fetchInitialUnreadNotificationCount]);

  // useEffect(() => {
  //   if (!socket || !user) return;

  //   socket.emit("setUserId", user._id);

  //   const handleChatPreviewUpdate = (chatPreview: ChatPreviewResponse) => {
  //     setUnreadChatIds((prevIds) => {
  //       const newIds = new Set(prevIds);
  //       if (chatPreview.unreadCount > 0) {
  //         newIds.add(chatPreview.id);
  //       } else {
  //         newIds.delete(chatPreview.id);
  //       }
  //       return newIds;
  //     });
  //   };

  //   const handleUnreadNotificationCountUpdate = ({ count }: { count: number }) => {
  //     setHasUnreadNotifications(count > 0);
  //   };

  //   socket.on("chatPreviewUpdate", handleChatPreviewUpdate);
  //   socket.on("unreadNotificationCountUpdate", handleUnreadNotificationCountUpdate);

  //   return () => {
  //     socket.off("chatPreviewUpdate", handleChatPreviewUpdate);
  //     socket.off("unreadNotificationCountUpdate", handleUnreadNotificationCountUpdate);
  //   };
  // }, [socket, user]);

  if (authLoading) return <ActivityIndicator style={styles.activityIndicator} color={colors.primary} size="large" />;

  if (!isAuthenticated) return <Redirect href="/(auth)/AuthChoice" />;
  const vans = [
    { vanName: "Van 1", name: "Ravi Kumar", dieselLevel: 650, maxCapacity: 1200 },
    { vanName: "Van 2", name: "Ramesh Kumar", dieselLevel: 300, maxCapacity: 1000 },
  ];

const recentDeliveries = [
  {
    _id: "1",
    customerName: "ABC Constructions",
    deliveryTime: "2025-08-03T14:30:00Z",
    litres: 320.5,
    amount: 29565.75,
  },
  {
    _id: "2",
    customerName: "XYZ Industries",
    deliveryTime: "2025-08-03T16:10:00Z",
    litres: 210,
    amount: 18900.0,
  },
];

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Sonu Petroleum Service</ThemedText>
              <RoleBadge style={styles.roleBadge} />
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
        <ScrollView>
          <View style={styles.vansContainer}>
            {vans.map((van, index) => (
              <VanCard
                key={index}
                vanName={van.vanName}
                name={van.name}
                dieselLevel={van.dieselLevel}
                maxCapacity={van.maxCapacity}
                colors={colors} // from your theme
              />
            ))}
          </View>

          <SummaryCard
            summary={{
              totalIntake: 1500,
              totalDelivered: 1000,
              netBalance: 500,
              currentRate: 92.5,
            }}
          />

        <RecentDeliveries deliveries={recentDeliveries} />

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
  activityIndicator: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  leftContent: {
    // flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  vansContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
    justifyContent: 'space-between',
    marginHorizontal:15,
    marginTop: 10,
  },
});