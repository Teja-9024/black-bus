import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

type SQLResultRow = { [column: string]: any };

let db: SQLiteDatabase | null = null;

export const getDb = (): SQLiteDatabase => {
	if (!db) {
		db = openDatabaseSync('app.db');
	}
	return db as SQLiteDatabase;
};

export const runMigrations = async (): Promise<void> => {
	const database = getDb();
	await database.execAsync('PRAGMA foreign_keys = ON;');
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS vans (
			_id TEXT PRIMARY KEY,
			vanNo TEXT,
			name TEXT,
			capacity REAL,
			currentDiesel REAL,
			morningStock REAL,
			totalFilled REAL,
			totalDelivered REAL,
			assignedWorker TEXT,
			workerName TEXT
		);
	`);
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS fuel_rates (
			rate REAL,
			updatedAt TEXT
		);
	`);
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS deliveries (
			local_id INTEGER PRIMARY KEY AUTOINCREMENT,
			server_id TEXT,
			vanNo TEXT,
			supplier TEXT,
			customer TEXT,
			litres REAL,
			amount REAL,
			dateTime TEXT,
			workerName TEXT,
			sync_status TEXT DEFAULT 'synced',
			createdAt TEXT,
			updatedAt TEXT
		);
	`);
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS intakes (
			local_id INTEGER PRIMARY KEY AUTOINCREMENT,
			server_id TEXT,
			vanNo TEXT,
			pumpName TEXT,
			sourceType TEXT,
			sourceName TEXT,
			litres REAL,
			amount REAL,
			dateTime TEXT,
			workerName TEXT,
			sync_status TEXT DEFAULT 'synced',
			createdAt TEXT,
			updatedAt TEXT
		);
	`);
	// Best-effort migration for existing apps where the table already exists without the new columns
	try { await database.execAsync('ALTER TABLE intakes ADD COLUMN sourceType TEXT'); } catch {}
	try { await database.execAsync('ALTER TABLE intakes ADD COLUMN sourceName TEXT'); } catch {}
	await database.execAsync(`
		CREATE TABLE IF NOT EXISTS outbox (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			method TEXT,
			url TEXT,
			body TEXT,
			headers TEXT,
			createdAt TEXT,
			tries INTEGER DEFAULT 0,
			status TEXT DEFAULT 'pending'
		);
	`);
};

export const exec = async (
	database: SQLiteDatabase,
	query: string,
	params: any[] = []
): Promise<{ lastInsertRowId: number; changes: number }> => {
	const res = await database.runAsync(query, params);
	return { lastInsertRowId: (res as any).lastInsertRowId ?? 0, changes: (res as any).changes ?? 0 };
};

export const queryAll = async <T = SQLResultRow>(
	query: string,
	params: any[] = []
): Promise<T[]> => {
	const database = getDb();
	return database.getAllAsync<T>(query, params);
};

export const queryOne = async <T = SQLResultRow>(
	query: string,
	params: any[] = []
): Promise<T | null> => {
	const database = getDb();
	return database.getFirstAsync<T>(query, params);
};

export const runInTransaction = async (
	fn: (database: SQLiteDatabase) => Promise<void> | void
): Promise<void> => {
	const database = getDb();
	await database.withTransactionAsync(async () => {
		await fn(database);
	});
};

export const resetAllTables = async (): Promise<void> => {
	const database = getDb();
	await database.execAsync('DELETE FROM vans');
	await database.execAsync('DELETE FROM fuel_rates');
	await database.execAsync('DELETE FROM deliveries');
	await database.execAsync('DELETE FROM intakes');
	await database.execAsync('DELETE FROM outbox');
};


