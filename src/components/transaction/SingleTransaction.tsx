import React, {useRef, useState} from 'react'
import colors from '@/src/colors'
import Button from '@/src/components/global/Button';
import moment from 'moment';
import PagerView from 'react-native-pager-view';
import * as Sharing from 'expo-sharing';
import {Heading, Image, Text, VStack, HStack, Pressable, ZStack, Avatar} from 'native-base'
import {
    EXTRACT_FIRST_LAST_INITIALS,
    FORMAT_CURRENCY,
    GENERATE_RAMDOM_COLOR_BASE_ON_TEXT,
    MAKE_FULL_NAME_SHORTEN
} from '@/src/helpers'
import {scale} from 'react-native-size-matters';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation} from '@apollo/client/react';
import {TransactionApolloQueries} from '@/src/apollo/query/transactionQuery';
import {transactionActions} from '@/src/redux/slices/transactionSlice';
import {Ionicons, Entypo, AntDesign} from '@expo/vector-icons';
import {z} from 'zod';
import {TransactionAuthSchema} from '@/src/auth/transactionAuth';
import {useLocalAuthentication} from '@/src/hooks/useLocalAuthentication';
import {accountActions} from '@/src/redux/slices/accountSlice';
import {fetchRecentTransactions} from '@/src/redux/fetchHelper';
import {DispatchType, StateType} from '@/src/redux';
import CircularProgress from 'react-native-circular-progress-indicator';
import {Dimensions} from "react-native";


type Props = {
    title?: string
    goNext?: (_?: number) => void,
    onClose?: () => Promise<void>,
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
        progress: 20,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 1 ? "transparent" : progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen
    },
    {
        title: "Anomalías",
        description: "Comprobando posibles incidencias",
        icon: "security-scan",
        progress: 0,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen
    },
    {
        title: "Moviendo fondos",
        description: "Enviando fondos al destinatario",
        icon: "bank",
        progress: 0,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
    },
    {
        title: "Completed",
        description: "Transaction finished",
        icon: "check",
        progress: 0,
        color: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        activeStrokeColor: (progress: number) => progress <= 100 ? colors.mainGreen : colors.gray,
        inActiveStrokeColor: (progress: number) => progress < 100 ? colors.gray : colors.mainGreen,
        hideDivider: true
    }
]


const SingleSentTransaction: React.FC<Props> = ({
                                                    title = "Ver Detalles", onClose = () => {
    }, showPayButton = false, goNext = (_?: number) => {
    }
                                                }) => {
    const ref = useRef<PagerView>(null);
    const dispatch = useDispatch<DispatchType>()
    const {authenticate} = useLocalAuthentication()
    const {
        transaction,
        recentTransactions,
        transactionDetails,
        receiver
    } = useSelector((state: StateType) => state.transactionReducer)
    const {account, user}: {
        account: any,
        user: any,
        location: z.infer<typeof TransactionAuthSchema.transactionLocation>
    } = useSelector((state: any) => state.accountReducer)

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isCancelLoading, setIsCancelLoading] = useState<boolean>(false)

    const [payRequestTransaction] = useMutation<any>(TransactionApolloQueries.payRequestTransaction());
    const [cancelRequestedTransaction] = useMutation<any>(TransactionApolloQueries.cancelRequestedTransaction());

    const handleShare = async () => {
        const isAvailableAsync = await Sharing.isAvailableAsync()
        if (!isAvailableAsync) return

        await Sharing.shareAsync("https://localhost:8080")
    }

    const formatTransaction = (transaction: any) => {
        const isFromMe = transaction?.from.user?.id === user.id

        const profileImageUrl = isFromMe ? transaction?.to.user?.profileImageUrl : transaction?.from.user?.profileImageUrl
        const fullName = isFromMe ? transaction?.to.user?.fullName : transaction?.from.user?.fullName
        const username = isFromMe ? transaction?.from.user?.username : transaction?.to.user?.username
        const showPayButton = transaction?.transactionType === "request" && !isFromMe && transaction?.status === "pending"
        const amountColor = (transaction?.transactionType === "request" && isFromMe) ? colors.mainGreen : colors.red

        return {
            isFromMe,
            amountColor,
            profileImageUrl: profileImageUrl || "",
            amount: transaction?.amount,
            showPayButton,
            fullName: fullName || "",
            username: username || ""
        }
    }

    const onCancelRequestedTransaction = async () => {
        setIsCancelLoading(true)
        const {data} = await cancelRequestedTransaction({
            variables: {
                transactionId: transaction.transactionId
            }
        })

        dispatch(transactionActions.setRecentTransactions([
            {
                type: "transaction",
                ...data.cancelRequestedTransaction
            },
            ...recentTransactions
        ]))

        dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {...data.cancelRequestedTransaction, ...formatTransaction(data.cancelRequestedTransaction)})))
        setIsCancelLoading(false)
    }

    const onPress = async (paymentApproved: boolean) => {
        if (transaction?.showPayButton) {
            try {
                const authenticated = await authenticate()

                if (authenticated.success) {
                    setIsCancelLoading(!paymentApproved)
                    setIsLoading(paymentApproved)

                    const {data} = await payRequestTransaction({
                        variables: {
                            transactionId: transaction.transactionId,
                            paymentApproved
                        }
                    })

                    dispatch(transactionActions.setTransaction(Object.assign({}, transaction, {...data.payRequestTransaction, ...formatTransaction(data.payRequestTransaction)})))
                    dispatch(accountActions.setAccount(Object.assign({}, account, {balance: Number(account.balance) - Number(transaction?.amount)})))

                    await dispatch(fetchRecentTransactions())

                    setIsLoading(false)
                    setIsCancelLoading(false)
                    goNext(paymentApproved ? 1 : 2)
                }

            } catch (_: any) {
                setIsLoading(false)
                await dispatch(fetchRecentTransactions())
                onClose()
            }

        } else
            ref.current?.setPage(1)
    }

    return (
        <VStack h={"90%"} px={"20px"}>
            <VStack pt={"20px"} alignItems={"center"}>
                <HStack w={"100%"} justifyContent={"space-between"} alignItems={"center"}>
                    <HStack>
                        {receiver?.profileImageUrl ?
                            <Image borderRadius={100} resizeMode='contain' alt='logo-image' w={scale(50)} h={scale(50)}
                                   source={{uri: receiver?.profileImageUrl}}/>
                            :
                            <Avatar borderRadius={100} w={"50px"} h={"50px"}
                                    bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(receiver?.fullName || "")}>
                                <Heading size={"sm"} color={colors.white}>
                                    {EXTRACT_FIRST_LAST_INITIALS(receiver?.fullName || "0")}
                                </Heading>
                            </Avatar>
                        }
                        <VStack ml={"10px"}>
                            <Heading textTransform={"capitalize"} fontSize={scale(20)}
                                     color={"white"}>{MAKE_FULL_NAME_SHORTEN(receiver?.fullName || "")}</Heading>
                            <Text fontSize={scale(15)} color={colors.lightSkyGray}>{receiver?.username}</Text>
                        </VStack>
                    </HStack>
                    <Pressable mb={"20px"} _pressed={{opacity: 0.5}} bg={colors.lightGray} onPress={handleShare} w={"40px"} h={"40px"} borderRadius={100} alignItems={"center"} justifyContent={"center"}>
                        <Entypo name="share" size={20} color={colors.mainGreen}/>
                    </Pressable>
                </HStack>
                <VStack w={"100%"} mt={"30px"} alignItems={"center"}>
                    <Heading textTransform={"capitalize"} fontSize={scale(38)} color={colors.white}>{FORMAT_CURRENCY(transactionDetails?.amount)}</Heading>
                    <Text mb={"10px"} color={colors.lightSkyGray}>{moment(Date.now()).format("lll")}</Text>
                    {transaction.isFromMe ?
                        <VStack w={"100%"} borderWidth={0.5} borderColor={colors.placeholder} mt={5} pt={5} p={5} borderRadius={15}>
                            <Heading mb={5} fontSize={scale(15)} textTransform={"capitalize"} color={"white"}>{"Progreso"}</Heading>
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
                            {transaction.status === "requested" ? <HStack mt={"20px"} w={"100%"} justifyContent={"center"}>
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
                        : null}
                </VStack>
            </VStack>
            {showPayButton ?
                <VStack w={"100%"} borderRadius={15} alignItems={"center"}>
                    <HStack w={"40px"} h={"40px"} bg={colors.lightGray} borderRadius={100} justifyContent={"center"}
                            alignItems={"center"}>
                        <Ionicons name="warning" size={22} color={colors.warning}/>
                    </HStack>
                    <Text textAlign={"center"} w={"85%"} fontSize={scale(15)} color={colors.pureGray}>
                        Responde solo a solicitudes de pago que conozcas con certeza para garantizar tu seguridad.
                    </Text>
                    <HStack w={"100%"} mt={"20px"} justifyContent={showPayButton ? "space-between" : "center"}>
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
                            disabled={isCancelLoading}
                            opacity={isCancelLoading ? 0.5 : 1}
                            onPress={() => onPress(true)}
                            spin={isLoading}
                            w={showPayButton ? "49%" : "80%"}
                            bg={colors.mainGreen}
                            color={colors.white}
                            title={title}
                        />
                    </HStack>
                </VStack>
                :
                <HStack mt={"20px"} w={"100%"} justifyContent={"center"}>
                    <Button
                        onPress={onCancelRequestedTransaction}
                        spin={isCancelLoading}
                        w={"49%"}
                        bg={colors.lightGray}
                        color={colors.red}
                        title={"Cancelar"}
                    />
                </HStack>
            }
        </VStack>
    )
}

export default SingleSentTransaction
