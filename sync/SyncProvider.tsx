import httpClient from '@/configs/axios.config';
import { useAuth } from '@/context/AuthContext';
import { OutboxRepo } from '@/db/repositories';
import { runMigrations } from '@/db/sqlite';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

type SyncContextType = {
	isOnline: boolean;
	triggerSync: () => Promise<void>;
};

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const useSync = () => {
	const ctx = useContext(SyncContext);
	if (!ctx) throw new Error('useSync must be used within SyncProvider');
	return ctx;
};

export const SyncProvider = ({ children }: { children: ReactNode }) => {
	const [isOnline, setIsOnline] = useState(true);
	const syncingRef = useRef(false);
	const { accessToken } = useAuth();

	useEffect(() => {
		(async () => {
			await runMigrations();
		})();
	}, []);

	useEffect(() => {
		const unsubOrSub = NetInfo.addEventListener(state => {
			const online = Boolean(state.isConnected && state.isInternetReachable);
			setIsOnline(online);
			if (online) {
				void processOutbox();
			}
		});
		const cleanup: () => void =
			typeof unsubOrSub === 'function'
				? (unsubOrSub as () => void)
				: () => {
					(unsubOrSub as any)?.remove?.();
				};
		return cleanup;
	}, []);

	const processOutbox = useCallback(async () => {
		if (syncingRef.current) return;
		syncingRef.current = true;
		try {
			let batch = await OutboxRepo.oldestBatch(10);
			while (batch.length > 0) {
				for (const job of batch) {
					try {
						const body = JSON.parse(job.body || '{}');
						const headers = JSON.parse(job.headers || '{}');
						await httpClient.request({
							method: job.method as any,
							url: job.url,
							data: body,
							headers,
							timeout: 20000,
						});
						await OutboxRepo.markDone(job.id);
					} catch (e) {
						await OutboxRepo.markFailed(job.id);
					}
				}
				batch = await OutboxRepo.oldestBatch(10);
			}
		} finally {
			syncingRef.current = false;
		}
	}, []);

	const triggerSync = useCallback(async () => {
		if (!isOnline) return;
		await processOutbox();
	}, [isOnline, processOutbox]);

	return (
		<SyncContext.Provider value={{ isOnline, triggerSync }}>
			{children}
		</SyncContext.Provider>
	);
};


