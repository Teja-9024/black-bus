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
import { HandleApiError, showToast } from "@/constants/Functions";
import { useAuth } from "@/context/AuthContext";
import { useLoadingDialog } from "@/context/LoadingContext";
import { useNotificationsCtx } from "@/context/NotificationContext";
import FuelRateService from "@/services/FuelRateService";
import IntakeService from "@/services/IntakeService";
import VanService, { Van } from "@/services/VanService";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

type VanOption = { vanName: string; vanid: string };

export default function IntakeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { unread } = useNotificationsCtx();
  const loadingDialog = useLoadingDialog();

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
  const [workerName, setWorkerName] = useState<string>("");

  // guards to avoid ping-pong + unwanted conversions
  const [editing, setEditing] = useState<'litres' | 'amount' | null>(null);
  const [hasEditedLitres, setHasEditedLitres] = useState(false);
  const [hasEditedAmount, setHasEditedAmount] = useState(false);

  const setVal = (name: keyof TFormData, value: string) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: false });

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
      try {
        loadingDialog.show();
        const [r, vans] = await Promise.all([
          FuelRateService.getDieselRate(accessToken),
          VanService.getVans(accessToken),
        ]);
        setRate(r || 0);

        // Prefill amount with rate only if empty; do not mark as edited
        if (typeof r === 'number' && r > 0) {
          const currentAmount = watch('amount');
          if (!currentAmount || `${currentAmount}`.trim() === "" || currentAmount === "0.00") {
            setValue("amount", String(r), { shouldDirty: false, shouldTouch: false });
            setHasEditedAmount(false);
          }
        }

        const opts: VanOption[] = (vans || []).map((v: Van) => ({
          vanName: `${v.vanNo} - ${v.name}`,
          vanid: v.vanNo,
        }));
        setVanOptions(opts);
      } catch (e) {
        HandleApiError(e);
      } finally {
        loadingDialog.hide();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Load worker name from AsyncStorage (not from useAuth)
  useEffect(() => {
    const loadWorkerName = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            setWorkerName(parsed.name);
            setValue('workerName', parsed.name);
          }
        }
      } catch (_) {}
    };
    loadWorkerName();
  }, [setValue]);

  // When switching to Amount mode, if empty, prefill with current rate (not edited)
  useEffect(() => {
    if (inputType === 'amount' && rate > 0) {
      const currentAmount = watch('amount');
      if (!currentAmount || `${currentAmount}`.trim() === "" || currentAmount === "0.00") {
        setValue('amount', String(rate), { shouldDirty: false, shouldTouch: false });
        setHasEditedAmount(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputType, rate]);

  const onSubmit = async (values: TFormData) => {
    if (!accessToken) return;
    try {
      loadingDialog.show();
      const vanNo = values.vanName; // valueField is vanid
      const litresNum = parseFloat(values.litres || "0");
      const amountNum = parseFloat(values.amount || "0");
      const payload = {
        vanNo,
        pumpName: values.pumpName || "Sonu Petroleum Service",
        litres: litresNum,
        amount: amountNum,
        dateTime: (values.intakeTime || new Date()).toISOString(),
      };
      const res = await IntakeService.addIntake(accessToken, payload);
      console.log("addIntakeres", res);
      showToast('success', 'Intake saved successfully');
    } catch (e) {
      HandleApiError(e);
    } finally {
      loadingDialog.hide();
    }
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
              render={() => (
                <CustomTextInput
                  label="Worker Name"
                  value={workerName}
                  editable={false}
                  bordered
                />
              )}
            />

            <Controller
              control={control}
              name="pumpName"
              render={() => (
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
                onPress={() => {
                  setInputType('litres');
                  // Recalculate litres from amount ONLY if user actually edited amount
                  if (hasEditedAmount) {
                    const amtNow = watch('amount') || '0';
                    setVal('litres', calculateFromAmount(amtNow));
                  }
                }}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'litres' ? '#fff' : colors.text }]}>Enter Litres</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, inputType === 'amount' && { backgroundColor: colors.primary }]}
                onPress={() => {
                  setInputType('amount');
                  // Recalculate amount from litres ONLY if user actually edited litres
                  if (hasEditedLitres) {
                    const litNow = watch('litres') || '0';
                    setVal('amount', calculateFromLitres(litNow));
                  } else if (rate > 0) {
                    const currentAmount = watch('amount');
                    if (!currentAmount || `${currentAmount}`.trim() === "" || currentAmount === "0.00") {
                      setValue('amount', String(rate), { shouldDirty: false, shouldTouch: false });
                      setHasEditedAmount(false);
                    }
                  }
                }}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'amount' ? '#fff' : colors.text }]}>Enter Amount (₹)</ThemedText>
              </TouchableOpacity>
            </View>

            {inputType === 'litres' ? (
              <Controller
                control={control}
                name="litres"
                render={({ field: { value } }) => (
                  <CustomTextInput
                    label="Litres Received *"
                    value={value}
                    placeholder="Enter litres received"
                    keyboardType="decimal-pad"
                    bordered
                    onFocus={() => setEditing('litres')}
                    onBlur={() => setEditing(null)}
                    onChangeText={(text) => {
                      setHasEditedLitres(true);
                      setVal('litres', text);
                      // only compute amount when the user is editing litres
                      if (editing !== 'amount') {
                        setVal('amount', calculateFromLitres(text));
                      }
                    }}
                  />
                )}
              />
            ) : (
              // Amount input
              <Controller
                control={control}
                name="amount"
                render={({ field: { value } }) => (
                  <CustomTextInput
                    label="Amount (₹)"
                    value={value}
                    placeholder={`Enter amount in ₹ (Rate: ₹${rate})`}
                    keyboardType="decimal-pad"
                    bordered
                    onFocus={() => setEditing('amount')}
                    onBlur={() => setEditing(null)}
                    onChangeText={(text) => {
                      setHasEditedAmount(true);
                      setVal('amount', text);
                      // only compute litres when the user is editing amount
                      if (editing !== 'litres') {
                        setVal('litres', calculateFromAmount(text));
                      }
                    }}
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
