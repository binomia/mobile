import React from 'react'
import { Text, StyledProps, Pressable, Spinner, HStack } from 'native-base';
import { INPUT_HEIGHT } from '@/src/constants';

interface Props extends StyledProps {
    title: string
    leftRender?: React.JSX.Element
    color?: string
    fontSize?: string
    disabled?: boolean

    spin?: boolean
    onPress?: () => void
}

const Button: React.FC<Props> = (props): React.JSX.Element => {
    const { leftRender, fontSize = "16px", h = `${INPUT_HEIGHT}px`, borderRadius = "25px", spin = false, color = "white", title, onPress = () => { }, disabled = false } = props

    return (
        <Pressable _pressed={{ opacity: 0.5 }} {...props} borderRadius={borderRadius} alignItems={"center"} justifyContent={"center"} h={h} disabled={disabled} onPress={onPress}>
            {spin ?
                <Spinner color={color} />
                :
                <HStack space={2} w={"100%"} justifyContent={"center"} alignItems={"center"}>
                    {leftRender}
                    <Text fontWeight={"bold"} fontSize={fontSize} textAlign={"center"} color={color}>{title}</Text>
                </HStack>
            }
        </Pressable>
    )
}


export default Button