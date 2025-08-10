import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  const perms = await Notifications.getPermissionsAsync();
  let status = perms.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  const projectId =
    (Constants?.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn("Missing EAS projectId");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data; // "ExponentPushToken[xxxx]"
}
