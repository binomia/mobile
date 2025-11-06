import {apolloClient} from "@/src/apollo";
import {AccountApolloQueries, TopUpApolloQueries} from "@/src/apollo/query";
import {TransactionApolloQueries} from "@/src/apollo/query/transactionQuery"
import {AccountAuthSchema} from "@/src/auth/accountAuth";
import {createAsyncThunk} from "@reduxjs/toolkit"
import moment from "moment";


export const fetchAccountLimit = createAsyncThunk('fetchAccountLimit', async (): Promise<any> => {
    try {
        const {data} = await apolloClient.query<any>({query: AccountApolloQueries.accountLimit()});
        return await AccountAuthSchema.accountLimits.parseAsync(data.accountLimit)

    } catch (error) {
        console.log(error);
    }
})

export const fetchRecentTransactions = createAsyncThunk('fetchRecentTransactions', async () => {
    try {
        const {data: recentTransactions} = await apolloClient.query<any>({
            query: TransactionApolloQueries.accountTransactions(),
            variables: {page: 1, pageSize: 5}
        });
        const {data: recentTopUps} = await apolloClient.query<any>({
            query: TopUpApolloQueries.recentTopUps(),
            variables: {page: 1, pageSize: 5}
        });

        const topupsMapped: any[] = recentTopUps.recentTopUps?.map((topup: any) => {
            const date = Number(topup.createdAt);
            return {
                type: "topup",
                uuid: topup.referenceId,
                status: topup.status,
                timestamp: isNaN(date) ? moment(topup.createdAt).valueOf() : date,
                data: topup
            }
        })

        const transactionsMapped: any[] = recentTransactions.accountTransactions?.map((transaction: any) => {
            const date = Number(transaction.createdAt);
            return {
                type: "transaction",
                uuid: transaction.transactionId,
                status: transaction.status,
                timestamp: isNaN(date) ? moment(transaction.createdAt).valueOf() : date,
                data: transaction
            }
        })

        return [...transactionsMapped, ...topupsMapped].sort((a: any, b: any) => {
            return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
        })

    } catch (error) {
        console.error({fetchRecentTransactions: error});
    }
})

export const fetchRecentTopUps = createAsyncThunk('fetchRecentTopUps', async () => {
    try {
        const {data} = await apolloClient.query<any>({
            query: TopUpApolloQueries.recentTopUps(),
            variables: {page: 1, pageSize: 5}
        });
        return data.recentTopUps

    } catch (error) {
        console.error({fetchRecentTopUps: error});
    }
})

export const fetchAllTransactions = createAsyncThunk('fetchAllTransactions', async ({page, pageSize}: {
    page: number,
    pageSize: number
}): Promise<any> => {
    try {
        const {data: {recentTopUps}} = await apolloClient.query<any>({
            query: TopUpApolloQueries.recentTopUps(),
            variables: {page, pageSize}
        });
        const {data: {accountTransactions}} = await apolloClient.query<any>({
            query: TransactionApolloQueries.accountTransactions(),
            variables: {page, pageSize}
        });

        const topupsMapped = recentTopUps?.map((topup: any) => {
            const date = Number(topup.createdAt);
            return {
                type: "topup",
                timestamp: isNaN(date) ? moment(topup.createdAt).valueOf() : date,
                data: topup
            }
        })

        const transactionsMapped = accountTransactions?.map((transaction: any) => {
            const date = Number(transaction.createdAt);
            return {
                type: "transaction",
                timestamp: isNaN(date) ? moment(transaction.createdAt).valueOf() : date,
                data: transaction
            }
        })

        if (transactionsMapped?.length > 0 || topupsMapped?.length > 0) {
            return [...transactionsMapped, ...topupsMapped].sort((a: any, b: any) => {
                return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
            })
        }

        return []

    } catch (error) {
        console.error({fetchAllTransactions: error});
    }
})

export const searchAccountTransactions = createAsyncThunk('searchAccountTransactions', async ({
                                                                                                  page,
                                                                                                  pageSize,
                                                                                                  search
                                                                                              }: {
    page: number,
    pageSize: number,
    search: string
}): Promise<any> => {
    try {
        const {data: transactionsData} = await apolloClient.query<any>({
            query: TransactionApolloQueries.searchAccountTransactions(),
            variables: {page, pageSize, fullName: search}
        })
        const {data: topUpsData} = await apolloClient.query<any>({
            query: TopUpApolloQueries.searchTopUps(),
            variables: {page, pageSize, search}
        })

        const transactionsMapped = transactionsData.searchAccountTransactions?.map((transaction: any) => {
            return {
                type: "transaction",
                timestamp: transaction.createdAt,
                data: transaction
            }
        })

        return [...transactionsMapped, ...topUpsData.searchTopUps].sort((a: any, b: any) => {
            return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
        })

    } catch (error) {
        console.log(error)
    }
})

export const fetchAccountBankingTransactions = createAsyncThunk('fetchAccountBankingTransactions', async ({
                                                                                                              page = 1,
                                                                                                              pageSize = 10
                                                                                                          }: {
    page: number,
    pageSize: number
}) => {
    try {
        const {data} = await apolloClient.query<any>({
            query: TransactionApolloQueries.accountBankingTransactions(),
            variables: {page, pageSize}
        })
        return data.accountBankingTransactions

    } catch (error) {
        console.error({accountBankingTransactions: error});
    }
})


