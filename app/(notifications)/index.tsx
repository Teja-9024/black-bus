import BackButton from "@/components/BackButton";
import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useNotificationsCtx } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import NotificationService from "@/services/NotificationService";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Notif = {
  _id: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { setUnread, refreshUnreadFromList } = useNotificationsCtx();

  const [items, setItems] = useState<Notif[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cursor?: string) => {
    try {
      setError(null);
      const res = await NotificationService.list(cursor);
      if (cursor) {
        setItems(prev => [...prev, ...(res.data as Notif[])]);
      } else {
        setItems(res.data as Notif[]);
      }
      setNextCursor(res.nextCursor);
      // local unread update
      const cnt = (cursor ? [...items, ...(res.data as Notif[])] : res.data).filter((n: any) => !n.isRead).length;
      setUnread(cnt);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError('Failed to load notifications. Please check your connection and try again.');
    }
  }, [items, setUnread]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { 
      await load(); 
    } finally { 
      setRefreshing(false); 
    }
  }, [load]);

  const loadMore = useCallback(async () => {
    if (nextCursor) await load(nextCursor);
  }, [nextCursor, load]);

  useEffect(() => {
    (async () => {
      try { 
        await load(); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  const markRead = async (id: string) => {
    try {
      await NotificationService.markRead(id);
      setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      await refreshUnreadFromList();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAll = async () => {
    try {
      await NotificationService.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const renderItem = ({ item }: { item: Notif }) => (
    <TouchableOpacity
      onPress={() => markRead(item._id)}
      style={[
        styles.notificationCard,
        { backgroundColor: item.isRead ? "#f8f9fa" : "#e8f2ff" }
      ]}
    >
      <ThemedView style={styles.cardHeader}>
        <ThemedView style={[styles.dot, { backgroundColor: item.isRead ? "#6c757d" : "#007bff" }]} />
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.cardTime}>{timeAgo(item.createdAt)}</ThemedText>
      </ThemedView>

      <Text style={styles.cardText}>{item.body}</Text>
      
      {item.data?.vanNo && (
        <View style={styles.vanInfo}>
          <Text style={styles.vanText}>Van: {item.data.vanNo}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
        <ThemedSafeArea style={styles.container}>
          <CommonHeader
            title="Notifications"
            leftContent={<BackButton />}
            showBottomBorder
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={styles.loadingText}>Loading notifications...</ThemedText>
          </View>
        </ThemedSafeArea>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
        <ThemedSafeArea style={styles.container}>
          <CommonHeader
            title="Notifications"
            leftContent={<BackButton />}
            showBottomBorder
          />
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorTitle}>Unable to Load Notifications</ThemedText>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedSafeArea>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          title="Notifications"
          leftContent={<BackButton />}
          showBottomBorder
        />

        <FlatList
          data={items}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyTitle}>No notifications yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                You'll see your activity and alerts here.
              </ThemedText>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />

        {items.length > 0 && (
          <TouchableOpacity
            onPress={markAll}
            style={styles.markAllButton}
          >
            <ThemedText style={styles.markAllText}>Mark all read</ThemedText>
          </TouchableOpacity>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    paddingBottom: 100, // Space for floating button
  },
  notificationCard: {
    backgroundColor: "#e8f2ff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderColor: "#add6ff",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    color: "#000",
  },
  cardTime: {
    fontSize: 12,
    color: "#666",
  },
  cardText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  vanInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  vanText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#666",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  markAllButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  markAllText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
