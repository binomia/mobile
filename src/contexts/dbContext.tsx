import React, {createContext, ReactNode} from "react";
import {Low} from "lowdb";
import {z} from "zod";
import {ZodSchemas} from "@/src/schemas";
import moment from "moment";
import {useDispatch} from "react-redux";
import {DispatchType} from "@/src/redux";
import {transactionActions} from "@/src/redux/slices/transactionSlice";
import {DBContextDataType, DBContextType} from "@/src/types";
import {AsyncStorageAdapter} from "@/src/helpers";

const ALLOW_REFRESH_SECONDS = 15

const initialValues: DBContextDataType = {
    transactions: [],
    account: {
        status: "active",
        balance: 0,
        allowSend: true
    },
    lastTransactionReFetchedTime: 0,
    lastAccountReFetchedTime: 0,
}

const adapter = new AsyncStorageAdapter<DBContextDataType>("db", initialValues);
const db = new Low<DBContextDataType>(adapter, initialValues);

export const DBContext = createContext<DBContextType>({
    db,
    insertTransactions: (_: any[]) => Promise.resolve(),
    updateAccount: (_: z.infer<typeof ZodSchemas.account>) => Promise.resolve(),
    getRecentTransactions: () => Promise.resolve([]),
    allowReFetchTransactions: (_: boolean = false) => Promise.resolve(true),
    allowReFetchAccount: (_: boolean = false) => Promise.resolve(true),
    getAccount: (): Promise<z.infer<typeof ZodSchemas.account> | false> => Promise.resolve(initialValues.account)
});

export const DBContextProvider = ({children}: { children: ReactNode }) => {
    const dispatch = useDispatch<DispatchType>()

    const insertTransactions = async (transactions: z.infer<typeof ZodSchemas.recentTransactions>[]) => {
        try {
            await db.read();
            for (const transaction of transactions) {
                const exists = db.data.transactions.some(tx => tx.uuid === transaction.uuid);

                if (!exists) {
                    db.data.transactions.push(transaction);
                } else {
                    console.log("Duplicate ID, skipping insert:");
                }
            }

            await db.write(); // write once at the end
        } catch (e: any) {
            console.error({insertTransactions: e});
        }
    };

    const getRecentTransactions = async () => {
        try {
            return db.data.transactions;

        } catch (e: any) {
            console.error({insertTransactions: e});
            return [];
        }
    }

    const allowReFetchTransactions = async (): Promise<boolean> => {
        try {
            await db.read();
            const transactions = db.data?.transactions ?? [];

            // If no transactions exist yet, allow refetch
            if (transactions.length === 0) return true;

            const now = Date.now();
            const lastFetched = db.data?.lastTransactionReFetchedTime ?? 0;

            // If last fetch was less than 10 seconds ago, skip refetch
            const secondsSinceLastFetch = (now - lastFetched) / 1000;
            if (secondsSinceLastFetch < ALLOW_REFRESH_SECONDS) {
                console.log(`⏳ Only ${secondsSinceLastFetch.toFixed(1)}s since last fetch — skipping`);
                return false;
            }

            const canReFetch = transactions.some(tx => {
                const isBefore = (timestamp: number, amount: number, unit: moment.DurationInputArg2) =>
                    moment(timestamp).isBefore(moment().subtract(amount, unit));

                return (
                    tx.status !== "completed" ||
                    isBefore(tx.timestamp, 500, "minutes")
                );
            });

            if (!canReFetch) {
                dispatch(transactionActions.setRecentTransactions(db.data.transactions));
            } else {
                db.data.lastTransactionReFetchedTime = now;
                await db.write();
            }

            return canReFetch;
        } catch (e: any) {
            console.error({allowReFetchTransactions: e});
            return true;
        }
    };

    const allowReFetchAccount = async (): Promise<boolean> => {
        try {
            await db.read();

            const now = Date.now();
            const lastFetched = db.data?.lastAccountReFetchedTime ?? 0;

            // If last fetch was less than 10 seconds ago, skip refetch
            const secondsSinceLastFetch = (now - lastFetched) / 1000;
            if (secondsSinceLastFetch < ALLOW_REFRESH_SECONDS) {
                console.log(`⏳ Only ${secondsSinceLastFetch.toFixed(1)}s since last fetch — skipping`);
                return false;
            }

            db.data.lastAccountReFetchedTime = now;
            await db.write();

            return true;
        } catch (e: any) {
            console.error({allowReFetchTransactions: e});
            return true;
        }
    };

    const updateAccount = async (account: z.infer<typeof ZodSchemas.account>) => {
        try {
            await db.read();
            db.data.account = account;

            await db.write();

        } catch (e: any) {
            console.error({updateAccountBalance: e});
        }
    }

    const getAccount = async (): Promise<z.infer<typeof ZodSchemas.account> | false> => {
        try {
            await db.read();
            return db.data.account;
        } catch (e) {
            console.error({getAccount: e});
            return false;
        }
    }

    const data = {
        db,
        insertTransactions,
        getRecentTransactions,
        allowReFetchTransactions,
        updateAccount,
        allowReFetchAccount,
        getAccount
    }

    return <DBContext.Provider value={data}>{children}</DBContext.Provider>;
};
