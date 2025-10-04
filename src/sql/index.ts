

export const dropTable = (tableName: string) => {
    return /*sql*/`
        DROP TABLE IF EXISTS ${tableName};      
    `
}

export const generateTransactionTable = (drop: boolean = false) => {
    return /*sql*/`
        ${drop ? 'DROP TABLE IF EXISTS "transactions";' : ''}
        CREATE TABLE IF NOT EXISTS "transactions" (
            id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            uuid  TEXT NOT NULL UNIQUE,
            accountId      TEXT NOT NULL,
            status         TEXT NOT NULL,
            timestamp      DATETIME NOT NULL,
            type           TEXT NOT NULL,
            data           TEXT NOT NULL
        );      
    `

    // uuid, accountId, status, timestamp, type
}
export const generateAccountTable = (drop: boolean = false) => {
    return /*sql*/`
        ${drop ? 'DROP TABLE IF EXISTS "account";' : ''}
        CREATE TABLE IF NOT EXISTS "account" (
            id         INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            accountId  TEXT NOT NULL UNIQUE,
            timestamp  TEXT NOT NULL,
            data       TEXT NOT NULL
        );      
    `
}

export const generateLogsTable = (drop: boolean = false) => {
    return /*sql*/`
        ${drop ? 'DROP TABLE IF EXISTS "logs";' : ''}
        CREATE TABLE IF NOT EXISTS "logs" (
            "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "timestamp" DATETIME NOT NULL DEFAULT (datetime('now')),
            "level"     TEXT NOT NULL,              
            "meta"      TEXT NOT NULL              
		);      
    `
}