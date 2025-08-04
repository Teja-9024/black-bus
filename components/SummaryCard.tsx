// import { useTheme } from "@/context/ThemeContext";
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
// import React from "react";
// import { StyleSheet, View } from "react-native";
// import { ThemedText } from "./ThemedText";
// import { ThemedView } from "./ThemedView";

// interface SummaryCardProps {
//   summary: {
//     totalIntake: number;
//     totalDelivered: number;
//     netBalance: number;
//     currentRate: number;
//   };
// }

// export default function SummaryCard({ summary }: SummaryCardProps) {
//   const { colors } = useTheme();

//   const metrics = [
//     {
//       label: "Total Intake",
//       value: `${summary.totalIntake.toFixed(1)}L`,
//       color: "#4CAF50",
//     },
//     {
//       label: "Delivered",
//       value: `${summary.totalDelivered.toFixed(1)}L`,
//       color: "#F44336",
//     },
//     {
//       label: "Net Balance",
//       value: `${summary.netBalance.toFixed(1)}L`,
//       color: colors.text,
//     },
//     {
//       label: "Current Rate",
//       value: `₹${summary.currentRate}/L`,
//       color: colors.primary,
//     },
//   ];

//   return (
//     <ThemedView style={[styles.container, { backgroundColor: colors.cardBackground }]}>
//       <View style={styles.header}>
//         <FontAwesome5
//           name="gas-pump"
//           size={24}
//           color="white"
//         />
//         <ThemedText style={[styles.title, { color: colors.text }]}>Today's Summary</ThemedText>
//       </View>

//       <ThemedView style={styles.grid}>
//         {metrics.map((item, index) => (
//           <ThemedView key={index} style={styles.item}>
//             <ThemedText style={[styles.label, { color: colors.textDim }]}>{item.label}</ThemedText>
//             <ThemedText style={[styles.value, { color: item.color }]}>{item.value}</ThemedText>
//           </ThemedView>
//         ))}
//       </ThemedView>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     borderRadius: 10,
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     backgroundColor: '#fff',
//     marginBottom: 8,
//   },
//   header:{
//     flexDirection: "row",
//     gap: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     rowGap: 16,
//   },
//   item: {
//     width: "48%",
//     alignItems: "center",
//   },
//   label: {
//     fontSize: 13,
//     textAlign: "center",
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginTop: 4,
//   },
// });

import { useTheme } from "@/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SummaryCardProps {
  summary: {
    totalIntake: number;
    totalDelivered: number;
    netBalance: number;
    currentRate: number;
  };
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const { colors } = useTheme();

  const formatNumber = (n: number) => `${n >= 0 ? "+" : "-"}${Math.abs(n)}L`;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="gas-station" size={20} color={colors.text} />
        <ThemedText style={[styles.title, { color: colors.text }]}>
          Today's Summary
        </ThemedText>
      </View>

      {/* Intake */}
      <View style={styles.row}>
        <ThemedText style={[styles.label, { color: colors.text }]}>Total Intake:</ThemedText>
        <ThemedText style={[styles.value, { color: "#4CAF50" }]}>
          {formatNumber(summary.totalIntake)}
        </ThemedText>
      </View>

      {/* Delivered */}
      <View style={styles.row}>
        <ThemedText style={[styles.label, { color: colors.text }]}>Total Delivered:</ThemedText>
        <ThemedText style={[styles.value, { color: "#F44336" }]}>
          {formatNumber(summary.totalDelivered)}
        </ThemedText>
      </View>

      <View style={[styles.divider, { borderBottomColor: colors.border }]} />

      {/* Net Balance */}
      <View style={styles.row}>
        <ThemedText style={[styles.labelBold, { color: colors.text }]}>Net Balance:</ThemedText>
        <ThemedText style={[styles.valueBold, { color: "#2196F3" }]}>
          {formatNumber(summary.netBalance)}
        </ThemedText>
      </View>

      {/* Current Rate */}
      <View style={styles.row}>
        <ThemedText style={[styles.label, { color: colors.text }]}>Current Rate:</ThemedText>
        <ThemedText style={[styles.value, { color: colors.text }]}>
          ₹{summary.currentRate}/L
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    marginHorizontal:5
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
  },
  labelBold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  valueBold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
});

