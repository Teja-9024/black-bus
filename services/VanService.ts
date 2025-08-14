// services/VanService.ts
import { VansRepo } from "@/db/repositories";
import { _get } from "../configs/api-methods.config";

export interface Van {
  _id: string;
  vanNo: string;
  name: string;
  capacity: number;
  currentDiesel: number;
  morningStock: number;
  totalFilled: number;
  totalDelivered: number;
  assignedWorker: string;
  workerName:string;
  __v: number;
}

class VanService {
  /**
   * Fetches all vans from the backend.
   */
  static async getVans(token: string): Promise<Van[]> {
    try {
      const response = await _get<Van[]>("vans/vans", token);
      // cache locally for offline
      try { await VansRepo.upsertMany(response as any); } catch {}
      return response;
    } catch (error) {
      // offline: return cached
      try {
        const local = await VansRepo.all();
        return (local || []) as Van[];
      } catch (e) {
        console.error("Error while fetching vans: ", error);
        throw error;
      }
    }
  }
}

export default VanService;