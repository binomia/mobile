import React, { useRef } from 'react'
import { Dimensions } from 'react-native'
import { Camera, DrawableFrame, useCameraDevice, useSkiaFrameProcessor } from 'react-native-vision-camera'
import { Face, FaceDetectionOptions, useFaceDetector } from 'react-native-vision-camera-face-detector'
import { ZStack } from 'native-base'
import { Worklets } from 'react-native-worklets-core'
import { PaintStyle, Skia } from '@shopify/react-native-skia'
import { qrIcon } from '@/src/assets'


const { width, height } = Dimensions.get('screen')
const CameraFaceMask: React.FC = () => {
    const ref = useRef<Camera>(null);

    const device = useCameraDevice("front");
    const faceDetectionOptions = useRef<FaceDetectionOptions>({}).current
    const { detectFaces } = useFaceDetector(faceDetectionOptions)

    const handleDetectedFaces = Worklets.createRunOnJS(async (faces: Face[]) => {
        if (faces.length > 0) {
            const face = faces[0]
            console.log("Detected faces: ", face.bounds);
        }
    });



    const frameProcessor = useSkiaFrameProcessor((frame: DrawableFrame) => {
        'worklet'
        frame.render()

        const faces = detectFaces(frame)
        if (faces.length > 0) {
            const face = faces[0];
            const { x, y, width, height } = face.bounds;



            // Build a circle path with Skia
            const paint = Skia.Image.MakeImageFromNativeBuffer(qrIcon);

            // Instead of frame.draw..., return overlay instructions
            frame.drawImage(paint, x, y);
        }

        handleDetectedFaces(faces)
    }, [])

    return (device &&
        <ZStack flex={1}>
            <Camera
                preview={true}
                ref={ref}
                photo={true}
                video={true}
                style={{ width: width, height: height }}
                device={device}
                frameProcessor={frameProcessor}
                pixelFormat="rgb"
                isActive
            />
        </ZStack>
    )
}

export default CameraFaceMask
