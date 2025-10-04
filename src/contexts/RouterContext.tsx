import ExpoVpnChecker from "expo-vpn-checker";
import NetInfo from '@react-native-community/netinfo';
import colors from "@/src/colors";
import useAsyncStorage from "../hooks/useAsyncStorage";
import { Stack, useNavigation } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "@/src/redux/slices/globalSlice";
import { StateType } from "../redux";

export const RouterContext = createContext({});

export const RouterContextProvider = () => {
    const { getItem } = useAsyncStorage()
    const navigation = useNavigation<any>()
    const dispatch = useDispatch<any>()
    const { isVPNConnected } = useSelector((state: StateType) => state.globalReducer)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [finishedOnboarding, setFinishedOnboarding] = useState(false)

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

    const defaultscreenOptions = {
        headerBackTitleVisible: false,
        headerTintColor: colors.white,
        headerStyle: { ...defaultHeaderStyles },
        tabBarStyle: { ...defaultTabStyles }

    }

    useEffect(() => {
        navigation.addListener('state', async () => {
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        })
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async () => {
            await dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        });

        return () => {
            unsubscribe();
        }

    }, []);

    useEffect(() => {
        (async () => {
            const jwt = await getItem('jwt')
            setIsLoggedIn(!!jwt)

            setTimeout(() => {
                setFinishedOnboarding(true)
            }, 2000);
        })()
    }, [])


    return (
        <Stack screenOptions={{animation: "fade", headerShadowVisible: false}}>
            <Stack.Protected guard={finishedOnboarding}>
                <Stack.Protected guard={isLoggedIn}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Protected guard={!isLoggedIn}>
                    <Stack.Screen name="(signup)" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Protected guard={isVPNConnected}>
                    <Stack.Screen name="(error)" options={{ ...defaultscreenOptions, headerShadowVisible: false, title: "Auditoría" }} />
                </Stack.Protected>
            </Stack.Protected>
            <Stack.Protected guard={!finishedOnboarding}>
                <Stack.Screen name="splash" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    )
}