import 'react-native-get-random-values';
import 'react-native-reanimated';
import React, { Suspense } from 'react';
import { useFonts } from 'expo-font';
import { NativeBaseProvider } from 'native-base';
import { theme } from '@/src/themes';
import { Provider } from 'react-redux';
import { store } from '@/src/redux';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/src/apollo';
import { SessionContextProvider } from '@/src/contexts/sessionContext';
import { GlobalContextProvider } from '@/src/contexts/globalContext';
import { ActivityIndicator, LogBox, View } from 'react-native';
import { SocketContextProvider } from '@/src/contexts/socketContext';
import { TopUpContextProvider } from '@/src/contexts/topUpContext';
import { RouterContextProvider } from '@/src/contexts/RouterContext';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SpaceMono = require('../fonts/SpaceMono-Regular.ttf');

LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs(['In React 18']);

const Layout = () => {
	useFonts({
		SpaceMono
	});

	return (
		<Suspense fallback={<ActivityIndicator size={"large"} />}>
				<NativeBaseProvider theme={theme}>
					<Provider store={store}>
						<ApolloProvider client={apolloClient}>
							<SessionContextProvider>
								<GlobalContextProvider>
									<SocketContextProvider>
										<TopUpContextProvider>
											<View style={{ flex: 1 }}>
												<RouterContextProvider />
											</View>
										</TopUpContextProvider>
									</SocketContextProvider>
								</GlobalContextProvider>
							</SessionContextProvider>
						</ApolloProvider>
					</Provider >
				</NativeBaseProvider>
		</Suspense>
	);
}


export default Layout