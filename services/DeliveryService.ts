import { _get, _post } from "@/configs/api-methods.config";

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
    const res = await _get<any>("deliveries/get-delivery", token);
    if (Array.isArray(res)) return res as DeliveryItem[];
    if (Array.isArray(res?.data)) return res.data as DeliveryItem[];
    return [];
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
    return _post<any>("deliveries/create-delivery", payload, token);
  }
}

export default DeliveryService;


