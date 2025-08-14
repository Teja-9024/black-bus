declare module '@react-native-community/netinfo' {
	import { EmitterSubscription } from 'react-native';

	export type NetInfoState = {
		isConnected: boolean | null;
		isInternetReachable?: boolean | null;
	};

	const NetInfo: {
		addEventListener: (listener: (state: NetInfoState) => void) => EmitterSubscription | (() => void);
		fetch: () => Promise<NetInfoState>;
	};

	export default NetInfo;
}


