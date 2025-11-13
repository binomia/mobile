import React, {useEffect, useRef, useState} from 'react'
import colors from '@/src/colors'
import Button from '@/src/components/global/Button';
import PagerView from 'react-native-pager-view';
import * as Sharing from 'expo-sharing';
import {z} from 'zod';
import {Heading, Image, Text, VStack, HStack, Pressable, ZStack, Avatar} from 'native-base'
import {
    EXTRACT_FIRST_LAST_INITIALS,
    FORMAT_CREATED_DATE,
    FORMAT_CURRENCY,
    GENERATE_RAMDOM_COLOR_BASE_ON_TEXT,
    MAKE_FULL_NAME_SHORTEN
} from '@/src/helpers'
import {scale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation} from '@apollo/client/react';
import {TransactionApolloQueries} from '@/src/apollo/query/transactionQuery';
import {transactionActions} from '@/src/redux/slices/transactionSlice';
import {transactionStatus} from '@/src/mocks';
import {AntDesign, Entypo, MaterialIcons} from '@expo/vector-icons';
import {cancelIcon, checked, pendingClock, suspicious, waiting} from '@/src/assets';
import {TransactionAuthSchema} from '@/src/auth/transactionAuth';
import {useLocalAuthentication} from '@/src/hooks/useLocalAuthentication';
import {accountActions} from '@/src/redux/slices/accountSlice';
import {fetchAllTransactions, fetchRecentTransactions} from '@/src/redux/fetchHelper';
import {DispatchType, StateType} from '@/src/redux';
import CircularProgress from "react-native-circular-progress-indicator";
import {Dimensions} from "react-native";


type Props = {
    title?: string
    goNext?: (_?: number) => void,
    onClose?: (_?: boolean) => Promise<void>,
    showPayButton?: boolean
    iconImage?: any
}

const {width} = Dimensions.get("screen");
const statusSize = width / 8
const statusIconSize = statusSize * 0.5
const statusLinePadding = statusSize * 0.5
const statusLineHeight = statusSize * 0.6

const status = [
    {
        title: "Emitida",
        description: "Transacción inicializada",
        icon: "check-circle",
        progress: 100,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen
    },
    {
        title: "Pendiente",
        description: "En turno para ser procesada",
        icon: "clock-circle",
        progress: 100,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 1 ? "transparent" : progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen
    },
    {
        title: "Anomalías",
        description: "Comprobando posibles incidencias",
        icon: "security-scan",
        progress: 100,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen
    },
    {
        title: "Moviendo fondos",
        description: "Enviando fondos al destinatario",
        icon: "bank",
        progress: 100,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
    },
    {
        title: "Completed",
        description: "Transaction finished",
        icon: "check",
        progress: 100,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        hideDivider: true
    }
]


const SingleSentTransaction: React.FC<Props> = ({
                                                    title = "Ver Detalles", onClose = async (_?: boolean) => {
    }, showPayButton = false, goNext = (_?: number) => {
    }
                                                }) => {
    const ref = useRef<PagerView>(null);
    const dispatch = useDispatch<DispatchType>()
    const {authenticate} = useLocalAuthentication()
    const {transaction: _transaction} = useSelector((state: StateType) => state.transactionReducer)
    const {account, user}: {
        account: any,
        user: any,
        location: z.infer<typeof TransactionAuthSchema.transactionLocation>
    } = useSelector((state: any) => state.accountReducer)

    const [payRequestTransaction] = useMutation<any>(TransactionApolloQueries.payRequestTransaction());
    const [cancelRequestedTransaction] = useMutation<any>(TransactionApolloQueries.cancelRequestedTransaction());

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isPaying, setIsPaying] = useState<boolean>(false)
    const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)
    const [transaction] = useState<any>(_transaction)


    const handleShare = async () => {
        const isAvailableAsync = await Sharing.isAvailableAsync()
        if (!isAvailableAsync) return

        await Sharing.shareAsync("https://localhost:8080")
    }

    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction?.from?.user?.id === user?.id
        const profileImageUrl = isFromMe ? transaction?.to?.user?.profileImageUrl : transaction?.from?.user?.profileImageUrl
        const fullName = isFromMe ? transaction?.to?.user?.fullName : transaction?.from?.user?.fullName
        const username = isFromMe ? transaction?.to?.user?.username : transaction?.from?.user?.username
        const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction?.status === "pending"
        const amountColor = (transaction?.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

        return Object.assign({}, transaction, {
            isFromMe,
            showMap: !!transaction?.location?.uri,
            amountColor,
            profileImageUrl: profileImageUrl || "",
            amount: transaction?.amount,
            showPayButton,
            fullName: fullName || "",
            username: username || ""
        })
    }

    const onCancelRequestedTransaction = async () => {
        try {
            setIsCancelLoading(true)
            await cancelRequestedTransaction({
                variables: {
                    transactionId: transaction.transactionId
                }
            })

            await dispatch(fetchRecentTransactions())
            await dispatch(fetchAllTransactions({page: 1, pageSize: 5}))
            dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {
                status: "deleting",
            })))

            setIsCancelLoading(false)

        } catch (_: any) {
            setIsCancelLoading(false)
        }
    }

    const onPress = async (paymentApproved: boolean) => {
        if (showPayButton) {
            try {
                const authenticated = await authenticate()

                if (authenticated.success) {
                    setIsCancelLoading(!paymentApproved)
                    setIsLoading(paymentApproved)
                    setIsPaying(true)

                    const {data} = await payRequestTransaction({
                        variables: {
                            transactionId: transaction.transactionId,
                            paymentApproved
                        }
                    })

                    await Promise.all([
                        dispatch(fetchRecentTransactions()),
                        dispatch(fetchAllTransactions({page: 1, pageSize: 5})),
                        dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction)}))),
                        dispatch(accountActions.setAccount(Object.assign({}, account, {balance: Number(account.balance) - Number(transaction?.amount)})))
                    ])

                    goNext(paymentApproved ? 1 : 2)
                }

            } catch (_: any) {
                setIsLoading(false)
                await dispatch(fetchRecentTransactions())
                await onClose()

            } finally {
                setIsLoading(false)
                setIsCancelLoading(false)
                setIsPaying(false)
            }
        } else {
            setIsLoading(false)
            setIsCancelLoading(false)
            setIsPaying(false)
            ref.current?.setPage(1)
        }
    }

    const StatusIcon: React.FC<{ status: string }> = ({status}: { status: string }) => {
        if (status === "completed") {
            return (
                <ZStack w={"30px"} h={"30px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <HStack w={"80%"} h={"80%"} bg={colors.mainGreen} borderRadius={100}/>
                    <Image borderRadius={100} tintColor={colors.lightGray} alt='logo-image' w={"100%"} h={"100%"}
                           source={checked}/>
                </ZStack>
            )
        } else if (status === "cancelled" || status === "deleting") {
            return (
                <ZStack w={"30px"} h={"30px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <HStack w={"80%"} h={"80%"} bg={colors.white} borderRadius={100}/>
                    <Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={cancelIcon}/>
                </ZStack>
            )

        } else if (status === "pending") {
            return (
                <ZStack w={"30px"} h={"30px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100}/>
                    <Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock}/>
                </ZStack>
            )
        } else if (status === "waiting") {
            return (
                <ZStack w={"60px"} h={"60px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <HStack w={"100%"} h={"100%"} bg={colors.lightGray} borderRadius={100}/>
                    <Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={waiting}/>
                </ZStack>
            )
        } else if (status === "requested") {
            return (
                <ZStack w={"30px"} h={"30px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <HStack w={"80%"} h={"80%"} bg={colors.gray} borderRadius={100}/>
                    <Image borderRadius={100} alt='logo-image' w={"100%"} h={"100%"} source={pendingClock}/>
                </ZStack>
            )
        } else if (status === "suspicious" || status === "audited") {
            return (
                <ZStack w={"28px"} h={"28px"} borderRadius={100} justifyContent={"center"} alignItems={"center"}>
                    <Image resizeMethod="resize" tintColor={colors.goldenYellow} borderRadius={100} alt='logo-image'
                           w={"100%"} h={"100%"} source={suspicious}/>
                </ZStack>
            )
        }
    }

    useEffect(() => {
        console.log(JSON.stringify({showPayButton}, null, 2))
    }, []);
    return (
        <VStack flex={1} px={"20px"}>
            {/* Top */}
            <HStack w={"100%"} h={100} mb={5} justifyContent={"space-between"} alignItems={"center"}>
                <HStack pt={5}>
                    {transaction?.profileImageUrl ?
                        <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(50)} h={scale(50)} source={{uri: transaction?.profileImageUrl}}/>
                        :
                        <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(transaction?.fullName || "")}>
                            <Heading size={"sm"} color={colors.white}>
                                {EXTRACT_FIRST_LAST_INITIALS(transaction?.fullName || "0")}
                            </Heading>
                        </Avatar>
                    }
                    <VStack ml={"10px"}>
                        <Heading textTransform={"capitalize"} fontSize={scale(20)}
                                 color={"white"}>{MAKE_FULL_NAME_SHORTEN(transaction?.fullName || "")}</Heading>
                        <Text fontSize={scale(15)} color={colors.lightSkyGray}>{transaction?.username}</Text>
                    </VStack>
                </HStack>
                <Pressable mb={"20px"} _pressed={{opacity: 0.5}} bg={colors.lightGray} onPress={handleShare} w={"40px"} h={"40px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
                    <Entypo name="share" size={20} color={colors.mainGreen}/>
                </Pressable>
            </HStack>

            {/* Center */}
            <VStack w={"100%"} alignItems={"center"}>
                <Heading textTransform={"capitalize"} fontSize={scale(34)} color={colors.white}>{FORMAT_CURRENCY(transaction?.amount)}</Heading>
                <Text color={colors.lightSkyGray}>{FORMAT_CREATED_DATE(transaction?.createdAt)}</Text>
            </VStack>

            {/* Bottom */}
            <VStack flex={1} color={colors.white}>
                {showPayButton ?
                    <VStack mt={"40px"} alignItems={"center"}>
                        <VStack mt={5} space={"5px"} p={"10px"} borderRadius={10} justifyContent={"center"} alignItems={"center"}>
                            <StatusIcon status={transaction?.status || ""}/>
                            <Text textAlign={"center"} fontSize={scale(15)} color={colors.white}>{transactionStatus(transaction.status)}</Text>
                        </VStack>
                        <HStack w={"100%"} mt={"30px"} justifyContent={"space-between"}>
                            <Button
                                onPress={() => onPress(false)}
                                disabled={isLoading}
                                opacity={isLoading ? 0.5 : 1}
                                spin={isCancelLoading}
                                w={"49%"}
                                bg={colors.lightGray}
                                color={colors.red}
                                title={"Cancelar"}
                            />
                            <Button
                                disabled={isCancelLoading || account.balance < transaction.amount}
                                opacity={isCancelLoading || account.balance < transaction.amount ? 0.5 : 1}
                                onPress={() => onPress(true)}
                                spin={isPaying}
                                w={showPayButton ? "49%" : "80%"}
                                bg={account.balance > transaction.amount ? colors.mainGreen : colors.lightGray}
                                color={account.balance > transaction.amount ? colors.white : colors.mainGreen}
                                title={title}
                            />
                        </HStack>
                    </VStack>
                    : transaction.isFromMe ?
                        <VStack my={"20px"} textAlign={"center"} space={1} alignItems={"center"}>
                            <VStack w={"100%"} my={"20px"} textAlign={"center"} space={1} alignItems={"center"}>
                                {transaction?.status === "suspicious" ?
                                    <HStack mt={"20px"}>
                                        <Button
                                            title='Contactanos'
                                            w={"80%"}
                                            onPress={async () => await onClose(true)}
                                            bg={colors.mainGreen}
                                            leftRender={<MaterialIcons name="phone" size={24} color="white"/>}
                                        />
                                    </HStack>
                                    :
                                    <VStack w={"100%"} borderWidth={0.5} borderColor={colors.placeholder} mt={5} pt={5} px={5} borderRadius={15}>
                                        <Heading mb={3} fontSize={scale(15)} textTransform={"capitalize"} color={"white"}>{"Progreso"}</Heading>
                                        {status.map((item, i) => (
                                            <HStack key={i} w={"100%"} opacity={1}>
                                                <VStack w={"62px"} h={"80px"}>
                                                    <ZStack justifyContent={"center"} alignItems={"center"} w={`${statusSize}px`} h={`${statusSize}px`} borderRadius={100}>
                                                        <CircularProgress radius={25} showProgressValue={false} inActiveStrokeWidth={2} activeStrokeColor={item.activeStrokeColor(item.progress)} inActiveStrokeColor={item.inActiveStrokeColor(item.progress)} activeStrokeWidth={2} value={item.progress as number}/>
                                                        <AntDesign name={item.icon as any} size={statusIconSize} color={item.color(item.progress)}/>
                                                    </ZStack>
                                                    {item.hideDivider ? null : <HStack ml={`${statusLinePadding}px`} bottom={"3px"} h={`${statusLineHeight}px`} w={"2px"} bg={item.color(item.progress)}/>}
                                                </VStack>
                                                <VStack pl={1.5}>
                                                    <Heading fontSize={scale(16)} color={item.color(item.progress)}>{item.title}</Heading>
                                                    <Text color={item.color(item.progress)}>{item.description}</Text>
                                                </VStack>
                                            </HStack>
                                        ))}
                                    </VStack>
                                }
                                {transaction.status === "requested" ?
                                    <HStack mt={"20px"} w={"100%"} justifyContent={"center"}>
                                        <Button
                                            onPress={onCancelRequestedTransaction}
                                            spin={isCancelLoading}
                                            w={"49%"}
                                            bg={colors.lightGray}
                                            color={colors.red}
                                            title={"Cancelar"}
                                        />
                                    </HStack> : null}
                            </VStack>
                        </VStack>
                        : <VStack flex={1} h={5} mt={"40px"} space={"5px"} p={"10px"} borderRadius={10} justifyContent={"center"} alignItems={"center"}>
                            <StatusIcon status={transaction?.status || ""}/>
                            <Text textAlign={"center"} fontSize={scale(15)} color={colors.white}>{transactionStatus(transaction.status)}</Text>
                        </VStack>
                }
            </VStack>

        </VStack>
    )
}

export default SingleSentTransaction
