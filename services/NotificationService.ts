import { API_BASE_URL } from '@/constants/const';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { _post } from "../configs/api-methods.config";

export interface NotificationResponse {
  id: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  content?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  relatedContentPreview?: string;
  metadata?: {
    status?: 'pending' | 'accepted' | 'declined';
    [key: string]: any;
  };
  knockStatus?: 'pending' | 'lockedIn' | 'onesidedlock' | 'declined' | null;
  relatedEntityDetails?: {
    id: string;
    username: string;
    avatar: string | null;
  } | null;
}

export interface GetNotificationsResponse {
  notifications: NotificationResponse[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

export interface MarkNotificationReadResponse {
  message: string;
  notificationId: string;
}

export interface UnreadNotificationCountResponse {
    count: number;
}

// New interface for the API response
export interface NotificationListResponse {
  data: any[];
  nextCursor: string | null;
}

class NotificationService {
  private static API_URL = API_BASE_URL;

  static async sendTokenToBackend(token: string, accessToken: string) {
    return await _post(`notifications/register-token`, { token }, accessToken);
  }

  // New methods for the notification functionality
  static async list(cursor?: string, limit = 20): Promise<NotificationListResponse> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        console.warn('No access token available, returning demo data');
        return this.getDemoData(cursor, limit);
      }

      const url = new URL(`${this.API_URL}/notifications`);
      if (cursor) url.searchParams.set("cursor", cursor);
      url.searchParams.set("limit", String(limit));
      
      const res = await fetch(url.toString(), {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      return res.json() as Promise<NotificationListResponse>;
    } catch (error) {
      console.error('NotificationService.list error:', error);
      // Return demo data on error for testing
      return this.getDemoData(cursor, limit);
    }
  }

  static async markRead(id: string) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        console.warn('No access token available, simulating markRead in demo mode');
        return { success: true, message: 'Demo mode: Notification marked as read' };
      }

      const res = await fetch(`${this.API_URL}/notifications/${id}/read`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      return res.json();
    } catch (error) {
      console.error('NotificationService.markRead error:', error);
      throw error;
    }
  }

  static async markAllRead() {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        console.warn('No access token available, simulating markAllRead in demo mode');
        return { success: true, message: 'Demo mode: All notifications marked as read' };
      }

      const res = await fetch(`${this.API_URL}/notifications/read-all`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      return res.json();
    } catch (error) {
      console.error('NotificationService.markAllRead error:', error);
      throw error;
    }
  }

  static async registerToken(token: string) {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const res = await fetch(`${this.API_URL}/notifications/register-token`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      
      return res.json();
    } catch (error) {
      console.error('NotificationService.registerToken error:', error);
      throw error;
    }
  }

  private static async getAccessToken(): Promise<string | null> {
    try {
      // First try to get token from AsyncStorage (your existing auth system)
      const token = await AsyncStorage.getItem('userToken');
      
      if (token && token !== 'mock-access-token') {
        return token;
      }
      
      // If no token in AsyncStorage, return null
      console.warn('No valid access token found in AsyncStorage');
      return null;
      
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private static getDemoData(cursor?: string, limit = 20): NotificationListResponse {
    const demoNotifications = [
      {
        _id: '1',
        title: 'Delivery Completed',
        body: 'Van 1 (Ravi) delivered 300L diesel (₹27,750) to L&T Construction at 10:30 AM',
        data: { vanNo: 'Van 1' },
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        _id: '2',
        title: 'New Order Received',
        body: 'Order #ORD-2024-001 for 500L petrol has been placed by ABC Company',
        data: { vanNo: 'Van 2' },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        _id: '3',
        title: 'Payment Confirmed',
        body: 'Payment of ₹45,000 for order #ORD-2024-001 has been received',
        data: {},
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
      {
        _id: '4',
        title: 'Van Maintenance Due',
        body: 'Van 3 requires scheduled maintenance. Please schedule service appointment.',
        data: { vanNo: 'Van 3' },
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
      {
        _id: '5',
        title: 'Fuel Stock Alert',
        body: 'Diesel stock is running low. Current level: 2000L. Please reorder.',
        data: {},
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      }
    ];

    // Simulate pagination
    if (cursor) {
      // For demo purposes, just return empty data on "next page"
      return {
        data: [],
        nextCursor: null
      };
    }

    return {
      data: demoNotifications.slice(0, limit),
      nextCursor: demoNotifications.length > limit ? 'demo-cursor' : null
    };
  }

  // static async getUserNotifications(token: string, page: number = 1, limit: number = 15): Promise<GetNotificationsResponse> {
  //   return await _get(`notifications?page=${page}&limit=${limit}`, token);
  // }

  // static async getUnreadNotificationCount(token: string): Promise<UnreadNotificationCountResponse> { // New method
  //   return await _get(`notifications/unread-count`, token);
  // }

  // static async markNotificationAsRead(notificationId: string, token: string): Promise<MarkNotificationReadResponse> {
  //   return await _put(`notifications/${notificationId}/read`, {}, token);
  // }

  // static async markAllNotificationsAsRead(token: string): Promise<{ message: string }> {
  //   return await _put(`notifications/read-all`, {}, token);
  // }
}

export default NotificationService;