import React from 'react'
import colors from '@/src/colors'
import { Image, VStack, HStack, Switch, Heading } from 'native-base'
import { useDispatch, useSelector } from 'react-redux'
import { scale } from 'react-native-size-matters'
import { useMutation } from '@apollo/client/react'
import { AccountApolloQueries } from '@/src/apollo/query'
import { privacyScreenData } from '@/src/mocks'
import { accountActions } from '@/src/redux/slices/accountSlice'
import { allIcon } from '@/src/assets'
import { DispatchType, StateType } from '@/src/redux'
import { FlatList } from 'react-native'

const PrivacyScreen: React.FC = () => {
    const dispatch = useDispatch<DispatchType>()
    const { account } = useSelector((state: StateType) => state.accountReducer)
    const [updateAccountPermissions] = useMutation<any>(AccountApolloQueries.updateAccountPermissions())

    const { allowSend, allowReceive, allowWithdraw, allowDeposit, allowRequestMe } = account
    const [allPrivacy, setAllPrivacy] = React.useState<{ id: string, allow: boolean, icon: any }>({
        id: "all",
        allow: !!(allowSend && allowReceive && allowWithdraw && allowDeposit && allowRequestMe),
        icon: allIcon
    })

    const onSwitchChange = async (id: string, allow: boolean) => {
        try {
            if (id === "all") {
                const { data } = await updateAccountPermissions({
                    variables: {
                        data: {
                            "allowSend": allow,
                            "allowReceive": allow,
                            "allowWithdraw": allow,
                            "allowDeposit": allow,
                            "allowRequestMe": allow,
                        }
                    }
                })
                dispatch(accountActions.setAccount(data.updateAccountPermissions))
                setAllPrivacy(Object.assign({}, allPrivacy, { allow }))

            } else {
                const { data } = await updateAccountPermissions({
                    variables: {
                        data: {
                            [id]: allow
                        }
                    }
                })

                dispatch(accountActions.setAccount(data.updateAccountPermissions))
                const { allowSend, allowReceive, allowWithdraw, allowDeposit, allowRequestMe } = data.updateAccountPermissions
                setAllPrivacy(Object.assign({}, allPrivacy, {
                    allow: !!(allowSend && allowReceive && allowWithdraw && allowDeposit && allowRequestMe)
                }))

            }

        } catch (error) {
            console.error(error);
        }
    }


    return (
        <VStack px={"20px"} variant={"body"} justifyContent={"space-between"} h={"100%"}>
            <VStack borderRadius={10} w={"100%"} pb={"5px"} mt={"50px"}>
                <HStack justifyContent={"space-between"} w={"100%"} mb={"30px"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                    <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                        <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={allPrivacy.icon} />
                        <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>Todas</Heading>
                    </HStack>
                    <Switch disabled={account.status !== "active"} isChecked={allPrivacy.allow} onChange={() => onSwitchChange(allPrivacy.id, !allPrivacy.allow)} mr={"10px"} />
                </HStack>
                <FlatList
                    data={privacyScreenData(account)}
                    scrollEnabled={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: permit, index }) => (
                        <HStack justifyContent={"space-between"} key={`privacies-${index}-${permit.id}${permit.name}`} w={"100%"} borderRadius={10} h={scale(45)} py={"10px"} space={2} >
                            <HStack h={scale(35)} justifyContent={"center"} alignItems={"center"}>
                                <Image alt='logo-image' borderRadius={2000} resizeMode='contain' w={scale(35)} h={scale(35)} source={permit.icon} />
                                <Heading ml={"10px"} borderRadius={"100px"} fontSize={scale(15)} textTransform={"capitalize"} color={colors.white}>{permit.name}</Heading>
                            </HStack>
                            <Switch disabled={account.status !== "active"} isChecked={permit.allow && account.status === "active"} onChange={() => onSwitchChange(permit.id, !permit.allow)} mr={"10px"} />
                        </HStack>
                    )} />
            </VStack>
        </VStack>
    )
}

export default PrivacyScreen