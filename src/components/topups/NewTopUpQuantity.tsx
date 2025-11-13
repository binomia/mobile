import React, {useEffect, useState} from 'react'
import KeyNumberPad from '../global/KeyNumberPad'
import Button from '../global/Button';
import colors from '@/src/colors';
import {Heading, HStack, VStack, Image, Text, Pressable, Avatar} from 'native-base'
import {MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from 'react-redux';
import {EXTRACT_FIRST_LAST_INITIALS, FORMAT_CURRENCY, FORMAT_PHONE_NUMBER, GENERATE_RAMDOM_COLOR_BASE_ON_TEXT} from '@/src/helpers';
import {scale} from 'react-native-size-matters';
import {topupActions} from '@/src/redux/slices/topupSlice';
import {DispatchType} from '@/src/redux';


type Props = {
    next: () => void
    back: () => void
}

const NewTopUpQuantity: React.FC<Props> = ({next, back}: Props) => {
    const dispatch = useDispatch<DispatchType>();
    const {newTopUp} = useSelector((state: any) => state.topupReducer)
    const {account} = useSelector((state: any) => state.accountReducer)

    const [showPayButton, setShowPayButton] = useState<boolean>(false);
    const [input, setInput] = useState<string>("0");

    const onNextPage = async () => {
        try {
            dispatch(topupActions.setNewTopUp({
                ...newTopUp,
                amount: Number(input)
            }))

            next()

        } catch (error) {
            console.log(error);
        }
    }

    const onChange = (value: string) => {
        if (Number(value) >= 20 && Number(value) <= account.balance)
            setShowPayButton(true)
        else
            setShowPayButton(false)

        setInput(value)
    }

    useEffect(() => {
        console.log(newTopUp.company?.logo)
    }, []);

    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack>
                <HStack w={"100%"} mt={"10px"} alignItems={"center"} justifyContent={"space-between"}>
                    <Pressable _pressed={{opacity: 0.5}} onPress={() => back()} right={"7px"}>
                        <MaterialIcons name="arrow-back-ios" size={30} color={colors.white}/>
                    </Pressable>
                    <Heading size={"md"} color={colors.mainGreen} textAlign={"center"}>{FORMAT_CURRENCY(account.balance)}</Heading>
                    <HStack w={"35px"}/>
                </HStack>
                <HStack w={"100%"} h={"100px"} justifyContent={"space-between"} alignItems={"center"}>

                    <HStack alignItems={"center"}>
                        {newTopUp.company?.logo ?
                            <Image w={"50px"} h={"50px"} alt='logo-selectedCompany-image' borderRadius={100} resizeMode='contain' source={{uri: newTopUp.company?.logo}}/>
                            :
                            <Avatar borderRadius={100} w={"50px"} h={"50px"} bg={GENERATE_RAMDOM_COLOR_BASE_ON_TEXT(newTopUp?.fullName || "")}>
                                <Heading size={"sm"} color={colors.white}>
                                    {EXTRACT_FIRST_LAST_INITIALS(newTopUp?.fullName || "0")}
                                </Heading>
                            </Avatar>
                        }
                        <VStack>
                            <Heading textTransform={"capitalize"} px={"10px"} fontSize={18} color={colors.white}>{newTopUp?.fullName || ""}</Heading>
                            <Text px={"10px"} fontSize={18} color={colors.white}>{FORMAT_PHONE_NUMBER(newTopUp?.phone || "")}</Text>
                        </VStack>
                    </HStack>
                    <Button
                        opacity={showPayButton ? 1 : 0.5}
                        fontSize={scale(12) + "px"}
                        disabled={!showPayButton}
                        onPress={onNextPage}
                        h={"45px"}
                        w={"120px"}
                        title={"Siguiente"}
                        bg={showPayButton ? "mainGreen" : "lightGray"}
                        borderRadius={100}
                        color={showPayButton ? colors.white : colors.mainGreen}
                    />
                </HStack>

            </VStack>
            <KeyNumberPad onChange={(value: string) => onChange(value)}/>
        </VStack>
    )
}

export default NewTopUpQuantity