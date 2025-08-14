import { _get } from "@/configs/api-methods.config";
import { offlinePost } from "@/configs/axios-offline";
import { IntakesRepo } from "@/db/repositories";
import NetInfo from '@react-native-community/netinfo';

export interface IntakeItem {
  _id: string;
  van: { _id: string; vanNo: string; name: string };
  vanNo: string;
  worker: { _id: string; email: string; name: string };
  workerName: string;
  pumpName: string;
  litres: number;
  amount: number;
  dateTime: string;
  timestamp: string;
  __v: number;
}

class IntakeService {
  static async getIntakes(token: string): Promise<IntakeItem[]> {
    try {
      const res = await _get<any>("intakes/get-intake", token);
      if (Array.isArray(res)) return res as IntakeItem[];
      if (Array.isArray(res?.data)) return res.data as IntakeItem[];
      return [];
    } catch (e) {
      const local = await IntakesRepo.all();
      const mapped: IntakeItem[] = local.map((r) => ({
        _id: String(r.server_id ?? r.local_id),
        van: { _id: r.vanNo, vanNo: r.vanNo, name: r.vanNo },
        vanNo: r.vanNo,
        worker: { _id: '', email: '', name: r.workerName || '' },
        workerName: r.workerName || '',
        pumpName: r.pumpName,
        litres: r.litres,
        amount: r.amount,
        dateTime: r.dateTime,
        timestamp: r.updatedAt || r.createdAt || r.dateTime,
        __v: 0,
      }));
      return mapped;
    }
  }

  static async addIntake(
    token: string,
    payload: {
      vanNo: string;
      pumpName: string;
      litres: number;
      amount: number;
      dateTime: string;
    }
  ): Promise<any> {
    const headers: any = {};
    headers.Authorization = token ? `Bearer ${token}` : '';

    const state = await NetInfo.fetch();
    const isOnline = Boolean(state.isConnected && state.isInternetReachable);
    console.log("isOnlinein",isOnline)
    if (!isOnline) {
      await IntakesRepo.insertLocalPending({
        vanNo: payload.vanNo,
        pumpName: payload.pumpName,
        litres: payload.litres,
        amount: payload.amount,
        dateTime: payload.dateTime,
      });
      await (await import('@/db/repositories')).OutboxRepo.enqueue('POST', 'intakes/add-intake', payload, headers);
      return { offline: true };
    }

    const res = await offlinePost<any>("intakes/add-intake", payload, headers);
    try {
      if (res && (res._id || res.data?._id)) {
        const serverId = res._id || res.data._id;
        await IntakesRepo.insertLocalPending({
          server_id: serverId,
          vanNo: payload.vanNo,
          pumpName: payload.pumpName,
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

export default IntakeService;


