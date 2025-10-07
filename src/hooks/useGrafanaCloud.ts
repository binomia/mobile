import { LOKI_PASSWORD, LOKI_URL, LOKI_USERNAME } from "@/src/constants";
import axios from 'axios';
import * as Network from 'expo-network';


export const useGrafanaCloud = () => {
    class Loki {
        static push = async (message: string, labels: Record<string, any>) => {
            const ipAddress = await Network.getIpAddressAsync();

            try {
                const streams = [
                    {
                        stream: {...labels, ipAddress},
                        values: [
                            [
                                (Date.now() * 1_000_000).toString(), // Loki expects nanosecond timestamp
                                message,
                            ],
                        ],
                    },
                ];

                const res = await axios.post(
                    LOKI_URL,
                    { streams },
                    {
                        auth: {
                            username: LOKI_USERNAME,
                            password: LOKI_PASSWORD,
                        },
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("Log sent:", res.data);
            } catch (error: any) {
                console.error({ Loki: error?.toString() });
            }
        }

    }

    return {
        Loki
    };
}