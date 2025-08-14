import { _get } from "@/configs/api-methods.config";
import { offlinePost } from "@/configs/axios-offline";
import { DeliveriesRepo } from "@/db/repositories";
import NetInfo from '@react-native-community/netinfo';

export interface DeliveryItem {
  _id: string;
  van: { _id: string; vanNo: string; name: string };
  vanNo: string;
  worker: { _id: string; email: string; name: string };
  workerName: string;
  supplier: string;
  customer: string;
  litres: number;
  amount: number;
  dateTime: string;
  timestamp: string;
  __v: number;
}

class DeliveryService {
  static async getDeliveries(token: string): Promise<DeliveryItem[]> {
    try {
      const res = await _get<any>("deliveries/get-delivery", token);
      if (Array.isArray(res)) return res as DeliveryItem[];
      if (Array.isArray(res?.data)) return res.data as DeliveryItem[];
      return [];
    } catch (e) {
      // Fallback to local cached deliveries when offline
      const local = await DeliveriesRepo.all();
      // Map local rows to API-like shape minimally for list display if needed
      const mapped: DeliveryItem[] = local.map((r) => ({
        _id: String(r.server_id ?? r.local_id),
        van: { _id: r.vanNo, vanNo: r.vanNo, name: r.vanNo },
        vanNo: r.vanNo,
        worker: { _id: '', email: '', name: r.workerName || '' },
        workerName: r.workerName || '',
        supplier: r.supplier,
        customer: r.customer,
        litres: r.litres,
        amount: r.amount,
        dateTime: r.dateTime,
        timestamp: r.updatedAt || r.createdAt || r.dateTime,
        __v: 0,
      }));
      return mapped;
    }
  }

  static async createDelivery(
    token: string,
    payload: {
      vanNo: string;
      supplier: string;
      customer: string;
      litres: number;
      amount: number;
      dateTime: string;
    }
  ): Promise<any> {
    const headers: any = {};
    headers.Authorization = token ? `Bearer ${token}` : '';

    // Try network; if offline, enqueue and insert local pending row for UI/history
    const state = await NetInfo.fetch();
    const isOnline = Boolean(state.isConnected && state.isInternetReachable);

    if (!isOnline) {
      await DeliveriesRepo.insertLocalPending({
        vanNo: payload.vanNo,
        supplier: payload.supplier,
        customer: payload.customer,
        litres: payload.litres,
        amount: payload.amount,
        dateTime: payload.dateTime,
      });
      // enqueue for background sync
      await (await import('@/db/repositories')).OutboxRepo.enqueue('POST', 'deliveries/create-delivery', payload, headers);
      return { offline: true };
    }

    const res = await offlinePost<any>("deliveries/create-delivery", payload, headers);
    // If request succeeded online, store a synced copy locally for offline lists
    try {
      if (res && (res._id || res.data?._id)) {
        const serverId = res._id || res.data._id;
        await DeliveriesRepo.insertLocalPending({
          server_id: serverId,
          vanNo: payload.vanNo,
          supplier: payload.supplier,
          customer: payload.customer,
          litres: payload.litres,
          amount: payload.amount,
          dateTime: payload.dateTime,
          sync_status: 'synced',
        } as any);
      }
    } catch {}
    return res;
  }
}

export default DeliveryService;


