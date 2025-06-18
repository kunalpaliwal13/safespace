// src/components/VantaBackground.jsx
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import FOG from "vanta/dist/vanta.fog.min"

const VantaBackground = () => {
  const vantaRef = useRef(null)
  const [vantaEffect, setVantaEffect] = useState(null)

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0xffa8e8,      // Soft pink glow
        midtoneColor: 0xcd64ff,        // Lavender tone
        lowlightColor: 0xd487ff,       // Deep bluish purple
        baseColor: 0xfcdfdf,           // Very dark base for calmness
        blurFactor: 0.6,
        shininess: 80,                 // Glow effect
        waveHeight: 20,
        waveSpeed: 1.2,
        zoom: 1.2,
        })
      )
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return <div ref={vantaRef} className="w-full h-screen" />
}

export default VantaBackground
