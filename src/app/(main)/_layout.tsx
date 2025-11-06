import 'react-native-reanimated';
import { Stack } from 'expo-router';
import colors from '@/src/colors';


const TabLayout = () => {
	const defaultHeaderStyles = {
		backgroundColor: colors.darkGray,
		shadowOpacity: 0,
		paddingLeft: 0
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
		<Stack screenOptions={{ ...defaultScreenOptions }}>
			<Stack.Screen name='location' options={{ headerShown: false }} />
			<Stack.Screen name='flagged' options={{ headerShown: false }} />
			<Stack.Screen name='error' options={{ headerShown: false }} />
			<Stack.Screen name='facemask' options={{ headerShown: false }} />
		</Stack>
	);
}

export default TabLayout