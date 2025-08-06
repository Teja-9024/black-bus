import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Button from "./Button";
import { ThemedView } from "./ThemedView";

interface DateTimePickerComponentProps {
  label: string;
  value: Date | null;
  onDateChange: (date: Date | null) => void;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DateTimePickerComponent({
  label,
  value,
  onDateChange,
  maximumDate,
  minimumDate,
}: DateTimePickerComponentProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(value || new Date());
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date');
  const { colors } = useTheme();

  // Reset tempDate when value changes
  useEffect(() => {
    setTempDate(value || new Date());
  }, [value]);

  // Format date and time for display (DD-MM-YYYY HH:MM format)
  const formatDateTime = (date: Date | null) => {
    if (!date) return "Select Date & Time";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleDateTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (_event.type === 'dismissed') {
        setShow(false);
        setCurrentMode('date'); // Reset mode
        return;
      }
      
      if (selectedDate) {
        if (currentMode === 'date') {
          // Date selected, now show time picker
          const newDateTime = new Date(tempDate || new Date());
          newDateTime.setFullYear(selectedDate.getFullYear());
          newDateTime.setMonth(selectedDate.getMonth());
          newDateTime.setDate(selectedDate.getDate());
          setTempDate(newDateTime);
          setCurrentMode('time');
          // Keep showing picker for time selection
        } else {
          // Time selected, combine and finish
          const finalDateTime = new Date(tempDate || new Date());
          finalDateTime.setHours(selectedDate.getHours());
          finalDateTime.setMinutes(selectedDate.getMinutes());
          setTempDate(finalDateTime);
          onDateChange(finalDateTime);
          setShow(false);
          setCurrentMode('date'); // Reset for next time
        }
      }
    } else {
      // iOS - update temp value
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    setShow(false);
    setCurrentMode('date'); // Reset mode
    if (tempDate) {
      onDateChange(tempDate);
    }
  };

  const handleCancel = () => {
    setShow(false);
    setCurrentMode('date'); // Reset mode
    setTempDate(value || new Date());
  };

  const showPicker = () => {
    setTempDate(value || new Date());
    setCurrentMode('date'); // Always start with date
    setShow(true);
  };

  const renderIOSModal = () => (
    <Modal 
      animationType="slide" 
      transparent 
      visible={show} 
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} 
        onPress={handleCancel}
      >
        <Pressable 
          style={[styles.pickerWrapper, { backgroundColor: colors.backgroundSecondary }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Mode Switch Buttons for iOS */}
          <View style={[styles.modeSelector, { backgroundColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                currentMode === 'date' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setCurrentMode('date')}
            >
              <ThemedText style={[
                styles.modeButtonText,
                { color: currentMode === 'date' ? '#fff' : colors.text }
              ]}>
                Date
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                currentMode === 'time' && { backgroundColor: colors.primary }
              ]}
              onPress={() => setCurrentMode('time')}
            >
              <ThemedText style={[
                styles.modeButtonText,
                { color: currentMode === 'time' ? '#fff' : colors.text }
              ]}>
                Time
              </ThemedText>
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={tempDate || new Date()}
            mode={currentMode}
            display="spinner"
            // @ts-ignore
            is24Hour={true}
            onChange={handleDateTimeChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            style={{ width: "100%" }}
          />
          
          <ThemedView style={styles.modalButtonRow}>
            <Button title="Cancel" onPress={handleCancel} style={styles.modalButton} />
            <Button title="Confirm" onPress={handleConfirm} style={styles.modalButton} />
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderAndroidPicker = () => {
    if (!show) return null;
    
    return (
      <DateTimePicker
        value={tempDate || new Date()}
        mode={currentMode}
        display="default"
        // @ts-ignore
        is24Hour={true}
        onChange={handleDateTimeChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <TouchableOpacity
        onPress={showPicker}
        style={[styles.dateInput, { borderColor: colors.border }]}
      >
        <View style={styles.dateRow}>
          <ThemedText style={{ 
            color: value ? colors.text : colors.textDim,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Monospace for better alignment
          }}>
            {formatDateTime(value)}
          </ThemedText>
          <View style={styles.iconContainer}>
            <Icon name="calendar" size={18} color={colors.textDim} style={styles.calendarIcon} />
            <Icon name="clock" size={18} color={colors.textDim} />
          </View>
        </View>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? renderIOSModal() : renderAndroidPicker()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 5,
    fontWeight: "500",
  },
  dateInput: {
    height: 60,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  pickerWrapper: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modeSelector: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "ios" ? 15 : 40,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});