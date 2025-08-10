import { ensureAndroidChannel, registerForPushNotificationsAsync } from "@/lib/notifications";
import NotificationService from "@/services/NotificationService";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type Ctx = {
  unread: number;
  setUnread: (n: number) => void;
  bumpUnread: () => void;
  refreshUnreadFromList: () => Promise<void>;
};

const NotificationCtx = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);

  const bumpUnread = () => setUnread((n) => n + 1);

  const refreshUnreadFromList = async () => {
    // simple: first page fetch karke unread count nikaal lo
    const res = await NotificationService.list(undefined, 50);
    const cnt = res.data.filter((n: any) => !n.isRead).length;
    setUnread(cnt);
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") await ensureAndroidChannel();

      // 1) push token leke backend ko do
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try { await NotificationService.registerToken(token); } catch (e) { /* ignore */ }
      }

      // 2) app start pe unread refresh
      await refreshUnreadFromList();

      // 3) foreground me jab notification aaye to locally badge badha do
      const sub1 = Notifications.addNotificationReceivedListener(() => {
        bumpUnread();
      });

      // 4) jab user notification ko tap kare (background/killed), navigate
      const sub2 = Notifications.addNotificationResponseReceivedListener((resp) => {
        const data = resp.notification.request.content.data as any;
        // simple: notifications page khol do; data.type/vanNo ke hisaab se navigate kar sakte ho
        router.push("/notifications");
      });

      // 5) killed state se open hua ho to last response handle
      (async () => {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last) {
          router.push("/notifications");
        }
      })();

      return () => {
        sub1.remove();
        sub2.remove();
      };
    })();
  }, []);

  const value = useMemo(() => ({ unread, setUnread, bumpUnread, refreshUnreadFromList }), [unread]);
  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}

export const useNotificationsCtx = () => {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error("useNotificationsCtx must be used within NotificationProvider");
  return ctx;
}; 