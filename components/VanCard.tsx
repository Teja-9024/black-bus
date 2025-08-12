import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

// Utility to get progress bar color
const getProgressColor = (percentage: number) => {
  if (percentage >= 75) return "#4CAF50"; // green
  if (percentage >= 40) return "#FFC107"; // yellow
  return "#F44336"; // red
};

type VanCardProps = {
  vanName: string;
  name: string;
  dieselLevel: number;
  maxCapacity: number;
  colors: {
    cardBackground: string;
    text: string;
    textDim: string;
    border: string;
  };
  fullWidth?: boolean;
};

export const VanCard = ({ vanName, name, dieselLevel, maxCapacity, colors, fullWidth = false }: VanCardProps) => {
  const dieselPercentage = (dieselLevel / maxCapacity) * 100;

  return (
    <ThemedView style={[styles.container, fullWidth && styles.fullWidth, { backgroundColor: colors.cardBackground }]}> 
      <ThemedView style={styles.header}>
        <MaterialCommunityIcons name="truck-delivery" size={26} color="white" />
        <ThemedText style={[styles.vanName, { color: colors.text }]}>{vanName}</ThemedText>
        <ThemedText style={[styles.name, { color: colors.text }]}>{name}</ThemedText>
        <ThemedText style={[styles.dieselLevel, { color: colors.textDim }]}>
          {dieselLevel.toFixed(1)}L / {maxCapacity}L
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.progressContainer}>
        <ThemedView style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <ThemedView
            style={[
              styles.progressFill,
              {
                backgroundColor: getProgressColor(dieselPercentage),
                width: `${dieselPercentage}%`,
              },
            ]}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView>
        <ThemedText style={[styles.capacity, { color: colors.textDim }]}>
          Capacity: {maxCapacity}L
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '49%',
    // margin: 10,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  fullWidth: {
    width: '100%',
  },
  header: {
    // flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between",
    marginBottom: 10,
  },
  vanName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  name:{
    fontSize: 16,
  },
  dieselLevel: {
    fontSize: 14,
  },
  progressContainer: {
    marginVertical: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  capacity: {
    fontSize: 10,
    textAlign: "right",
  },
});
