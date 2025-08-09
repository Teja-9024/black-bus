import { _get } from "@/configs/api-methods.config";

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
    const res = await _get<any>("intakes/get-intake", token);
    if (Array.isArray(res)) return res as IntakeItem[];
    if (Array.isArray(res?.data)) return res.data as IntakeItem[];
    return [];
  }
}

export default IntakeService;


