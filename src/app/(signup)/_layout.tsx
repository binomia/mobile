import 'react-native-reanimated';
import React from "react";
import {Stack} from 'expo-router';
import {LoginRight, WelcomeLeft, WelcomeRight} from '@/src/components/navigation/HeaderBar';
import colors from '@/src/colors';


const Signup: React.FC = () => {
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
        headerStyle: {...defaultHeaderStyles},
        tabBarStyle: {...defaultTabStyles}
    }
    return (
        <Stack screenOptions={{...defaultScreenOptions}}>
            <Stack.Screen name="login" options={{
                headerShadowVisible: false,
                title: '',
                headerLeft: () => <WelcomeLeft/>,
                headerRight: () => <LoginRight/>
            }}/>
            <Stack.Screen name="register" options={{
                headerShadowVisible: false,
                title: '',
                headerLeft: () => <WelcomeLeft/>,
                headerRight: () => <WelcomeRight/>
            }}/>
            <Stack.Screen name="welcome" options={{
                title: '',
                headerShadowVisible: false,
                headerLeft: () => <WelcomeLeft/>,
                headerRight: () => <WelcomeRight/>
            }}/>
        </Stack>
    )
}

export default Signup
