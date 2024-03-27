import Enmap from 'enmap';

interface Log {
	/** Log type used for filtering */
	type: string;
	/** The moment the log was issued */
	time: Date;
	/** top-level information easy to understand */
	message: string;
	/** low-level information */
	details: string;
	/** information to where the log was issues */
	origin: {
		/** The file location */
		file: string;
		/** The function in which the log was cause */
		fn: string;
	};
}
interface LogInternal {
	/** Log type used for filtering */
	type: string;
	/** The moment the log was issued */
	time: string;
	/** top-level information easy to understand */
	message: string;
	/** low-level information */
	details: string;
	/** information to where the log was issues */
	origin: {
		/** The file location */
		file: string;
		/** The function in which the log was cause */
		fn: string;
	};
}

export const logs = new Enmap<string, Log, LogInternal>('logs', {
	dataDir: './data/database/',
	serializer: (log) => ({
		...log,
		time: log.time.toISOString()
	}),
	deserializer: (log) => ({
		...log,
		time: new Date(log.time)
	})
});
