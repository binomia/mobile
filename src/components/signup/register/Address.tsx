import React, { useContext, useEffect, useState } from 'react';
import { VStack, Heading, Text, HStack, TextArea } from 'native-base';
import { StyleSheet, Keyboard,  TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import colors from '@/src/colors';
import { TEXT_HEADING_FONT_SIZE, TEXT_PARAGRAPH_FONT_SIZE, TEXTAREA_HEIGHT } from '@/src/constants';
import Button from '@/src/components/global/Button';
import { GlobalContextType } from '@/src/types';
import { GlobalContext } from '@/src/contexts/globalContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { registerActions } from '@/src/redux/slices/registerSlice';
import { useDispatch } from 'react-redux';
import { DispatchType } from '@/src/redux';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    nextPage: () => void
    prevPage: () => void
}


const Address: React.FC<Props> = ({ nextPage, prevPage }: Props): React.JSX.Element => {
    const dispatch = useDispatch<DispatchType>()
    const [disabledButton, setDisabledButton] = useState<boolean>(true);
    const { } = useContext<GlobalContextType>(GlobalContext);
    const [loading, setLoading] = useState<boolean>(false)

    const [address, setAddress] = useState<string>("");
    const [addressAgreement, setAddressAgreement] = useState<boolean>(false);


    const onChange = (value: string = "", type: string = "") => {
        if (type === "address") {
            setAddress(value)
            dispatch(registerActions.setAddress(value))

        } else {
            const agreement = addressAgreement
            setAddressAgreement(!agreement)
            dispatch(registerActions.setUserAgreement(!agreement))
        }
    }


    useEffect(() => {
        setDisabledButton(true)

        if (address && addressAgreement) {
            setDisabledButton(false)
        }

    }, [address, addressAgreement])




    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <SafeAreaView style={{ backgroundColor: colors.darkGray }}>
                <VStack mt={"10%"} h={"96%"} w={"100%"} justifyContent={"space-between"}>
                    <VStack>
                        <VStack px={"20px"} w={"100%"} alignItems={"flex-start"}>
                            <Heading fontSize={`${TEXT_HEADING_FONT_SIZE}px`} color={"white"}>Dirección</Heading>
                            <Text fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"80%"} color={"white"}>
                                Ingrese su dirección de residencia para completar el procesamiento de su cuenta.
                            </Text>
                        </VStack>
                        <VStack w={"100%"} px={"20px"} mt={"30px"} alignItems={"center"} >
                            <TextArea
                                borderWidth={0}
                                borderColor={"white"}
                                borderRadius={"10px"}
                                bg={"lightGray"}
                                _focus={{ bg: "lightGray", selectionColor: "white" }}
                                value={address}
                                fontSize={"16px"}
                                onChangeText={(value) => onChange(value, "address")}
                                h={`${TEXTAREA_HEIGHT}px`}
                                color={"white"}
                                onTextInput={() => {}}
                                tvParallaxProperties={undefined}
                                autoCompleteType={"street-address"}
                                placeholder='Ingresa tu dirección'
                                style={addressAgreement && address.length > 0 ? styles.InputsSucess : address.length > 0 && !addressAgreement ? styles.InputsFail : {}}
                            />
                        </VStack>
                        <HStack alignSelf={"flex-end"} w={"100%"} mt={"40px"} px={"25px"}>
                            <TouchableOpacity onPress={() => onChange()}>
                                <MaterialIcons style={{ marginTop: 3 }} name={addressAgreement ? "check-box" : "check-box-outline-blank"} size={28} color={colors.mainGreen} />
                            </TouchableOpacity>
                            <Text mx={"5px"} fontSize={`${TEXT_PARAGRAPH_FONT_SIZE}px`} w={"90%"} color={"white"}>
                                Certifico que la dirección proporcionada es la correcta y corresponde a mi residencia actual.
                            </Text>
                        </HStack>
                    </VStack>
                    <HStack w={"100%"} mb={"40px"} px={"20px"} justifyContent={"space-between"}>
                        <Button
                            w={"49%"}
                            bg={"lightGray"}
                            color={"mainGreen"}
                            mb="10px"
                            onPress={prevPage}
                            title={"Atras"}
                        />
                        <Button
                            spin={loading}
                            w={"49%"}
                            disabled={disabledButton}
                            bg={disabledButton ? "lightGray" : "mainGreen"}
                            color={disabledButton ? 'placeholderTextColor' : "white"}
                            mb="10px"
                            onPress={async () => {
                                setLoading(true)
                                nextPage()
                                setLoading(false)
                            }}
                            title={"Siguiente"}
                        />
                    </HStack>
                </VStack>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}


export default Address

const styles = StyleSheet.create({
    InputsSucess: {
        borderColor: colors.mainGreen,
        borderWidth: 1,
        borderRadius: 10,
    },
    InputsFail: {
        borderColor: colors.alert,
        borderWidth: 1,
        borderRadius: 10,
    }
});