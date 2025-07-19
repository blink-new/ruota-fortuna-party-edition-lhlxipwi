import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Prize } from '../App'
import translations from '../data/translations.json'

interface WheelProps {
  prizes: Prize[]
  onSpin: (prizeId: number) => void
  disabled: boolean
  language: 'it' | 'en'
}

export function Wheel({ prizes, onSpin, disabled, language }: WheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  const t = translations[language]

  const handleSpin = () => {
    if (disabled || isSpinning) return

    setIsSpinning(true)

    // Calculate weighted random selection
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    let random = Math.random() * totalWeight
    let selectedPrize = prizes[0]

    for (const prize of prizes) {
      random -= prize.weight
      if (random <= 0) {
        selectedPrize = prize
        break
      }
    }

    // Calculate rotation
    const segmentAngle = 360 / prizes.length
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id)
    const targetAngle = prizeIndex * segmentAngle
    const spins = 5 + Math.random() * 3 // 5-8 full rotations
    const finalRotation = rotation + (spins * 360) + (360 - targetAngle)

    setRotation(finalRotation)

    // Complete spin after animation
    setTimeout(() => {
      setIsSpinning(false)
      onSpin(selectedPrize.id)
    }, 3000)
  }

  const segmentAngle = 360 / prizes.length

  return (
    <div className="relative flex flex-col items-center">
      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <motion.div
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden"
          animate={{ rotate: rotation }}
          transition={{ 
            duration: isSpinning ? 3 : 0,
            ease: isSpinning ? "easeOut" : "linear"
          }}
        >
          {prizes.map((prize, index) => {
            const startAngle = index * segmentAngle
            const endAngle = (index + 1) * segmentAngle
            const midAngle = (startAngle + endAngle) / 2
            
            return (
              <div
                key={prize.id}
                className="absolute inset-0"
                style={{
                  clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`,
                  backgroundColor: prize.color,
                }}
              >
                {/* Prize content */}
                <div 
                  className="absolute text-center text-white font-bold"
                  style={{
                    top: '20%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
                    transformOrigin: '50% 200%'
                  }}
                >
                  <div className="text-2xl mb-1">{prize.icon}</div>
                  <div className="text-xs px-1 leading-tight">
                    {prize.name.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 rounded-full border-4 border-yellow-400 flex items-center justify-center">
            <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Spin button */}
      <Button
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-orbitron font-bold text-xl px-12 py-6 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSpinning ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            {language === 'it' ? 'GIRANDO...' : 'SPINNING...'}
          </div>
        ) : (
          t.spin
        )}
      </Button>

      {disabled && !isSpinning && (
        <p className="mt-4 text-slate-300 text-center">
          {language === 'it' ? 'Hai già girato oggi!' : 'You have already spun today!'}
        </p>
      )}
    </div>
  )
}