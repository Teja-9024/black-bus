import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import Button from "@/components/Button";
import DateTimePickerComponent from "@/components/DateTimePickerComponent";
import CustomDropdown from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { useNotificationsCtx } from "@/context/NotificationContext";
import DeliveryService, { DeliveryItem } from "@/services/DeliveryService";
import IntakeService, { IntakeItem } from "@/services/IntakeService";
import VanService, { Van } from "@/services/VanService";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { Controller, useForm } from "react-hook-form";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

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

// Derived at runtime
const initialSummary: ReportSummary = { totalIntake: 0, totalDelivered: 0 };

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
  const { accessToken } = useAuth();
  const { unread } = useNotificationsCtx();
  const [startDate, setStartDate] = React.useState<Date | null>(new Date());
  const [endDate, setEndDate] = React.useState<Date | null>(new Date());
  const [vans, setVans] = React.useState<Van[]>([]);
  const [intakes, setIntakes] = React.useState<IntakeItem[]>([]);
  const [deliveries, setDeliveries] = React.useState<DeliveryItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = React.useState<boolean>(false);

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

  const VAN_LIST = React.useMemo(
    () =>
      vans.map((v) => ({ vanName: v.name || v.vanNo, vanid: v.vanNo })),
    [vans]
  );

  React.useEffect(() => {
    const fetchAll = async () => {
      if (!accessToken) return;
      try {
        setLoading(true);
        const [vansRes, intakesRes, deliveriesRes] = await Promise.all([
          VanService.getVans(accessToken),
          IntakeService.getIntakes(accessToken),
          DeliveryService.getDeliveries(accessToken),
        ]);
        setVans(vansRes || []);
        setIntakes(intakesRes || []);
        setDeliveries(deliveriesRes || []);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Failed to load reports' });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [accessToken]);

  const selectedVanNo = watch('vanName');

  const filteredTransactions: ReportTransaction[] = React.useMemo(() => {
    const withinRange = (iso: string) => {
      const d = new Date(iso);
      if (startDate) {
        const startCopy = new Date(startDate);
        startCopy.setHours(0, 0, 0, 0);
        if (d < startCopy) return false;
      }
      if (endDate) {
        const endCopy = new Date(endDate);
        endCopy.setHours(23, 59, 59, 999);
        if (d > endCopy) return false;
      }
      return true;
    };

    const intakeTx: ReportTransaction[] = (intakes || [])
      .filter((i) => withinRange(i.dateTime) && (!selectedVanNo || i.vanNo === selectedVanNo))
      .map((i) => ({
        type: 'intake' as const,
        van: i.vanNo,
        worker: i.worker?.name || i.workerName || '-',
        company: i.pumpName,
        date: new Date(i.dateTime),
        litres: i.litres || 0,
        amount: i.amount || 0,
      }));

    const deliveryTx: ReportTransaction[] = (deliveries || [])
      .filter((d) => withinRange(d.dateTime) && (!selectedVanNo || d.vanNo === selectedVanNo))
      .map((d) => ({
        type: 'delivery' as const,
        van: d.vanNo,
        worker: d.worker?.name || d.workerName || '-',
        company: d.customer,
        date: new Date(d.dateTime),
        litres: d.litres || 0,
        amount: d.amount || 0,
      }));

    const merged = [...intakeTx, ...deliveryTx].sort((a, b) => b.date.getTime() - a.date.getTime());
    return merged;
  }, [intakes, deliveries, startDate, endDate, selectedVanNo]);

  const summary: ReportSummary = React.useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        if (tx.type === 'intake') acc.totalIntake += tx.litres;
        else acc.totalDelivered += tx.litres;
        return acc;
      },
      { ...initialSummary }
    );
  }, [filteredTransactions]);

  const exportCSV = async () => {
    try {
      if (filteredTransactions.length === 0) {
        Toast.show({ type: 'info', text1: 'No data to export. Please apply filters first.' });
        return;
      }

      console.log('Exporting CSV with', filteredTransactions.length, 'transactions');
      
      const headers = ['Type', 'Van', 'Worker', 'Company', 'Date', 'Time', 'Litres', 'Amount'];
      const rows = filteredTransactions.map((tx) => [
        tx.type,
        tx.van,
        tx.worker,
        tx.company,
        formatDate(tx.date),
        formatTime(tx.date),
        String(tx.litres),
        String(tx.amount),
      ]);
      
      const csv = [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      console.log('CSV content length:', csv.length);

      if (Platform.OS === 'web') {
        // Web export
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.show({ type: 'success', text1: 'Excel (CSV) downloaded successfully' });
        return;
      }

      // Mobile export - try cache directory first, then documents
      try {
        const fileName = `report_${Date.now()}.csv`;
        
        // Try cache directory first (sometimes works better with MediaLibrary)
        let fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        console.log('Trying cache directory first:', fileUri);
        
        await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
        
        // Try to save to media library
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.granted) {
          try {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            Toast.show({ type: 'success', text1: 'Excel (CSV) exported to Downloads folder' });
            return;
          } catch (mediaError) {
            console.log('Cache directory MediaLibrary failed, trying documents directory...');
            
            // Fallback to documents directory
            const documentsDir = FileSystem.documentDirectory;
            const docFileUri = `${documentsDir}${fileName}`;
            
            await FileSystem.writeAsStringAsync(docFileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
            
            try {
              const asset2 = await MediaLibrary.createAssetAsync(docFileUri);
              await MediaLibrary.createAlbumAsync('Download', asset2, false);
              Toast.show({ type: 'success', text1: 'Excel (CSV) exported to Downloads folder' });
              return;
            } catch (mediaError2) {
              console.log('Documents directory MediaLibrary also failed, file saved to documents:', docFileUri);
              Toast.show({ 
                type: 'success', 
                text1: `CSV saved to Documents folder`, 
                text2: `File: ${fileName} - Check Files app > Documents` 
              });
            }
          }
        } else {
          // No permission, save to documents
          const documentsDir = FileSystem.documentDirectory;
          const docFileUri = `${documentsDir}${fileName}`;
          await FileSystem.writeAsStringAsync(docFileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
          Toast.show({ 
            type: 'info', 
            text1: `CSV saved to Documents folder`, 
            text2: `File: ${fileName} - Check Files app > Documents` 
          });
        }
      } catch (fileError) {
        console.error('File write error:', fileError);
        Toast.show({ type: 'error', text1: 'Failed to save file. Please check permissions.' });
      }
    } catch (e: any) {
      console.error('CSV export error:', e);
      Toast.show({ type: 'error', text1: `Export failed: ${e.message || 'Unknown error'}` });
    }
  };

  const exportPDF = async () => {
    try {
      if (filteredTransactions.length === 0) {
        Toast.show({ type: 'info', text1: 'No data to export. Please apply filters first.' });
        return;
      }

      console.log('Exporting PDF with', filteredTransactions.length, 'transactions');

      const rows = filteredTransactions
        .map(
          (tx) => `
            <tr>
              <td>${tx.type}</td>
              <td>${tx.van}</td>
              <td>${tx.worker}</td>
              <td>${tx.company}</td>
              <td>${formatDate(tx.date)} ${formatTime(tx.date)}</td>
              <td>${tx.litres}</td>
              <td>${tx.amount}</td>
            </tr>`
        )
        .join('');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background: #f5f5f5; font-weight: bold; }
              .summary { background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Sonu Petroleum - Reports</h2>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="summary">
              <h3>Summary</h3>
              <p><strong>Total Intake:</strong> ${summary.totalIntake}L</p>
              <p><strong>Total Delivered:</strong> ${summary.totalDelivered}L</p>
              <p><strong>Total Transactions:</strong> ${filteredTransactions.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Type</th><th>Van</th><th>Worker</th><th>Company</th><th>DateTime</th><th>Litres</th><th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
        </html>`;

      if (Platform.OS === 'web') {
        // Web export - download HTML file
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.show({ type: 'success', text1: 'Report downloaded. Open in browser and print to PDF.' });
        return;
      }

      // Mobile export - try cache directory first, then documents
      try {
        const fileName = `report_${Date.now()}.html`;
        
        // Try cache directory first (sometimes works better with MediaLibrary)
        let fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        console.log('Trying cache directory first:', fileUri);
        
        await FileSystem.writeAsStringAsync(fileUri, html, { encoding: FileSystem.EncodingType.UTF8 });
        
        // Try to save to media library
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.granted) {
          try {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            Toast.show({ type: 'success', text1: 'Report exported to Downloads. Open in browser to print to PDF.' });
            return;
          } catch (mediaError) {
            console.log('Cache directory MediaLibrary failed, trying documents directory...');
            
            // Fallback to documents directory
            const documentsDir = FileSystem.documentDirectory;
            const docFileUri = `${documentsDir}${fileName}`;
            
            await FileSystem.writeAsStringAsync(docFileUri, html, { encoding: FileSystem.EncodingType.UTF8 });
            
            try {
              const asset2 = await MediaLibrary.createAssetAsync(docFileUri);
              await MediaLibrary.createAlbumAsync('Download', asset2, false);
              Toast.show({ type: 'success', text1: 'Report exported to Downloads. Open in browser to print to PDF.' });
              return;
            } catch (mediaError2) {
              console.log('Documents directory MediaLibrary also failed, file saved to documents:', docFileUri);
              Toast.show({ 
                type: 'success', 
                text1: `Report saved to Documents folder`, 
                text2: `File: ${fileName} - Check Files app > Documents` 
              });
            }
          }
        } else {
          // No permission, save to documents
          const documentsDir = FileSystem.documentDirectory;
          const docFileUri = `${documentsDir}${fileName}`;
          await FileSystem.writeAsStringAsync(docFileUri, html, { encoding: FileSystem.EncodingType.UTF8 });
          Toast.show({ 
            type: 'info', 
            text1: `Report saved to Documents folder`, 
            text2: `File: ${fileName} - Check Files app > Documents` 
          });
        }
      } catch (fileError) {
        console.error('File write error:', fileError);
        Toast.show({ type: 'error', text1: 'Failed to save file. Please check permissions.' });
      }
    } catch (e: any) {
      console.error('PDF export error:', e);
      Toast.show({ type: 'error', text1: `Export failed: ${e.message || 'Unknown error'}` });
    }
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setValue('vanName', '');
    setFilterModalVisible(false);
  };

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
            <TouchableOpacity onPress={() => router.push("/(notifications)")} style={styles.notificationIconContainer}>
              <SimpleLineIcons name="bell" size={24} color={colors.text} />
              {unread > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.notificationBadgeText}>
                    {unread > 99 ? '99+' : unread}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          }
          showBottomBorder={true}
        />
        
        <ThemedView style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
              Reports & Analytics
            </ThemedText>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(true)}
              style={[styles.filterButton, { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name="filter-list" size={20} color="#fff" />
              <ThemedText style={styles.filterButtonText}>Filters</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Button title="Export to PDF" onPress={exportPDF} style={{ flex: 1,  }} />
            <Button title="Export to Excel" onPress={exportCSV} style={{ flex: 1, backgroundColor: '#22c55e' }} />
          </View>

          {/* Debug Info */}
          <ThemedView style={styles.debugInfo}>
            <ThemedText style={styles.debugText}>
              📊 Data: {filteredTransactions.length} transactions
            </ThemedText>
            <ThemedText style={styles.debugText}>
              📅 Date Range: {startDate ? formatDate(startDate) : 'Not set'} - {endDate ? formatDate(endDate) : 'Not set'}
            </ThemedText>
            <ThemedText style={styles.debugText}>
              🚐 Van Filter: {selectedVanNo || 'All vans'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setFilterModalVisible(false)}
          >
            <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Pressable onPress={() => {}}>
                <ThemedView style={styles.modalHeader}>
                  <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                    Filter Reports
                  </ThemedText>
                  <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </ThemedView>

                <ThemedView style={styles.modalBody}>
                  <ThemedText style={[styles.filterLabel, { color: colors.text }]}>
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
                    render={({ field: { onChange, value } }) => (
                      <CustomDropdown
                        label="Select Van (Optional)"
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

                  <ThemedView style={styles.modalActions}>
                    <Button 
                      title="Reset" 
                      onPress={resetFilters} 
                      style={[styles.resetButton, { borderColor: colors.border }]}
                      variant="outline"
                    />
                    <Button 
                      title="Apply Filters" 
                      onPress={applyFilters} 
                      style={styles.applyButton}
                    />
                  </ThemedView>
                </ThemedView>
              </Pressable>
            </ThemedView>
          </Pressable>
        </Modal>

        {/* Reports Content */}
        <ThemedView style={styles.reportsContent}>
          <ThemedText style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Summary</ThemedText>
          <SummaryCard summary={summary} />
          <FlatList
            data={filteredTransactions}
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
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
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
  debugInfo: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 14,
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
});