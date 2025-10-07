import useAsyncStorage from '@/src/hooks/useAsyncStorage';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { HASH } from 'cryptografia';

const httpLink = new HttpLink({
    uri: `http://192.168.1.93:8000/graphql`,
    credentials: "include",
    preserveHeaderCase: true,
});

const errorLink = new ErrorLink((errorHandlers) => {
    const { graphQLErrors }: any = errorHandlers;
    if (graphQLErrors)
        graphQLErrors.forEach(async (error: any) => {
            const { message } = error;

            if (message.includes("INVALID_SESSION")) {
                await SecureStore.deleteItemAsync("jwt").then(async () => {
                    // Alert.alert("Your session has expired. Please login again.");
                    // await Updates.reloadAsync();
                    router.navigate("/login");
                });
            } else if (message.includes("no puede recibir pagos")) {
                Alert.alert(message);
            }
        });
});

const setAuthorizationLink = new SetContextLink(async (previousContext) => {
    const jwt = await useAsyncStorage().getItem("jwt");
    const ipAddress = await Network.getIpAddressAsync();
    const deviceId = await Application.getInstallationTimeAsync();

    return {
        headers: {
            ...previousContext.headers,
            ipAddress,
            platform: Platform.OS,
            "deviceId": HASH.sha256(deviceId.toString()),
            "authorization": `Bearer ${jwt}`,
            device: JSON.stringify({
                ipAddress,
                platform: Platform.OS,
                deviceId: HASH.sha256(deviceId.toString()),
                totalMemory: Device.totalMemory,
                modelId: Device.modelId?.toLowerCase(),
                modelName: Device.modelName?.toLowerCase(),
                osVersion: Device.osVersion?.toLowerCase(),
                brand: Device.brand?.toLowerCase(),
                deviceName: Device.deviceName?.toLowerCase(),
                isDevice: Device.isDevice,
                manufacturer: Device.manufacturer?.toLowerCase(),
                deviceType: ["unknown", "phone", "tablet", "tv", "desktop"][Device.deviceType || 0]
            })
        }
    };
});

const defaultOptions: ApolloClient.DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}


export const apolloClient = new ApolloClient({
    link: ApolloLink.from([setAuthorizationLink, errorLink, httpLink]),
    defaultOptions: defaultOptions,
    cache: new InMemoryCache({
        resultCaching: false,
    })
});
