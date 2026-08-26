"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stage, useGLTF } from "@react-three/drei"
import { useReducedMotion } from "framer-motion"

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function ViewerFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
    </div>
  )
}

export function Product3DViewer({ modelUrl }: { modelUrl: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.2], fov: 40 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6} shadows={false}>
          <Model url={modelUrl} />
        </Stage>
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={1.2}
        maxDistance={3.5}
        autoRotate={!shouldReduceMotion}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  )
}

export { ViewerFallback }
