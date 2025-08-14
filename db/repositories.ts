import { exec, getDb, queryAll, queryOne, runInTransaction } from './sqlite';

export type DeliveryRow = {
	local_id?: number;
	server_id?: string | null;
	vanNo: string;
	supplier: string;
	customer: string;
	litres: number;
	amount: number;
	dateTime: string;
	workerName?: string | null;
	sync_status?: 'pending' | 'synced' | 'failed';
	createdAt?: string;
	updatedAt?: string;
};

export type IntakeRow = {
	local_id?: number;
	server_id?: string | null;
	vanNo: string;
	pumpName: string;
	litres: number;
	amount: number;
	dateTime: string;
	workerName?: string | null;
	sync_status?: 'pending' | 'synced' | 'failed';
	createdAt?: string;
	updatedAt?: string;
};

export const VansRepo = {
	upsertMany: async (rows: any[]) => {
		if (!rows || rows.length === 0) return;
		await runInTransaction(async (db) => {
			for (const v of rows) {
				await exec(db,
					`INSERT OR REPLACE INTO vans (_id, vanNo, name, capacity, currentDiesel, morningStock, totalFilled, totalDelivered, assignedWorker, workerName)
					 VALUES (?,?,?,?,?,?,?,?,?,?)`,
					[
						v._id,
						v.vanNo,
						v.name,
						v.capacity ?? null,
						v.currentDiesel ?? null,
						v.morningStock ?? null,
						v.totalFilled ?? null,
						v.totalDelivered ?? null,
						v.assignedWorker ?? null,
						v.workerName ?? null,
					]
				);
			}
		});
	},
	all: async () => queryAll<any>('SELECT * FROM vans'),
};

export const FuelRateRepo = {
	set: async (rate: number, when: string) => {
    await exec(
        getDb(),
			'DELETE FROM fuel_rates'
		);
    await exec(
        getDb(),
			'INSERT INTO fuel_rates (rate, updatedAt) VALUES (?, ?)',
			[rate, when]
		);
	},
	get: async (): Promise<number> => {
		const row = await queryOne<{ rate: number }>('SELECT rate FROM fuel_rates LIMIT 1');
		return row?.rate ?? 0;
	},
};

export const DeliveriesRepo = {
	insertLocalPending: async (row: DeliveryRow): Promise<number> => {
		const now = new Date().toISOString();
        const res = await exec(getDb(),
			`INSERT INTO deliveries (server_id, vanNo, supplier, customer, litres, amount, dateTime, workerName, sync_status, createdAt, updatedAt)
			 VALUES (NULL,?,?,?,?,?,?,?,?,?,?)`,
			[row.vanNo, row.supplier, row.customer, row.litres, row.amount, row.dateTime, row.workerName ?? null, 'pending', now, now]
		);
		return (res.insertId || 0) as number;
	},
	markSyncedByLocalId: async (localId: number, serverId: string) => {
		const now = new Date().toISOString();
        await exec(getDb(), 'UPDATE deliveries SET server_id=?, sync_status=?, updatedAt=? WHERE local_id=?', [serverId, 'synced', now, localId]);
	},
	all: async () => queryAll<DeliveryRow>('SELECT * FROM deliveries ORDER BY datetime(createdAt) DESC'),
};

export const IntakesRepo = {
	insertLocalPending: async (row: IntakeRow): Promise<number> => {
		const now = new Date().toISOString();
        const res = await exec(getDb(),
			`INSERT INTO intakes (server_id, vanNo, pumpName, litres, amount, dateTime, workerName, sync_status, createdAt, updatedAt)
			 VALUES (NULL,?,?,?,?,?,?,?,?,?)`,
			[row.vanNo, row.pumpName, row.litres, row.amount, row.dateTime, row.workerName ?? null, 'pending', now, now]
		);
		return (res.insertId || 0) as number;
	},
	markSyncedByLocalId: async (localId: number, serverId: string) => {
		const now = new Date().toISOString();
        await exec(getDb(), 'UPDATE intakes SET server_id=?, sync_status=?, updatedAt=? WHERE local_id=?', [serverId, 'synced', now, localId]);
	},
	all: async () => queryAll<IntakeRow>('SELECT * FROM intakes ORDER BY datetime(createdAt) DESC'),
};

export const OutboxRepo = {
	enqueue: async (method: string, url: string, body: any, headers: any): Promise<number> => {
		const now = new Date().toISOString();
        const res = await exec(getDb(),
			'INSERT INTO outbox (method, url, body, headers, createdAt, tries, status) VALUES (?,?,?,?,?,0,\'pending\')',
			[method, url, JSON.stringify(body ?? {}), JSON.stringify(headers ?? {}), now]
		);
		return (res.insertId || 0) as number;
	},
	oldestBatch: async (limit = 10) => {
		return queryAll<{ id: number; method: string; url: string; body: string; headers: string; tries: number }>(
			'SELECT id, method, url, body, headers, tries FROM outbox WHERE status=\'pending\' ORDER BY id ASC LIMIT ?',
			[limit]
		);
	},
	markDone: async (id: number) => {
        await exec(getDb(), 'DELETE FROM outbox WHERE id=?', [id]);
	},
	markFailed: async (id: number) => {
        await exec(getDb(), 'UPDATE outbox SET tries = tries + 1, status=\'pending\' WHERE id=?', [id]);
	},
};


