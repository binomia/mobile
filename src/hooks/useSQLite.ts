import { SQLiteVariadicBindParams, useSQLiteContext } from "expo-sqlite";

type LogType = {
    id: number;
    timestamp: string;
    level: string;
    meta: string;
}


export const useSQLite = () => {
    const db = useSQLiteContext()

    class SQLite {
        static execute = async (queries: string) => {
            await db.execAsync(queries)
        }

        static getAll = async (query: string, params: SQLiteVariadicBindParams = []): Promise<LogType[]> => {
            if (params.length === 0)
                return await db.getAllAsync(query)

            return await db.getAllAsync<LogType>(query, params)
        }
    }

    return {
        SQLite
    }
}

