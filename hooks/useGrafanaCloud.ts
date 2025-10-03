import axios from 'axios';

export const useGrafanaCloud = () => {

    const traces = [{
        traceId: "5af7183fb1d4cf5f",
        id: "6bf7183fb1d4cf5f",
        name: "load_home_screen",
        timestamp: Date.now() * 1000, // en microsegundos
        duration: 1500, // microsegundos
        localEndpoint: { serviceName: "expo-app" },
    }];
    const sendTempoTraces = async () => {
        try {
            const { data } = await axios.post(`https://tempo-prod-26-prod-us-east-2.grafana.net/tempo/api/v2/spans`, traces, {
                auth: {
                    username: "1142427",
                    password: "glc_eyJvIjoiMTM2NzA2MyIsIm4iOiJzdGFjay0xMTkwMzEzLWh0LXJlYWQtZXhwbyIsImsiOiJLV2NCZFlOOThCZjhVMGJJODM5MDF1WTQiLCJtIjp7InIiOiJwcm9kLXVzLWVhc3QtMCJ9fQ==",
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer TU_API_KEY"
                }
            });

            console.log({ data });

        } catch (error: any) {
            console.error(error.message);
        }
    }

    return {
        sendTempoTraces
    };
}