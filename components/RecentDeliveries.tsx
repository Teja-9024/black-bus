import { useTheme } from "@/context/ThemeContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export interface RecentDelivery {
  _id: string;
  customerName: string;
  deliveryTime: string;
  litres: number;
  amount: number;
}

interface RecentDeliveriesProps {
  deliveries: RecentDelivery[];
}

export default function RecentDeliveries({ deliveries }: RecentDeliveriesProps) {
  const { colors } = useTheme();

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderDeliveryItem = (delivery: RecentDelivery, isLast: boolean) => (
    <ThemedView
      key={delivery._id}
      style={[
        styles.item,
        !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 },
      ]}
    >
      <ThemedView style={styles.info}>
        <ThemedText style={[styles.name, { color: colors.text }]}>
          {delivery.customerName}
        </ThemedText>
        <ThemedText style={[styles.time, { color: colors.textDim }]}>
          {formatTime(delivery.deliveryTime)}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.details}>
        <ThemedText style={[styles.litres, { color: colors.primary }]}>
          {delivery.litres.toFixed(1)}L
        </ThemedText>
        <ThemedText style={[styles.amount, { color: colors.text }]}>
          ₹{delivery.amount.toFixed(2)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <ThemedText style={[styles.title, { color: colors.text }]}>Recent Deliveries</ThemedText>

      {deliveries.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <MaterialCommunityIcons name="truck-outline" size={48} color={colors.textDim} />
          <ThemedText style={[styles.emptyText, { color: colors.textDim }]}>
            No recent deliveries
          </ThemedText>
        </ThemedView>
      ) : (
        deliveries.map((delivery, idx) =>
          renderDeliveryItem(delivery, idx === deliveries.length - 1)
        )
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  details: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  litres: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  amount: {
    fontSize: 12,
  },
});
