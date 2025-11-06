import { topUpInitialState } from "@/src/mocks";
import { TopUpContextType } from "@/src/types";
import React, { createContext, useState } from "react";

export const TopUpContext = createContext<TopUpContextType>(topUpInitialState);

export const TopUpContextProvider = ({ children }: { children: React.JSX.Element }) => {
    const [phoneNumber, setPhoneNumber] = useState<string>(topUpInitialState.phoneNumber)
    const [amount, setAmount] = useState<number>(topUpInitialState.amount)
    const [fullName, setFullName] = useState<string>(topUpInitialState.fullName)
    const [company, setCompany] = useState<any>(topUpInitialState.company)

    const data = {
        phoneNumber,
        amount,
        fullName,
        company,

        setPhoneNumber,
        setAmount,
        setFullName,
        setCompany
    }


    return (
        <TopUpContext.Provider value={data}>
            {children}
        </TopUpContext.Provider>
    )
}