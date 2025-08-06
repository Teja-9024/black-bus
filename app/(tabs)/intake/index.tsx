import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import Button from "@/components/Button";
import CustomTextInput from "@/components/CustomTextInput";
import DateTimePickerComponent from "@/components/DateTimePickerComponent";
import CustomDropdown from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native-gesture-handler";

// 🔸 Define form type
type TFormData = {
  vanName: string;
  workerName: string;
  pumpName: string;
  litres: string;
  amount: string;
  intakeTime: Date;
};

const VAN_LIST = [
  { vanName: "Van 1", vanid: "van1" },
  { vanName: "Van 2", vanid: "van2" },
];

export default function IntakeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
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

  const [inputType, setInputType] = useState<'litres' | 'amount'>('litres');

  const litres = watch("litres") || "0.00";
  const amount = watch("amount") || "0.00";
  const rate = 92.5;

  const calculateFromLitres = (val: string) => {
    const parsed = parseFloat(val) || 0;
    return (parsed * rate).toFixed(2);
  };

  const calculateFromAmount = (val: string) => {
    const parsed = parseFloat(val) || 0;
    return (parsed / rate).toFixed(2);
  };

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Add Diesel Intake</ThemedText>
              <ThemedText style={styles.subtitle}>Record diesel received from pump</ThemedText>
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

        <ScrollView>
          <ThemedView style={{ paddingHorizontal: 16, gap: 16, marginTop: 16, }}>
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

            <Controller
              control={control}
              name="workerName"
              render={({ field: { value } }) => (
                <CustomTextInput
                  label="Worker Name"
                  value={"Ramesh Singh"}
                  editable={false}
                  bordered
                />
              )}
            />

            <Controller
              control={control}
              name="pumpName"
              render={({ field: { value } }) => (
                <CustomTextInput
                  label="Pump Name"
                  value={"Sonu Petroleum Service"}
                  editable={false}
                  bordered
                />
              )}
            />

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, inputType === 'litres' && { backgroundColor: colors.primary }]}
                onPress={() => setInputType('litres')}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'litres' ? '#fff' : colors.text }]}>Enter Litres</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, inputType === 'amount' && { backgroundColor: colors.primary }]}
                onPress={() => setInputType('amount')}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'amount' ? '#fff' : colors.text }]}>Enter Amount (₹)</ThemedText>
              </TouchableOpacity>
            </View>

            {inputType === 'litres' ? (
              <Controller
                control={control}
                name="litres"
                render={({ field: { value, onChange } }) => (
                  <CustomTextInput
                    label="Litres Received *"
                    value={value}
                    placeholder="Enter litres received"
                    onChangeText={(text) => {
                      onChange(text);
                      setValue("amount", calculateFromLitres(text));
                    }}
                    keyboardType="decimal-pad"
                    bordered
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="amount"
                render={({ field: { value, onChange } }) => (
                  <CustomTextInput
                    label="Amount (₹)"
                    value={value}
                    placeholder="Enter amount in ₹"
                    onChangeText={(text) => {
                      onChange(text);
                      setValue("litres", calculateFromAmount(text));
                    }}
                    keyboardType="decimal-pad"
                    bordered
                  />
                )}
              />
            )}

            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 10,
                padding: 16,
                marginTop: 12,
                borderWidth: 1,
                // borderColor: '#e0e0e0'
                borderColor: '#555555',
                
              }}
            >
              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ color: colors.text, fontSize: 12 }}>Litres</ThemedText>
                <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  {litres}L
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ color: colors.text, fontSize: 12 }}>Amount</ThemedText>
                <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  ₹{amount}
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ color: colors.text, fontSize: 12 }}>Rate</ThemedText>
                <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  ₹{rate}/L
                </ThemedText>
              </ThemedView>
            </ThemedView>


            <Controller
              control={control}
              name="intakeTime"
              render={({ field: { value, onChange } }) => (
                <DateTimePickerComponent
                  label="Date & Time"
                  value={value}
                  onDateChange={onChange}
                  maximumDate={new Date()}
                />
              )}
            />
          </ThemedView>
          <ThemedView style={styles.buttonsContainer}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Button title="Save" onPress={() => console.log('')} style={styles.saveButton}/>
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" onPress={() => console.log('')} />
            </View>
          </ThemedView>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
  },
  leftContent: {
    gap: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  toggleText: {
    fontWeight: "bold",
  },
  notificationIconContainer: {
    position: "relative",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15, 
    gap: 10, 
    marginTop: 10,
  },
  saveButton:{
    backgroundColor: "#FFC107", 
  }

});
