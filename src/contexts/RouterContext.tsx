import ExpoVpnChecker from "expo-vpn-checker";
import NetInfo from '@react-native-community/netinfo';
import useAsyncStorage from "../hooks/useAsyncStorage";
import VPNScreen from "../components/global/VPNScreen";
import { Stack } from "expo-router";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "@/src/redux/slices/globalSlice";
import { StateType } from "../redux";

export const RouterContext = createContext({});

export const RouterContextProvider = () => {
    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch<any>()
    const [finishedOnboarding, setFinishedOnboarding] = useState(false)
    const { isVPNConnected, isLoggedIn } = useSelector((state: StateType) => state.globalReducer)


    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async () => {
            console.log("NetInfo", ExpoVpnChecker.checkVpn());

            dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        });

        return () => {
            unsubscribe();
        }

    }, []);

    useEffect(() => {
        (async () => {
            const jwt = await getItem('jwt')
            dispatch(globalActions.setIsLoggedIn(!!jwt))

            setTimeout(() => {
                setFinishedOnboarding(true)
            }, 2000);
        })()
    }, [])

    return (isVPNConnected ? <VPNScreen /> :
        <Stack screenOptions={{ animation: "fade", headerShadowVisible: false }}>
            <Stack.Protected guard={!finishedOnboarding}>
                <Stack.Screen name="splash" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={finishedOnboarding}>
                <Stack.Protected guard={isLoggedIn}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack.Protected>
                <Stack.Protected guard={!isLoggedIn}>
                    <Stack.Screen name="(signup)" options={{ headerShown: false }} />
                </Stack.Protected>
            </Stack.Protected>
        </Stack>
    )
}