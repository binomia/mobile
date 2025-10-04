

export const dropTable = (tableName: string) => {
    return /*sql*/`
        DROP TABLE IF EXISTS ${tableName};      
    `
}

export const generateTransactionTable = () => {
    return /*sql*/`
        CREATE TABLE IF NOT EXISTS "transactions" (
            transactionId      TEXT NOT NULL UNIQUE,
            timestamp          TEXT NOT NULL,
            data              TEXT NOT NULL
        );      
    `
}

export const generateLogsTable = () => {
    return /*sql*/`
        CREATE TABLE IF NOT EXISTS "logs" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "timestamp" DATETIME NOT NULL DEFAULT (datetime('now')),
            "level" TEXT NOT NULL,              
            "meta" TEXT NOT NULL              
		);      
    `
}