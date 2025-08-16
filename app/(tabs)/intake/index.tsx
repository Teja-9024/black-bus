import CommonHeader from "@/components/CommonHeader";
import ThemedSafeArea from "@/components/ThemedSafeArea";
import { useTheme } from "@/context/ThemeContext";
import { SimpleLineIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import ApiResponsePopup from "@/components/ApiResponsePopup";
import Button from "@/components/Button";
import CustomTextInput from "@/components/CustomTextInput";
import DateTimePickerComponent from "@/components/DateTimePickerComponent";
import CustomDropdown from "@/components/Dropdown";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HandleApiError } from "@/constants/Functions";
import { useAuth } from "@/context/AuthContext";
import { useLoadingDialog } from "@/context/LoadingContext";
import { useNotificationsCtx } from "@/context/NotificationContext";
import FuelRateService from "@/services/FuelRateService";
import IntakeService from "@/services/IntakeService";
import VanService, { Van } from "@/services/VanService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

// 🔸 Define form type
type TFormData = {
  vanName: string;
  workerName: string;
  pumpName: string;
  sourceType: string;
  sourceName: string;
  litres: string;
  amount: string;
  intakeTime: Date;
};

type VanOption = { vanName: string; vanid: string };

const SOURCE_TYPE_OPTIONS = [
  { label: 'Pump', value: 'pump' },
  { label: 'Factory', value: 'factory' },
  { label: 'Tanker', value: 'tanker' },
  { label: 'Vendor', value: 'vendor' },
  { label: 'Individual', value: 'individual' },
  { label: 'Other', value: 'other' },
];

export default function IntakeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const { unread } = useNotificationsCtx();
  const loadingDialog = useLoadingDialog();

  // API Response popup state
  const [apiResponse, setApiResponse] = useState<{
    success: boolean;
    message?: string;
    data?: any;
    status?: number;
  } | null>(null);
  const [showApiPopup, setShowApiPopup] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,          // for Save-only reset
    getValues,      // to preserve van/worker/pump on reset
    formState: { errors },
  } = useForm<TFormData>({
    defaultValues: {
      vanName: "",
      workerName: "",
      pumpName: "Sonu Petroleum Service",
      sourceType: "",
      sourceName: "",
      litres: "",
      amount: "",
      intakeTime: new Date(),
    },
  });

  const [inputType, setInputType] = useState<'litres' | 'amount'>('litres');
  const [rate, setRate] = useState<number>(0);
  const [vanOptions, setVanOptions] = useState<VanOption[]>([]);
  const [workerName, setWorkerName] = useState<string>("");
  const [isWorker, setIsWorker] = useState<boolean>(false);
  const [workerId, setWorkerId] = useState<string>("");
  const [vanMetaById, setVanMetaById] = useState<Record<string, { workerName?: string }>>({});

  // Separate state for litres and rate to prevent mixing
  const [litresValue, setLitresValue] = useState<string>("");
  const [rateValue, setRateValue] = useState<string>("");

  // guards to avoid ping-pong + unwanted conversions
  const [editing, setEditing] = useState<'litres' | 'amount' | null>(null);
  const [hasEditedLitres, setHasEditedLitres] = useState(false);
  const [hasEditedAmount, setHasEditedAmount] = useState(false);

  // 🔒 Global loading semaphore + in-flight guards
  const loadingCountRef = useRef(0);
  const inFlight = useRef({ fetch: false, save: false });

  const showBlocking = () => {
    if (loadingCountRef.current === 0) loadingDialog.show();
    loadingCountRef.current += 1;
  };
  const hideBlocking = () => {
    loadingCountRef.current = Math.max(loadingCountRef.current - 1, 0);
    if (loadingCountRef.current === 0) loadingDialog.hide();
  };

  const setVal = (name: keyof TFormData, value: string) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: false });

  // Use separate state values instead of form values for display
  const litres = litresValue || "";
  const amount = rateValue || "";

  // Calculate total amount based on litres × rate
  const calculateTotalAmount = (litresVal: string, rateVal: number) => {
    const parsed = parseFloat(litresVal) || 0;
    return rateVal > 0 ? (parsed * rateVal).toFixed(2) : "0.00";
  };

  // Calculate litres based on total amount ÷ rate
  const calculateLitresFromAmount = (amountVal: string, rateVal: number) => {
    const parsed = parseFloat(amountVal) || 0;
    return rateVal > 0 ? (parsed / rateVal).toFixed(2) : "0.00";
  };

  // 🔁 Fetch latest data on screen focus; do NOT reset the form here.
  // Uses blocking dialog with semaphore + in-flight guard to avoid stuck loader.
  const fetchLatest = useCallback(async () => {
    if (!accessToken) return;             // ✅ never show dialog if no token
    if (inFlight.current.fetch) return;   // prevent duplicate focus calls
    inFlight.current.fetch = true;

    showBlocking();
    try {
      // identity: AsyncStorage first, then useAuth
      let role = user?.role;
      let name = user?.name || "";
      let uid = user?._id || "";
      const stored = await AsyncStorage.getItem("userData");
      if (stored) {
        const parsed = JSON.parse(stored);
        role = parsed?.role ?? role;
        name = parsed?.name ?? name;
        uid = parsed?.id ?? uid;
      }

      setIsWorker(role === "worker");
      setWorkerId(uid || "");

      // worker: keep own name; owner: start blank (will sync from selected van)
      if (role === "worker") {
        setWorkerName(name || "");
      } else {
        setWorkerName("");
      }

      const [r, vans] = await Promise.all([
        FuelRateService.getDieselRate(accessToken),
        VanService.getVans(accessToken),
      ]);
      setRate(r || 0);

      let availableVans: Van[] = vans || [];
      if (role === "worker" && uid) {
        availableVans = availableVans.filter((v: any) => (v.assignedWorker || "") === uid);
        // Fallback if API doesn't include assignedWorker
        if (availableVans.length === 0 && stored) {
          try {
            const parsed = JSON.parse(stored);
            const vanId = parsed?.vanId as string | undefined;
            if (vanId) availableVans = (vans || []).filter((v: any) => v._id === vanId);
          } catch {}
        }
      }

      const opts: VanOption[] = (availableVans || []).map((v: any) => ({
        vanName: `${v.vanNo} - ${v.name}`,
        vanid: v.vanNo,
      }));
      setVanOptions(opts);

      // ✅ Build vanNo -> workerName map for Owner auto-fill
      const meta: Record<string, { workerName?: string }> = {};
      (availableVans || []).forEach((v: any) => {
        const workerNameFromApi =
          v.assignedWorkerName ||
          v.workerName ||
          v.assignedWorker?.name ||
          "";
        meta[v.vanNo] = { workerName: workerNameFromApi };
      });
      setVanMetaById(meta);

      // Preserve user selection:
      const currentVan = getValues("vanName");
      if (
        role === "worker" &&
        (!currentVan || currentVan.trim() === "") &&
        opts.length > 0
      ) {
        // worker: auto-select first available
        setValue("vanName", opts[0].vanid as any, {
          shouldDirty: false,
          shouldTouch: false,
        });
      } else if (role !== "worker") {
        // owner: ensure empty (no auto-selection)
        setValue("vanName", "", { shouldDirty: false, shouldTouch: false });
      }

      // Prefill workerName only for worker role
      const currentWorker = getValues("workerName");
      if (role === "worker" && !currentWorker) {
        setValue("workerName", name || "", { shouldDirty: false, shouldTouch: false });
      }
      if (role !== "worker") {
        setValue("workerName", "", { shouldDirty: false, shouldTouch: false });
      }
    } catch (e) {
      HandleApiError(e);
    } finally {
      inFlight.current.fetch = false;
      hideBlocking();                     // ✅ always paired with showBlocking
    }
  }, [accessToken, user?.role, user?.name, user?._id, getValues, setValue]);

  useFocusEffect(
    useCallback(() => {
      fetchLatest(); // only fetch latest data; don't reset fields
    }, [fetchLatest])
  );

  // ---- Owner: sync worker name when van changes ----
  const vanNameSelected = watch("vanName");
  useEffect(() => {
    if (!isWorker) {
      const nameFromVan = (vanMetaById[vanNameSelected]?.workerName) || "";
      setWorkerName(nameFromVan);
      setValue("workerName", nameFromVan, { shouldDirty: false, shouldTouch: false });
    }
  }, [vanNameSelected, isWorker, vanMetaById, setValue]);

  // Auto-prefill amount with current rate when switching to Amount tab
  useEffect(() => {
    if (inputType === 'amount' && rate > 0) {
      if (!rateValue || rateValue.trim() === "" || rateValue === "0.00") {
        setRateValue(String(rate));
        setValue('amount', String(rate), { shouldDirty: false, shouldTouch: false });
        setHasEditedAmount(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputType, rate]);

  const onSubmit = useCallback(async (values: TFormData) => {
    if (!accessToken) return;
    if (inFlight.current.save) return;   // avoid double-tap submits
    inFlight.current.save = true;

    showBlocking();
    try {
      const payload = {
        vanNo: values.vanName,
        pumpName: values.pumpName || "Sonu Petroleum Service",
        sourceType: values.sourceType,
        sourceName: values.sourceName,
        litres: parseFloat(values.litres || "0"),
        amount: parseFloat(values.amount || "0"),
        dateTime: (values.intakeTime || new Date()).toISOString(),
      };
      console.log("call")
      console.log("acessToken",accessToken)
      console.log("payload",payload)
    
      const response = await IntakeService.addIntake(accessToken, payload);
      console.log("intakeresponse",response)
      // Handle API response
      if (response && response.offline) {
        // Offline mode
        setApiResponse({
          success: true,
          message: "Intake saved offline. Will sync when connection is restored.",
          status: 200
        });
      } else if (response && (response._id || response.data?._id)) {
        // Success response
        setApiResponse({
          success: true,
          message: "Diesel intake added successfully!",
          data: response,
          status: 200
        });
      } else {
        // Generic success
        setApiResponse({
          success: true,
          message: "Diesel intake added successfully!",
          status: 200
        });
      }
      
      setShowApiPopup(true);

      // ✅ Reset only user-input fields after save; keep selection/details
      const { vanName, workerName, pumpName } = getValues();
      reset({
        vanName,                     // keep
        workerName,                  // keep (will re-sync for owner below)
        pumpName: pumpName || "Sonu Petroleum Service",
        sourceType: "",              // clear
        sourceName: "",              // clear
        litres: "",                  // clear
        amount: "",                  // clear
        intakeTime: new Date(),      // reset to now
      });

      // Reset separate state values
      setLitresValue("");
      setRateValue("");

      // Owner: re-sync worker name from currently selected van
      if (!isWorker) {
        const vNow = getValues("vanName");
        const nameFromVan = (vanMetaById[vNow]?.workerName) || "";
        setWorkerName(nameFromVan);
        setValue("workerName", nameFromVan, { shouldDirty: false, shouldTouch: false });
      }

      // reset guards and toggle
      setEditing(null);
      setHasEditedLitres(false);
      setHasEditedAmount(false);
      setInputType('litres');
    } catch (e: any) {
      // Handle error response
      const errorMessage = e?.response?.data?.message || e?.message || "Failed to add diesel intake. Please try again.";
      setApiResponse({
        success: false,
        message: errorMessage,
        status: e?.response?.status || 500
      });
      setShowApiPopup(true);
    } finally {
      inFlight.current.save = false;
      hideBlocking();                 // ✅ paired with showBlocking
    }
  }, [accessToken, reset, getValues, isWorker, setValue, vanMetaById]);

  const handleCloseApiPopup = () => {
    setShowApiPopup(false);
    setApiResponse(null);
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
            isWorker ? null : (
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
            )
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
                  disabled={isWorker}
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
              render={({ field: { value } }) => (
                <CustomTextInput
                  label="Pump Name"
                  value={value}
                  editable={false}
                  bordered
                />
              )}
            />

            <Controller
              control={control}
              name="sourceType"
              rules={{ required: "Source type is required" }}
              render={({ field: { onChange, value } }) => (
                <CustomDropdown
                  label="Source Type *"
                  data={SOURCE_TYPE_OPTIONS}
                  value={value}
                  onChange={onChange}
                  errorMsg={errors.sourceType?.message}
                  placeholder={"Select source type..."}
                  labelField={"label"}
                  valueField={"value"}
                />
              )}
            />

            <Controller
              control={control}
              name="sourceName"
              rules={{ required: "Source name is required" }}
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Source Name *"
                  value={value}
                  placeholder="Enter source name"
                  onChangeText={onChange}
                  errorMsg={errors.sourceName?.message}
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
                }}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'litres' ? '#fff' : colors.text }]}>Enter Litres</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, inputType === 'amount' && { backgroundColor: colors.primary }]}
                onPress={() => {
                  setInputType('amount');
                  // When switching to amount, show default rate if rate is empty
                  if (!rateValue || rateValue.trim() === "" || rateValue === "0.00") {
                    setRateValue(String(rate));
                    setValue('amount', String(rate), { shouldDirty: false, shouldTouch: false });
                    setHasEditedAmount(false);
                  }
                }}
              >
                <ThemedText style={[styles.toggleText, { color: inputType === 'amount' ? '#fff' : colors.text }]}>Enter Rate (₹/L)</ThemedText>
              </TouchableOpacity>
            </View>

            {inputType === 'litres' ? (
              <Controller
                control={control}
                name="litres"
                render={({ field: { value } }) => (
                  <CustomTextInput
                    label="Litres Received *"
                    value={litresValue}
                    placeholder="Enter litres received"
                    keyboardType="decimal-pad"
                    bordered
                    onFocus={() => setEditing('litres')}
                    onBlur={() => setEditing(null)}
                    onChangeText={(text) => {
                      setHasEditedLitres(true);
                      setLitresValue(text);
                      setVal('litres', text);
                    }}
                  />
                )}
              />
            ) : (
              // Rate input (amount field is used for rate per liter)
              <Controller
                control={control}
                name="amount"
                render={({ field: { value } }) => (
                  <CustomTextInput
                    label="Rate per Liter (₹/L)"
                    value={rateValue}
                    placeholder={rate > 0 ? `Default Rate: ₹${rate}/L` : "Enter rate per liter"}
                    keyboardType="decimal-pad"
                    bordered
                    onFocus={() => setEditing('amount')}
                    onBlur={() => setEditing(null)}
                    onChangeText={(text) => {
                      setHasEditedAmount(true);
                      setRateValue(text);
                      setVal('amount', text);
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
                  {litresValue || "0.00"}L
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ color: colors.text, fontSize: 12 }}>Rate</ThemedText>
                <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  ₹{rateValue || rate}/L
                </ThemedText>
              </ThemedView>

              <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText style={{ color: colors.text, fontSize: 12 }}>Total Amount</ThemedText>
                <ThemedText style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>
                  ₹{calculateTotalAmount(litresValue, parseFloat(rateValue) || rate)}
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
              <Button title="Save" onPress={handleSubmit(onSubmit)} style={styles.saveButton} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" onPress={() => {
                const { vanName, workerName, pumpName } = getValues();
                reset({
                  vanName,
                  workerName,
                  pumpName: pumpName || "Sonu Petroleum Service",
                  sourceType: "",
                  sourceName: "",
                  litres: "",
                  amount: "",
                  intakeTime: new Date(),
                });
                // Reset separate state values
                setLitresValue("");
                setRateValue("");
                // Owner: re-sync worker name from current van after cancel
                if (!isWorker) {
                  const vNow = getValues("vanName");
                  const nameFromVan = (vanMetaById[vNow]?.workerName) || "";
                  setWorkerName(nameFromVan);
                  setValue("workerName", nameFromVan, { shouldDirty: false, shouldTouch: false });
                }
                setEditing(null);
                setHasEditedLitres(false);
                setHasEditedAmount(false);
                setInputType('litres');
              }} />
            </View>
          </ThemedView>
        </ScrollView>

        {/* API Response Popup */}
        <ApiResponsePopup
          visible={showApiPopup}
          onClose={handleCloseApiPopup}
          response={apiResponse}
        />
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
  saveButton: {
    backgroundColor: "#FFC107",
  }
});
