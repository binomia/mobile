import React from 'react'
import splash from '../assets/img/splash.png'
import { Image, ZStack, Spinner } from 'native-base'
const Splash = () => {
  return (
    <ZStack flex={1} justifyContent={"flex-end"} alignItems={"center"}>
      <Image alt='splash-image' source={splash} w={"100%"} h={"100%"} />
      <Spinner mb={70} size={"lg"}/>
    </ZStack>
  )
}

export default Splash
