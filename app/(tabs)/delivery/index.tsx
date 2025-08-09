
import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import DeliveryService from "@/services/DeliveryService";
import FuelRateService from "@/services/FuelRateService";
import VanService, { Van } from "@/services/VanService";
import { ScrollView } from "react-native-gesture-handler";

// 🔸 Define form type
type TFormData = {
  vanName: string;
  workerName: string;
  supplierName: string;
  customerName: string;
  litres: string;
  amount: string;
  intakeTime: Date;
};

type VanOption = { vanName: string; vanid: string };

const SUPPLIER_LIST = [
  { supplierName: "L&T Construction", supplierId: "L&T Construction" },
  { supplierName: "Tata Power", supplierId: "Tata Power" },
  { supplierName: "Reliance Industries", supplierId: "Reliance Industries" },
  { supplierName: "Adani Group", supplierId: "Adani Group" },
  { supplierName: "Mahindra & Mahindra", supplierId: "Mahindra & Mahindra" },
  { supplierName: "S.K. Industries", supplierId: "S.K. Industries" },
  { supplierName: "Bajaj Auto", supplierId: "Bajaj Auto" },
  { supplierName: "Hero MotoCorp", supplierId: "Hero MotoCorp" },
];




export default function DeliveryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { accessToken, user } = useAuth();
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
  const [rate, setRate] = useState<number>(0);
  const [vanOptions, setVanOptions] = useState<VanOption[]>([]);

  const litres = watch("litres") || "0.00";
  const amount = watch("amount") || "0.00";

  const calculateFromLitres = (val: string) => {
    const parsed = parseFloat(val) || 0;
    return (parsed * rate).toFixed(2);
  };

  const calculateFromAmount = (val: string) => {
    const parsed = parseFloat(val) || 0;
    if (!rate || rate <= 0) return "0.00";
    return (parsed / rate).toFixed(2);
  };

  useEffect(() => {
    const init = async () => {
      if (!accessToken) return;
      const [r, vans] = await Promise.all([
        FuelRateService.getDieselRate(accessToken),
        VanService.getVans(accessToken),
      ]);
      setRate(r || 0);
      const opts: VanOption[] = (vans || []).map((v: Van) => ({
        vanName: `${v.vanNo} - ${v.name}`,
        vanid: v.vanNo,
      }));
      setVanOptions(opts);
    };
    init();
  }, [accessToken]);

  const onSubmit = async (values: TFormData) => {
    if (!accessToken) return;
    const vanNo = values.vanName; // valueField is vanid
    // const workerName = (`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) || user?.email || values.workerName || "";
    const supplier = values.supplierName;
    const customer = values.customerName;
    const litresNum = parseFloat(values.litres || "0");
    const amountNum = parseFloat(values.amount || "0");
    const payload = {
      vanNo,
      supplier,
      customer,
      litres: litresNum,
      amount: amountNum,
      dateTime: (values.intakeTime || new Date()).toISOString(),
    };
    const res=await DeliveryService.createDelivery(accessToken, payload);
    console.log("createDelivery",res)
  };

  return (
    <LinearGradient colors={colors.gradient} style={styles.gradientContainer}>
      <ThemedSafeArea style={styles.container}>
        <CommonHeader
          leftContent={
            <View style={styles.leftContent}>
              <ThemedText style={styles.title}>Add Delivery Entry</ThemedText>
              <ThemedText style={styles.subtitle}>Record diesel delivered to customers</ThemedText>
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
                  data={vanOptions}
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
                  value={( `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) || user?.email || ""}
                  editable={false}
                  bordered
                />
              )}
            />

             <Controller
              control={control}
              name="supplierName"
              rules={{ required: "Company/Supplier name is required" }}
              render={({ field: { onChange, value } }) => (
                <CustomDropdown
                  label="Company/Supplier *"
                  data={SUPPLIER_LIST}
                  value={value}
                  onChange={onChange}
                  errorMsg={errors.supplierName?.message}
                  placeholder={"Select Supplier..."}
                  labelField={"supplierName"}
                  valueField={"supplierId"}
                />
              )}
            />

            <Controller
                control={control}
                name="customerName"
                render={({ field: { value, onChange } }) => (
                  <CustomTextInput
                    label="Customer Name *"
                    value={value}
                    placeholder="Enter customer name"
                    onChangeText={(text) => onChange(text)}
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
                    label="Litres Delivered * *"
                    value={value}
                    placeholder="Enter litres delivered *"
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
                  label="Date & Time of Delivery *"
                  value={value}
                  onDateChange={onChange}
                  maximumDate={new Date()}
                />
              )}
            />
          </ThemedView>
          <ThemedView style={styles.buttonsContainer}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Button title="Save" onPress={handleSubmit(onSubmit)} style={styles.saveButton}/>
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
