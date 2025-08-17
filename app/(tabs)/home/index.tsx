import CommonHeader from "@/components/CommonHeader";
import RoleBadge from "@/components/RoleBadge";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useAuth } from "@/context/AuthContext";
import { useNotificationsCtx } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { NotificationBadge } from "@/components/NotificationBadge";
import RecentDeliveries from "@/components/RecentDeliveries";
import SummaryCard from "@/components/SummaryCard";
import { ThemedText } from "@/components/ThemedText";
import { VanCard } from "@/components/VanCard";
import DeliveryService, { DeliveryItem } from "@/services/DeliveryService";
import FuelRateService from "@/services/FuelRateService";
import IntakeService, { IntakeItem } from "@/services/IntakeService";
import VanService, { Van } from "@/services/VanService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, authLoading, user, accessToken, signOut } = useAuth();
  const { unread } = useNotificationsCtx();
  const router = useRouter();

  const [currentRate, setCurrentRate] = useState<number>(0);
  const [totalIntake, setTotalIntake] = useState<number>(0);
  const [totalDelivered, setTotalDelivered] = useState<number>(0);
  const [recentDeliveries, setRecentDeliveries] = useState<
    { _id: string; customerName: string; deliveryTime: string; litres: number; amount: number }[]
  >([]);

  // const totalUnreadChats = unreadChatIds.size;

  const [vans, setVans] = useState<Van[]>([]);
  const [vansLoading, setVansLoading] = useState<boolean>(false);
  const [vansError, setVansError] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState<boolean>(false);
  const [workerName, setWorkerName] = useState<string>("");
  const [workerId, setWorkerId] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.role) setIsWorker(parsed.role === "worker");
          if (parsed?.name) setWorkerName(parsed.name);
          if (parsed?.id) setWorkerId(parsed.id);
          return;
        }
      } catch {}
      setIsWorker(user?.role === "worker");
      setWorkerName(user?.name || "");
      if (user?._id) setWorkerId(user._id);
    })();
  }, [user?.role, user?.name]);

  // Ensure effect runs every render to preserve hook order
  // useEffect(() => {
  //   if (!accessToken) return;

  //   const isToday = (iso: string) => {
  //     const d = new Date(iso);
  //     const now = new Date();
  //     return d.toDateString() === now.toDateString();
  //   };

  //   const fetchAll = async () => {
  //     setVansLoading(true);
  //     setVansError(null);
  //     try {
  //       const [vansRes, rateRes, intakesRes, deliveriesRes] = await Promise.all([
  //         VanService.getVans(accessToken),
  //         FuelRateService.getDieselRate(accessToken),
  //         IntakeService.getIntakes(accessToken),
  //         DeliveryService.getDeliveries(accessToken),
  //       ]);
  //       console.log("intakesRes", intakesRes);
  //       // Filter vans for worker role (supports AsyncStorage fallback)
  //       let filteredVans: Van[] = vansRes || [];
  //       console.log("filteredVans",filteredVans)
  //       if (isWorker) {
  //         const idToMatch = workerId || user?._id || "";
  //         console.log("idToMatch",idToMatch)
  //         filteredVans = filteredVans.filter((v) => (v.assignedWorker || "") === idToMatch);
  //       }
  //       console.log("filteredVans1",filteredVans)
  //       setVans(filteredVans);
  //       setCurrentRate(rateRes || 0);

  //       // Allowed van numbers for current user (all for owner, assigned for worker)
  //       const allowedVanNos = new Set((filteredVans || []).map((v) => v.vanNo));

  //       const todaysIntakes = (intakesRes || [])
  //         .filter((i: IntakeItem) => isToday(i.dateTime))
  //         .filter((i: IntakeItem) => allowedVanNos.size === 0 || allowedVanNos.has(i.vanNo));
  //       const todaysDeliveries = (deliveriesRes || [])
  //         .filter((d: DeliveryItem) => isToday(d.dateTime))
  //         .filter((d: DeliveryItem) => allowedVanNos.size === 0 || allowedVanNos.has(d.vanNo));

  //       const intakeLitres = todaysIntakes.reduce((sum, i) => sum + (i.litres || 0), 0);
  //       const deliveredLitres = todaysDeliveries.reduce((sum, d) => sum + (d.litres || 0), 0);
  //       setTotalIntake(intakeLitres);
  //       setTotalDelivered(deliveredLitres);

  //       const recentMapped = todaysDeliveries
  //         .slice()
  //         .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  //         .slice(0, 5)
  //         .map((d) => ({
  //           _id: d._id,
  //           customerName: d.customer,
  //           deliveryTime: d.dateTime,
  //           litres: d.litres,
  //           amount: d.amount,
  //         }));
  //       setRecentDeliveries(recentMapped);
  //     } catch (e: any) {
  //       setVansError("Failed to load data");
  //     } finally {
  //       setVansLoading(false);
  //     }
  //   };

  //   fetchAll();
  // }, [accessToken, isWorker, workerId]);

  const fetchAll = useCallback(async () => {
    if (!accessToken) return;
    setVansLoading(true);
    setVansError(null);
    try {
      const isToday = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        return d.toDateString() === now.toDateString();
      };

      const [vansRes, rateRes, intakesRes, deliveriesRes] = await Promise.all([
        VanService.getVans(accessToken),
        FuelRateService.getDieselRate(accessToken),
        IntakeService.getIntakes(accessToken),
        DeliveryService.getDeliveries(accessToken),
      ]);

      let filteredVans: Van[] = vansRes || [];
      if (isWorker) {
        const idToMatch = workerId || user?._id || "";
        filteredVans = filteredVans.filter((v) => (v.assignedWorker || "") === idToMatch);
      }
      setVans(filteredVans);
      setCurrentRate(rateRes || 0);

      const allowedVanNos = new Set((filteredVans || []).map((v) => v.vanNo));
      const todaysIntakes = (intakesRes || [])
        .filter((i: IntakeItem) => isToday(i.dateTime))
        .filter((i: IntakeItem) => allowedVanNos.size === 0 || allowedVanNos.has(i.vanNo));
      const todaysDeliveries = (deliveriesRes || [])
        .filter((d: DeliveryItem) => isToday(d.dateTime))
        .filter((d: DeliveryItem) => allowedVanNos.size === 0 || allowedVanNos.has(d.vanNo));

      const intakeLitres = todaysIntakes.reduce((sum, i) => sum + (i.litres || 0), 0);
      const deliveredLitres = todaysDeliveries.reduce((sum, d) => sum + (d.litres || 0), 0);
      setTotalIntake(intakeLitres);
      setTotalDelivered(deliveredLitres);

      const recentMapped = todaysDeliveries
        .slice()
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        .slice(0, 5)
        .map((d) => ({
          _id: d._id,
          customerName: d.customer,
          deliveryTime: d.dateTime,
          litres: d.litres,
          amount: d.amount,
          workerName: d.workerName, 
          vanNo: d.vanNo,
        }));
      setRecentDeliveries(recentMapped);
    } catch (e) {
      setVansError("Failed to load data");
    } finally {
      setVansLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, isWorker, workerId, user?._id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]); 

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  if (authLoading) return <ActivityIndicator style={styles.activityIndicator} color={colors.primary} size="large" />;

  if (!isAuthenticated) return <Redirect href="/(auth)/AuthChoice" />;

  
  console.log("totalIntake",totalIntake) 
  
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
            isWorker ? null : (
              <TouchableOpacity onPress={() => router.push("/(notifications)")} style={styles.notificationIconContainer}>
                <SimpleLineIcons name="bell" size={24} color={colors.text} />
                <NotificationBadge count={unread} size="medium" />
              </TouchableOpacity>
            )
          }
          showBottomBorder={true}
        />
        <ScrollView
          refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.text}         // iOS spinner color
                colors={[colors.primary || "#000"]} // Android spinner color(s)
                progressViewOffset={64}          // moves spinner below header
              />
            }
          >
          <View style={styles.vansContainer}>
            {vansLoading && (
              <ActivityIndicator style={styles.activityIndicator} color={colors.primary} size="small" />
            )}
            {!vansLoading && vans.map((van) => (
              <VanCard
                key={van._id}
                vanName={van.vanNo || van.name}
                name={van.name}
                dieselLevel={van.currentDiesel}
                maxCapacity={van.capacity}
                colors={{
                  cardBackground: colors.backgroundSecondary,
                  text: colors.text,
                  textDim: colors.textDim,
                  border: colors.border,
                }}
                workerName={van.workerName}
                fullWidth={!vansLoading && vans.length === 1}
              />
            ))}
          </View>

          <SummaryCard
            summary={{
              totalIntake,
              totalDelivered,
              netBalance: totalIntake - totalDelivered,
              currentRate,
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
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
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