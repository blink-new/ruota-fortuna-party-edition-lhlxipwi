import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PRIZES } from '../utils/probabilityEngine'

interface WheelProps {
  onSpin: (prizeIndex: number) => void
  disabled: boolean
  isSpinning: boolean
  winningSegment: number | null
  strings: any
  selectedPrize?: any
}

export const Wheel: React.FC<WheelProps> = ({ 
  onSpin, 
  disabled, 
  isSpinning, 
  winningSegment,
  strings,
  selectedPrize
}) => {
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  
  // Calculate segment angle (360° / 8 segments = 45°)
  const segmentAngle = 360 / PRIZES.length
  
  // Animate wheel when a prize is selected
  useEffect(() => {
    if (selectedPrize && isSpinning) {
      // Calculate target angle to align winning segment with pointer (12 o'clock)
      // We want the CENTER of the winning segment to align with the pointer
      const segmentCenter = selectedPrize.id * segmentAngle + (segmentAngle / 2)
      const targetAngle = 360 - segmentCenter // Reverse because wheel spins clockwise
      
      // Add multiple full rotations for dramatic effect (3-5 full spins)
      const fullRotations = 3 + Math.random() * 2
      const finalRotation = rotation + (fullRotations * 360) + targetAngle
      
      setRotation(finalRotation)
    }
  }, [selectedPrize, isSpinning, rotation, segmentAngle])
  
  const handleSpin = () => {
    if (disabled || isSpinning) return
    
    // Call onSpin to trigger prize selection
    onSpin(0) // The actual prize will be determined by the probability engine
  }
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel Container */}
      <div className="relative w-96 h-96 md:w-[500px] md:h-[500px]">
        {/* Fixed Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg" />
        </div>
        
        {/* Spinning Wheel */}
        <motion.div
          ref={wheelRef}
          className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-yellow-400"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: 3, 
            ease: [0.25, 0.46, 0.45, 0.94] // Custom ease-out with slight bounce
          }}
        >
          {PRIZES.map((prize, index) => {
            const startAngle = index * segmentAngle
            const isWinning = winningSegment === index
            
            return (
              <div
                key={prize.id}
                className={`absolute w-full h-full ${
                  isWinning ? 'animate-pulse' : ''
                }`}
                style={{
                  transform: `rotate(${startAngle}deg)`,
                  transformOrigin: 'center'
                }}
              >
                {/* Segment Background */}
                <div 
                  className="absolute w-full h-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${prize.color} 0deg, ${prize.color} ${segmentAngle}deg, transparent ${segmentAngle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                  }}
                />
                
                {/* Prize Content */}
                <div 
                  className="absolute flex flex-col items-center justify-center text-white font-bold"
                  style={{
                    top: '15%',
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    width: '80px',
                    height: '120px'
                  }}
                >
                  {/* Prize Icon */}
                  <div className="text-4xl md:text-5xl mb-2 drop-shadow-lg">
                    {prize.icon}
                  </div>
                  
                  {/* Prize Name */}
                  <div className="text-xs md:text-sm text-center leading-tight drop-shadow-lg font-bold">
                    {strings.prizes[prize.name] || prize.name}
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-600 rounded-full" />
          </div>
        </motion.div>
      </div>
      
      {/* Spin Button */}
      <motion.button
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        className={`mt-8 px-8 py-4 text-xl font-bold rounded-full border-4 transition-all duration-200 ${
          disabled || isSpinning
            ? 'bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed'
            : 'bg-yellow-400 border-yellow-600 text-black hover:bg-yellow-500 hover:scale-105 active:scale-95 shadow-lg'
        }`}
        whileTap={{ scale: disabled || isSpinning ? 1 : 0.95 }}
      >
        {isSpinning ? strings.spinning : strings.spinButton}
      </motion.button>
    </div>
  )
}