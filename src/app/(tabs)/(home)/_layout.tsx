import React from 'react';
import colors from '@/src/colors';
import { Stack } from 'expo-router';
import { HomeHeaderLeft, HomeHeaderRight, TopupsRight, TransactionsHeaderRight } from '@/src/components/navigation/HeaderBar';

export default function TabLayout() {
	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0
	}
	const defaultTabStyles = {
		backgroundColor: colors.darkGray,
		borderTopWidth: 0,
		elevation: 0,
	}

	const defaultScreenOptions = {
		headerBackTitleVisible: false,
		headerTintColor: colors.white,
		headerStyle: { ...defaultHeaderStyles },
		tabBarStyle: { ...defaultTabStyles },

	}

	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name='index' options={{ ...defaultScreenOptions, title: "", headerLeft: () => <HomeHeaderLeft />, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='user' options={{ title: "Buscar", ...defaultScreenOptions, headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='request' options={{ title: "Solicitar Dinero", ...defaultScreenOptions }} />
			<Stack.Screen name='insurances' options={{ title: "Seguros", ...defaultScreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='topups' options={{ title: "Recargas", ...defaultScreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='topUpTransactions' options={{ title: "", ...defaultScreenOptions, headerRight: () => <TopupsRight /> }} />
			<Stack.Screen name='createTopUp' options={{ title: "Nueva Recarga", ...defaultScreenOptions }} />
			<Stack.Screen name='transactions' options={{ ...defaultScreenOptions, title: "Transacciones", headerRight: () => <TransactionsHeaderRight /> }} />
		</Stack>
	);
}
