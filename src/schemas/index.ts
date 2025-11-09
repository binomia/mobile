import {z} from "zod";

const recentTransactions = z.object({
    type: z.string(),
    uuid: z.string(),
    status: z.string(),
    timestamp: z.number(),
    data: z.object({}).passthrough(),
})

const account = z.object({
    status: z.string().optional().transform(v => v ?? "active"),
    balance: z.number().optional().transform(v => v ?? 0),
    allowSend: z.boolean().optional().transform(v => !!v),
})


export const ZodSchemas = {
    recentTransactions,
    account
}