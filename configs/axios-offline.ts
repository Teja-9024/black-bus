import { OutboxRepo } from '@/db/repositories';
import NetInfo from '@react-native-community/netinfo';
import httpClient from './axios.config';

// Wraps http methods. If offline, enqueue to outbox. If online, try request and on network error, enqueue.

export const offlinePost = async <T>(url: string, data?: any, headers?: any): Promise<T> => {
	const state = await NetInfo.fetch();
	const isOnline = Boolean(state.isConnected && state.isInternetReachable);
	if (!isOnline) {
		await OutboxRepo.enqueue('POST', url, data, headers);
		// Return a local echo of the data so UI can proceed
		return (data ?? {}) as T;
	}
	try {
		const res = await httpClient.post<T>(url, data, { headers });
		return res.data;
	} catch (e: any) {
		// network error codes
		if (!e.response) {
			await OutboxRepo.enqueue('POST', url, data, headers);
			return (data ?? {}) as T;
		}
		throw e;
	}
};

export const offlineGet = async <T>(url: string, headers?: any, params?: any): Promise<T> => {
	const state = await NetInfo.fetch();
	const isOnline = Boolean(state.isConnected && state.isInternetReachable);
	if (!isOnline) {
		throw new Error('offline');
	}
	const res = await httpClient.get<T>(url, { headers, params });
	return res.data;
};


