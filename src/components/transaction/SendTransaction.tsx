import React, {useEffect, useRef, useState} from 'react'
import BottomSheet from '@/src/components/global/BottomSheet';
import PagerView from 'react-native-pager-view';
import CreateTransaction from './CreateTransaction';
import TransactionDetails from './TranferDetails';
import SingleTransaction from './SingleTransaction';
import {Dimensions, Alert} from 'react-native'
import {useDispatch, useSelector} from 'react-redux';
import {transactionActions} from '@/src/redux/slices/transactionSlice';
import {router} from 'expo-router';
import {pendingClock} from '@/src/assets';
import {fetchRecentTransactions} from '@/src/redux/fetchHelper';
import {useLazyQuery} from '@apollo/client/react';
import {UserApolloQueries} from '@/src/apollo/query';
import {DispatchType, StateType} from '@/src/redux';
import {SafeAreaView} from 'react-native-safe-area-context';

type Props = {
    open?: boolean
    onSendFinish?: () => any
    onCloseFinish?: () => void
}

const {height} = Dimensions.get('window')
const SendTransactionScreen: React.FC<Props> = ({
                                                    open = false, onCloseFinish = () => {
    }
                                                }) => {
    const dispatch = useDispatch<DispatchType>();
    const ref = useRef<PagerView>(null);
    const [input, setInput] = useState<string>("0");
    const [visible, setVisible] = useState<boolean>(open);
    const [currentPage, setCurrentPage] = useState<number>(0);

    const {receiver} = useSelector((state: StateType) => state.transactionReducer)
    const [fetchSingleUser] = useLazyQuery<any>(UserApolloQueries.singleUser())

    const handleOnClose = async () => {
        if (currentPage === 2) {
            await dispatch(fetchRecentTransactions())

            ref.current?.setPage(0)
            router.navigate("(home)")

            setCurrentPage(0)
            dispatch(transactionActions.setHasNewTransaction(true))
        }

        dispatch(transactionActions.setReceiver({}))

        onCloseFinish()
        setVisible(false)
        setInput("0")
    }

    const onPageSelected = async () => {
        const {data} = await fetchSingleUser({
            variables: {
                username: receiver.username
            }
        })

        const {allowReceive, status} = data.singleUser.account
        if (!allowReceive) {
            Alert.alert("Advertencia", `${receiver.fullName} no puede recibir dinero en este momento.`, [{
                onPress: async () => {
                    await handleOnClose()
                    router.navigate("(home)")
                }
            }])
        }

        if (status !== "active") {
            Alert.alert("Advertencia", `${receiver.fullName}  no se encuentra activo.`, [{
                onPress: async () => {
                    await handleOnClose()
                    router.navigate("(home)")
                }
            }])
        }

    }

    const prevPage = () => {
        if (currentPage === 0) {
            ref.current?.setPage(1)
            setCurrentPage(1)

        } else
            ref.current?.setPage(currentPage - 1)

        setCurrentPage(currentPage - 1)
    }


    const nextPage = () => {
        ref.current?.setPage(currentPage + 1)
        setCurrentPage(currentPage + 1)
    }

    useEffect(() => {
        setVisible(open)
    }, [open])

    return (
        <BottomSheet openTime={300} height={height * 0.9} onCloseFinish={handleOnClose} open={visible}>
            <SafeAreaView style={{flex: 1}}>
                <PagerView style={{flex: 1}} onPageSelected={onPageSelected} scrollEnabled={false} ref={ref} initialPage={currentPage}>
                    <CreateTransaction key={"transaction-create-0"} input={input} onCloseFinish={handleOnClose} setInput={setInput} nextPage={nextPage}/>
                    <TransactionDetails key={"TransactionDetailsScreen-1"} onClose={handleOnClose} goNext={nextPage} goBack={prevPage}/>
                    <SingleTransaction key={"SingleTransactionScreen-2"} onClose={handleOnClose} iconImage={pendingClock}/>
                </PagerView>
            </SafeAreaView>
        </BottomSheet>
    )
}

export default SendTransactionScreen