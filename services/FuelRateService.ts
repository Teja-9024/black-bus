import { _get, _post } from "@/configs/api-methods.config";
import { FuelRateRepo } from "@/db/repositories";
import NetInfo from '@react-native-community/netinfo';

export interface DieselRateRecord {
  rate: number;
  updatedAt?: string;
  createdAt?: string;
}

class FuelRateService {
  static async getDieselRate(token: string): Promise<number> {
    try {
      const res = await _get<any>("fuel-rates/get-diesel-rate", token);

      let rate = 0;
      if (typeof res === "number") rate = res;
      else if (res && typeof res === "object") {
        if (typeof (res as any).rate === "number") rate = (res as any).rate;
        else if (Array.isArray(res)) {
          const arr = res as DieselRateRecord[];
          if (arr.length > 0) {
            const sorted = [...arr].sort((a, b) => {
              const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return tb - ta;
            });
            rate = sorted[0]?.rate ?? 0;
          }
        } else if (Array.isArray((res as any).data)) {
          const arr = (res as any).data as DieselRateRecord[];
          if (arr.length > 0) {
            const sorted = [...arr].sort((a, b) => {
              const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
              const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
              return tb - ta;
            });
            rate = sorted[0]?.rate ?? 0;
          }
        }
      }

      // cache locally
      try {
        await FuelRateRepo.set(rate, new Date().toISOString());
      } catch {}
      return rate;
    } catch {
      // offline: return cached rate
      return await FuelRateRepo.get();
    }
  }

  static async setDieselRate(token: string, rate: number): Promise<number> {
    const state = await NetInfo.fetch();
    const isOnline = Boolean(state.isConnected && state.isInternetReachable);
    if (!isOnline) {
      await FuelRateRepo.set(rate, new Date().toISOString());
      return rate;
    }
    const res = await _post<any>("fuel-rates/set-diesel-rate", { rate }, token);
    let next = rate;
    if (typeof res === "number") next = res;
    else if (res && typeof res === "object") {
      if (typeof (res as any).rate === "number") next = (res as any).rate;
      else if ((res as any).data && typeof (res as any).data.rate === "number") next = (res as any).data.rate;
    }
    try { await FuelRateRepo.set(next, new Date().toISOString()); } catch {}
    return next;
  }
}

export default FuelRateService;


