// services/VanService.ts
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
  __v: number;
}

class VanService {
  /**
   * Fetches all vans from the backend.
   */
  static async getVans(token: string): Promise<Van[]> {
    try {
      const response = await _get<Van[]>("vans/vans", token);
      return response;
    } catch (error) {
      console.error("Error while fetching vans: ", error);
      throw error;
    }
  }
}

export default VanService;