import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import DateTimePickerComponent from "@/components/DateTimePickerComponent";
import CustomDropdown from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";

type TFormData = {
  vanName: string;
  workerName: string;
  pumpName: string;
  litres: string;
  amount: string;
  intakeTime: Date;
};

type ReportSummary = {
  totalIntake: number;
  totalDelivered: number;
};

type ReportTransaction = {
  type: "intake" | "delivery";
  van: string;
  worker: string;
  company: string;
  date: Date;
  litres: number;
  amount: number;
};

const summary: ReportSummary = {
  totalIntake: 800,
  totalDelivered: 300,
};

const transactions: ReportTransaction[] = [
  {
    type: "intake",
    van: "VAN1",
    worker: "Ravi Kumar",
    company: "Sonu Petroleum Service",
    date: new Date("2025-08-06T13:38:00"),
    litres: 800,
    amount: 74000,
  },
  {
    type: "delivery",
    van: "VAN1",
    worker: "Ravi Kumar",
    company: "L&T Construction",
    date: new Date("2025-08-06T10:30:00"),
    litres: 300,
    amount: 27750,
  },
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const SummaryCard = ({ summary }: { summary: ReportSummary }) => (
  <ThemedView style={styles.summaryContainer}>
    <ThemedView style={[styles.summaryBox, { backgroundColor: "#e6f9ef" }]}>
      <ThemedText style={[styles.summaryValue, { color: "#00b96b" }]}>
        {summary.totalIntake}L
      </ThemedText>
      <ThemedText style={styles.summaryLabel}>Total Intake</ThemedText>
    </ThemedView>
    <ThemedView style={[styles.summaryBox, { backgroundColor: "#e6f0ff" }]}>
      <ThemedText style={[styles.summaryValue, { color: "#3b82f6" }]}>
        {summary.totalDelivered}L
      </ThemedText>
      <ThemedText style={styles.summaryLabel}>Total Delivered</ThemedText>
    </ThemedView>
  </ThemedView>
);

const TransactionCard = ({ tx }: { tx: ReportTransaction }) => (
  <ThemedView style={styles.card}>
    <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      {tx.type === "intake" ? (
        <MaterialCommunityIcons name="fuel" size={20} color="#00b96b" />
      ) : (
        <MaterialIcons name="local-shipping" size={20} color="#3b82f6" />
      )}
      <ThemedText
        style={[
          styles.cardTitle,
          { color: tx.type === "intake" ? "#00b96b" : "#3b82f6" },
        ]}
      >
        {tx.type === "intake" ? "Diesel Intake" : "Delivery"}
      </ThemedText>
      <ThemedText
        style={{
          marginLeft: "auto",
          color: tx.type === "intake" ? "#00b96b" : "#3b82f6",
          fontWeight: "bold",
        }}
      >
        {tx.type === "intake" ? "+" : ""}
        {tx.litres}L
      </ThemedText>
    </ThemedView>
    <ThemedText style={styles.cardSub}>
      {tx.van} • {tx.worker}
    </ThemedText>
    <ThemedText style={styles.cardSub}>{tx.company}</ThemedText>
    <ThemedView style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
      <ThemedText style={styles.cardDate}>
        {formatDate(tx.date)} • {formatTime(tx.date)}
      </ThemedText>
      <ThemedText style={styles.cardAmount}>₹{tx.amount.toLocaleString()}</ThemedText>
    </ThemedView>
  </ThemedView>
);

export default function ReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());

  const {
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
    } = useForm<TFormData>({
      defaultValues: {
        intakeTime: new Date(),
      },
    });

    const VAN_LIST = [
  { vanName: "Van 1", vanid: "van1" },
  { vanName: "Van 2", vanid: "van2" },
];

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Reports & Export</ThemedText>
            </View>
          }
          rightContent1={
            <TouchableOpacity
              onPress={() => router.push("/(notifications)")}
              style={styles.notificationIconContainer}
            >
              <SimpleLineIcons name="bell" size={24} color={colors.text} />
            </TouchableOpacity>
          }
          showBottomBorder={true}
        />
        
        <ThemedView style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Date Range & Filters
          </ThemedText>
          <ThemedView style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <ThemedView style={{ flex: 0.5 }}>
              <DateTimePickerComponent
                label="Start Date"
                value={startDate}
                onDateChange={setStartDate}
                mode="date"
              />
             </ThemedView>
             <ThemedView style={{ flex: 0.5 }}>
                <DateTimePickerComponent
                label="End Date"
                value={endDate}
                onDateChange={setEndDate}
                mode="date"
                />
             </ThemedView>
           
          </ThemedView>
          <Controller
              control={control}
              name="vanName"
              rules={{ required: "Van name is required" }}
              render={({ field: { onChange, value } }) => (
                <CustomDropdown
                  label="Select Van *"
                  data={VAN_LIST}
                  value={value}
                  onChange={onChange}
                  errorMsg={errors.vanName?.message}
                  placeholder={"Select Van..."}
                  labelField={"vanName"}
                  valueField={"vanid"}
                />
              )}
            />
        </ThemedView>

        {/* Reports Content */}
        <ThemedView style={styles.reportsContent}>
          <ThemedText style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Summary</ThemedText>
          <SummaryCard summary={summary} />
          <FlatList
            data={transactions}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => <TransactionCard tx={item} />}
            contentContainerStyle={{ paddingTop: 8 }}
          />
        </ThemedView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    marginLeft: 8,
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
  reportsContent: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  cardSub: {
    color: "#555",
    fontSize: 13,
    marginTop: 2,
  },
  cardDate: {
    color: "#888",
    fontSize: 12,
  },
  cardAmount: {
    fontWeight: "bold",
    color: "#222",
    fontSize: 14,
  },
});