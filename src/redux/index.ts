import { configureStore } from '@reduxjs/toolkit'
import { registerReducer } from './slices/registerSlice'
import { globalReducer } from './slices/globalSlice'
import { transactionReducer } from './slices/transactionSlice'
import { topupReducer } from './slices/topupSlice'
import { accountReducer } from './slices/accountSlice'
import { useDispatch } from 'react-redux'


export const store = configureStore({
    reducer: {
        globalReducer,
        accountReducer,
        registerReducer,
        transactionReducer,
        topupReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false, // Disable checks for non-serializable values (optional)
        immutableCheck: false, // Disable immutable state checks (optional)
        thunk: true, // Ensure thunk is enabled for async actions like createAsyncThunk
    }),
})

export type DispatchType = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<DispatchType>() // Export a hook that can be reused to resolve types

export type StateType = ReturnType<typeof store.getState>