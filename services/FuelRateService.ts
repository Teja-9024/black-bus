import { _get, _post } from "@/configs/api-methods.config";

export interface DieselRateRecord {
  rate: number;
  updatedAt?: string;
  createdAt?: string;
}

class FuelRateService {
  static async getDieselRate(token: string): Promise<number> {
    const res = await _get<any>("fuel-rates/get-diesel-rate", token);

    if (typeof res === "number") return res;
    if (res && typeof res === "object") {
      if (typeof res.rate === "number") return res.rate;
      if (Array.isArray(res)) {
        const arr = res as DieselRateRecord[];
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => {
          const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return tb - ta;
        });
        return sorted[0]?.rate ?? 0;
      }
      if (Array.isArray(res.data)) {
        const arr = res.data as DieselRateRecord[];
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => {
          const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return tb - ta;
        });
        return sorted[0]?.rate ?? 0;
      }
    }
    return 0;
  }

  static async setDieselRate(token: string, rate: number): Promise<number> {
    const res = await _post<any>("fuel-rates/set-diesel-rate", { rate }, token);
    if (typeof res === "number") return res;
    if (res && typeof res === "object") { 
      if (typeof res.rate === "number") return res.rate;
      if (res.data && typeof res.data.rate === "number") return res.data.rate;
    }
    return rate;
  }
}

export default FuelRateService;


