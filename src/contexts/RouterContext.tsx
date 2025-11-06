import ExpoVpnChecker from "expo-vpn-checker";
import NetInfo from '@react-native-community/netinfo';
import useAsyncStorage from "../hooks/useAsyncStorage";
import VPNScreen from "../components/global/VPNScreen";
import {Stack, useGlobalSearchParams, usePathname} from "expo-router";
import {createContext, useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {globalActions} from "@/src/redux/slices/globalSlice";
import {StateType} from "../redux";
import {useCameraPermission, useMicrophonePermission} from "react-native-vision-camera";
import {useGrafanaCloud} from "@/src/hooks/useGrafanaCloud";

export const RouterContext = createContext({});

export const RouterContextProvider = () => {
    const {getItem} = useAsyncStorage()
    const dispatch = useDispatch<any>()
    const {isVPNConnected, isLoggedIn} = useSelector((state: StateType) => state.globalReducer)
    const {account} = useSelector((state: StateType) => state.accountReducer)
    const pathname = usePathname();
    const params = useGlobalSearchParams();
    const {Loki} = useGrafanaCloud()

    const [finishedOnboarding, setFinishedOnboarding] = useState(false)
    const [currentPage, setCurrentPage] = useState(pathname)

    const cameraPermission = useCameraPermission()
    const microphonePermission = useMicrophonePermission()

    const onLayoutRootView = useCallback(async () => {
        try {
            if (!cameraPermission.hasPermission) {
                await cameraPermission.requestPermission();
            }

            if (!microphonePermission.hasPermission) {
                await microphonePermission.requestPermission();
            }

        } catch (error) {
            console.error({error});
        }

    }, []);

    const initializeAllAppData = async () => {
        const jwt = await getItem('jwt')
        dispatch(globalActions.setIsLoggedIn(!!jwt))

        await Promise.all([
            onLayoutRootView(),
        ])
    }

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async () => {
            dispatch(globalActions.setIsVPNConnected(ExpoVpnChecker.checkVpn()))
        });

        return () => {
            unsubscribe();
        }

    }, []);

    useEffect(() => {
        (async () => {
            await initializeAllAppData()

            setTimeout(() => {
                setFinishedOnboarding(true)
            }, 2000);
        })()
    }, [])

    // Track the location in your analytics provider here.
    useEffect(() => {
        (async () => {
            await Loki.push(`Expo Router`, {
                service_name: "binomia",
                account_id: account?.id,
                from_route: currentPage,
                to_route: pathname,
                params
            })
            setCurrentPage(pathname)
        })();

    }, [pathname, params]);

    return (isVPNConnected ? <VPNScreen/> :
            <Stack screenOptions={{animation: "fade", headerShadowVisible: false}}>
                <Stack.Protected guard={!finishedOnboarding}>
                    <Stack.Screen name="splash" options={{headerShown: false}}/>
                </Stack.Protected>
                <Stack.Protected guard={finishedOnboarding}>
                    <Stack.Protected guard={isLoggedIn}>
                        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    </Stack.Protected>
                    <Stack.Protected guard={!isLoggedIn}>
                        <Stack.Screen name="(signup)" options={{headerShown: false}}/>
                    </Stack.Protected>
                </Stack.Protected>
            </Stack>
    )
}