import * as React from "react"
import {
    Canvas,
    useLoader,
    useFrame,
    useThree,
} from "https://esm.sh/@react-three/fiber@8.13.0?external=react,react-dom&deps=three@0.150.1"
import { GLTFLoader } from "https://esm.sh/three-stdlib@2.30.4?deps=three@0.150.1"
import { addPropertyControls, ControlType } from "framer"
import * as THREE from "https://esm.sh/three@0.150.1"

function Model(props) {
    const {
        modelUrl,
        scale,
        rotateSpeed,
        floatStrength,
        roughness,
        metalness,
        shadowOpacity,
        pointerTilt,
        enableUserRotate,
        dragSensitivity,
    } = props

    const gltf = useLoader(GLTFLoader, modelUrl)

    const animatedGroup = React.useRef<any>()
    const pivot = React.useRef<any>()
    const bounds = React.useRef({
        size: 1,
        center: new THREE.Vector3(),
        minY: 0,
    })

    const dragState = React.useRef({
        dragging: false,
        pointerId: -1,
        lastX: 0,
        lastY: 0,
    })
    const manualRotation = React.useRef({ x: 0, y: 0 })
    const autoRotationY = React.useRef(0)

    const { camera } = useThree()
    const clock = React.useRef(0)

    React.useLayoutEffect(() => {
        if (!gltf.scene || !pivot.current) return

        gltf.scene.traverse((obj) => {
            if (obj.isMesh && obj.material) {
                obj.castShadow = true
                obj.receiveShadow = true

                if ("roughness" in obj.material) obj.material.roughness = roughness
                if ("metalness" in obj.material) obj.material.metalness = metalness

                obj.material.envMapIntensity = 1
            }
        })

        const box = new THREE.Box3().setFromObject(gltf.scene)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        bounds.current.size = size.length()
        bounds.current.center.copy(center)
        bounds.current.minY = box.min.y

        pivot.current.position.set(-center.x, -center.y, -center.z)

        const fov = (camera.fov * Math.PI) / 180
        const distance = bounds.current.size / (2 * Math.tan(fov / 2))

        camera.position.set(0, bounds.current.size * 0.15, distance * 1.15)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
    }, [gltf, roughness, metalness, camera])

    const onPointerDown = React.useCallback(
        (event) => {
            if (!enableUserRotate) return
            event.stopPropagation()
            dragState.current.dragging = true
            dragState.current.pointerId = event.pointerId
            dragState.current.lastX = event.clientX
            dragState.current.lastY = event.clientY
            event.target.setPointerCapture(event.pointerId)
        },
        [enableUserRotate]
    )

    const onPointerMove = React.useCallback(
        (event) => {
            if (!enableUserRotate || !dragState.current.dragging) return
            if (event.pointerId !== dragState.current.pointerId) return

            const dx = event.clientX - dragState.current.lastX
            const dy = event.clientY - dragState.current.lastY

            dragState.current.lastX = event.clientX
            dragState.current.lastY = event.clientY

            manualRotation.current.x += dx * dragSensitivity
            manualRotation.current.y += dy * dragSensitivity
            manualRotation.current.y = THREE.MathUtils.clamp(
                manualRotation.current.y,
                -Math.PI / 3,
                Math.PI / 3
            )
        },
        [dragSensitivity, enableUserRotate]
    )

    const endDrag = React.useCallback((event) => {
        if (event.pointerId !== dragState.current.pointerId) return
        dragState.current.dragging = false
        dragState.current.pointerId = -1
        event.target.releasePointerCapture(event.pointerId)
    }, [])

    useFrame((state, delta) => {
        if (!animatedGroup.current) return

        clock.current += delta
        autoRotationY.current += delta * rotateSpeed

        const pointerPitch = pointerTilt ? state.pointer.y * 0.25 : 0
        const pointerRoll = pointerTilt ? state.pointer.x * 0.25 : 0

        const targetX = manualRotation.current.y + pointerPitch
        const targetY = manualRotation.current.x + autoRotationY.current

        animatedGroup.current.rotation.x = THREE.MathUtils.lerp(
            animatedGroup.current.rotation.x,
            targetX,
            0.08
        )
        animatedGroup.current.rotation.y = THREE.MathUtils.lerp(
            animatedGroup.current.rotation.y,
            targetY,
            0.1
        )
        animatedGroup.current.rotation.z = THREE.MathUtils.lerp(
            animatedGroup.current.rotation.z,
            pointerRoll,
            0.08
        )

        animatedGroup.current.position.y =
            Math.sin(clock.current * 1.2) * floatStrength
    })

    return (
        <group
            ref={animatedGroup}
            scale={scale}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerOut={endDrag}
        >
            <group ref={pivot}>
                <primitive object={gltf.scene} />
            </group>

            {shadowOpacity > 0 && (
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, bounds.current.minY - 0.01, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[30, 30]} />
                    <shadowMaterial opacity={shadowOpacity} transparent />
                </mesh>
            )}
        </group>
    )
}

export default function GithubPro(props) {
    const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 768px)").matches

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas
                shadows={!isMobile}
                dpr={[1, Math.min(props.maxDpr, isMobile ? 1.5 : 2)]}
                camera={{ fov: 45, position: [0, 0, 10] }}
                gl={{
                    antialias: true,
                    alpha: true,
                    outputColorSpace: THREE.SRGBColorSpace,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: props.exposure,
                }}
            >
                <ambientLight intensity={props.ambientIntensity} />

                <directionalLight
                    castShadow={!isMobile}
                    position={[props.lightX, props.lightY, props.lightZ]}
                    intensity={props.lightIntensity}
                    shadow-mapSize={[1024, 1024]}
                    shadow-bias={-0.0001}
                />

                <directionalLight
                    position={[-5, 0, -5]}
                    intensity={props.lightIntensity * 0.35}
                    color="#b8c7e0"
                />

                <Model {...props} />
            </Canvas>
        </div>
    )
}

addPropertyControls(GithubPro, {
    modelUrl: {
        type: ControlType.String,
        title: "Model URL",
        defaultValue:
            "https://pub-01ef830121ca4c5393dbfaf04620de9b.r2.dev/models/bouncingcube.glb",
    },
    scale: {
        type: ControlType.Number,
        title: "Scale",
        defaultValue: 1.3,
        min: 0.1,
        max: 5,
        step: 0.1,
    },
    shadowOpacity: {
        type: ControlType.Number,
        title: "Shadow",
        defaultValue: 0.3,
        min: 0,
        max: 1,
        step: 0.05,
    },
    rotateSpeed: {
        type: ControlType.Number,
        title: "Rotate",
        defaultValue: 0.35,
        min: 0,
        max: 2,
        step: 0.05,
    },
    floatStrength: {
        type: ControlType.Number,
        title: "Float",
        defaultValue: 0.18,
        min: 0,
        max: 1,
        step: 0.01,
    },
    roughness: {
        type: ControlType.Number,
        title: "Roughness",
        defaultValue: 0.25,
        min: 0,
        max: 1,
        step: 0.05,
    },
    metalness: {
        type: ControlType.Number,
        title: "Metalness",
        defaultValue: 0.75,
        min: 0,
        max: 1,
        step: 0.05,
    },
    ambientIntensity: {
        type: ControlType.Number,
        title: "Ambient",
        defaultValue: 0.5,
        min: 0,
        max: 2,
        step: 0.05,
    },
    lightIntensity: {
        type: ControlType.Number,
        title: "Key Light",
        defaultValue: 1.5,
        min: 0,
        max: 3,
        step: 0.05,
    },
    lightX: { type: ControlType.Number, defaultValue: 5 },
    lightY: { type: ControlType.Number, defaultValue: 10 },
    lightZ: { type: ControlType.Number, defaultValue: 5 },
    exposure: {
        type: ControlType.Number,
        title: "Exposure",
        defaultValue: 1.05,
        min: 0.6,
        max: 2,
        step: 0.05,
    },
    maxDpr: {
        type: ControlType.Number,
        title: "Max DPR",
        defaultValue: 2,
        min: 1,
        max: 3,
        step: 0.5,
    },
    pointerTilt: {
        type: ControlType.Boolean,
        title: "Pointer Tilt",
        defaultValue: true,
    },
    enableUserRotate: {
        type: ControlType.Boolean,
        title: "Drag Rotate",
        defaultValue: true,
    },
    dragSensitivity: {
        type: ControlType.Number,
        title: "Drag Sense",
        defaultValue: 0.01,
        min: 0.001,
        max: 0.03,
        step: 0.001,
    },
})
