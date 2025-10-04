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
            try {   
                if(db)             
                await db.execAsync(queries)

            } catch (error: any) {
                console.error(error);
            }
        }

        static getAll = async (query: string, params: SQLiteVariadicBindParams = []): Promise<LogType[]> => {
            if (params.length === 0)
                return await db.getAllAsync(query)

            return await db.getAllAsync<LogType>(query, params)
        }

        static search = async (query: string) => {
            try {
                const results = await db.getAllAsync<Record<string, any>>(query)
                return results

            } catch (error) {
                console.error({ error })
            }
        }
    }

    return {
        SQLite
    }
}

