import { SOCKET_EVENTS } from "@/src/constants";
import useAsyncStorage from "@/src/hooks/useAsyncStorage";
import { createContext, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { AccountAuthSchema } from "@/src/auth/accountAuth";
import { useLazyQuery } from "@apollo/client/react";
import { AccountApolloQueries } from "@/src/apollo/query";
import { fetchAccountLimit, fetchAllTransactions, fetchRecentTopUps, fetchRecentTransactions } from "@/src/redux/fetchHelper";
import { accountActions } from "@/src/redux/slices/accountSlice";


export const SocketContext = createContext({});

export const SocketContextProvider = ({ children }: { children: any }) => {
    const [getAccount] = useLazyQuery<any>(AccountApolloQueries.account());

    const { getItem } = useAsyncStorage()
    const dispatch = useDispatch<any>()

    const refreshAccount = useCallback(async () => {
        try {
            const { data } = await getAccount()
            await dispatch(accountActions.setAccount(data.account))
        } catch (error) {
            console.log(error);
        }

    }, []);

    const runCallbackAfterEvents = async () => {
        await Promise.all([
            refreshAccount(),
            dispatch(accountActions.setHaveAccountChanged(false)),
            dispatch(fetchRecentTransactions()),
            dispatch(fetchRecentTopUps()),
            dispatch(fetchAllTransactions({ page: 1, pageSize: 10 })),
            dispatch(fetchAccountLimit())
        ])
    }

    useEffect(() => {
        getItem("jwt").then(async (jwt) => {
            if (!jwt) return

            const decoded = jwtDecode(jwt);
            const { username } = await AccountAuthSchema.jwtDecoded.parseAsync(decoded)

            const socket = io("http://192.168.1.93:8001", {
                query: { username }
            });

            socket.on("connect", () => {
                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_CREATED, async () => {
                    await runCallbackAfterEvents()
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_REQUEST_PAIED, async () => {
                    await runCallbackAfterEvents()
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_REQUEST_CANCELED, async () => {
                    await runCallbackAfterEvents()
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_TRANSACTION_CREATED_FROM_QUEUE, async () => {
                    await runCallbackAfterEvents()
                })

                socket.on(SOCKET_EVENTS.NOTIFICATION_QUEUE_TRANSACTION_CREATED, async () => {
                    await runCallbackAfterEvents()
                })
            })

            return () => {
                socket.off("connect");
            }

        }).catch((error) => {
            console.error({ error });
        })

    }, [])


    return (
        <SocketContext.Provider value={{}}>
            {children}
        </SocketContext.Provider>
    )
}