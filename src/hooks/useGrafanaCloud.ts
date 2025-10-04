import { LOKI_PASSWORD, LOKI_URL, LOKI_USERNAME } from "@/src/constants";
import axios from 'axios';
import { useSQLite } from "@/src/hooks";
import { Platform } from "react-native";
import { HASH } from "cryptografia";
import * as Network from 'expo-network';
import * as Application from 'expo-application';
import * as Device from 'expo-device';


export const useGrafanaCloud = () => {
    const { SQLite } = useSQLite()
    class Loki {
        static push = async (message: string, labels: Record<string, any>) => {
            try {
                const streams = [
                    {
                        stream: labels,
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

        static create = async (lavel: string = "INFO", data?: Record<string, any>) => {
            const ipAddress = await Network.getIpAddressAsync();
            const deviceId = await Application.getInstallationTimeAsync();
            const meta = JSON.stringify(Object.assign({}, data || {}, {
                ipAddress: ipAddress,
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
                deviceType: ["unknown", "phone", "tablet", "tv", "desktop"][Device.deviceType || 0],
            }))

            await SQLite.execute(/*sql*/`
                INSERT INTO logs (timestamp, level, meta) VALUES (                                  
                    datetime('now'),
                    '${lavel.toUpperCase()}',
                    '${meta}'                
                )
            `)
        }

        static getAll = async () => {
            return await SQLite.getAll(`SELECT * FROM logs`)
        }

        static dropLogs = async () => {
            await SQLite.execute(/*sql*/`
                DELETE FROM logs;
            `)
        }
    }

    return {
        Loki
    };
}