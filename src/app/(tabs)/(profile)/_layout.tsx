import React from 'react';
import colors from '@/src/colors';
import { Stack } from 'expo-router';
import { HomeHeaderRight } from '@/src/components/navigation/HeaderBar';

const ProfileLayout = () => {
	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0,
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
		tabBarStyle: { ...defaultTabStyles }

	}

	return (
		<Stack screenOptions={{ headerShadowVisible: false }}>
			<Stack.Screen name='profile' options={{ ...defaultScreenOptions, title: "", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='personal' options={{ ...defaultScreenOptions, title: "Información", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='privacy' options={{ ...defaultScreenOptions, title: "Privacidad & Seguridad", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='limits' options={{ ...defaultScreenOptions, title: "Limites De Cuenta", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='notifications' options={{ ...defaultScreenOptions, title: "Notificaciones", headerRight: () => <HomeHeaderRight /> }} />
			<Stack.Screen name='support' options={{ ...defaultScreenOptions, title: "Soporte", headerRight: () => <HomeHeaderRight /> }} />
		</Stack>
	);
}


export default ProfileLayout