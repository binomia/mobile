import {createSlice} from '@reduxjs/toolkit'
import {fetchAccountLimit} from '../fetchHelper'

type InitialStateType = {
    limits: any,
    haveAccountChanged: boolean,
    account: any,
    card: any,
    cards: any,
    kyc: any,
    user: any
}

const initialState: InitialStateType = {
    limits: {},
    haveAccountChanged: false,
    account: {},
    card: {},
    cards: [],
    kyc: {},
    user: {}
}

const accountSlice = createSlice({
    name: 'global',
    initialState,
    reducers: {
        setCard: (state, action) => {
            state.card = action.payload
        },
        setLimits: (state, action) => {
            state.limits = action.payload
        },
        setCards: (state, action) => {
            state.cards = action.payload
        },
        setAccount: (state, action) => {
            state.account = action.payload
        },
        setKyc: (state, action) => {
            state.kyc = action.payload
        },
        setUser: (state, action) => {
            state.user = action.payload
        },
        setHaveAccountChanged: (state, action) => {
            state.haveAccountChanged = action.payload
        }
    },
    extraReducers(builder) {
        // fetchAccountLimit
        builder.addCase(fetchAccountLimit.fulfilled, (state, action) => {
            state.limits = action.payload
        })
        builder.addCase(fetchAccountLimit.rejected, (state) => {
            state.limits = {}
        })
    }
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer
