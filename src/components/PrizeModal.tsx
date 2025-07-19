import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'

interface Prize {
  id: number
  name: string
  icon: string
  color: string
  cost: number
}

interface PrizeModalProps {
  prize: Prize
  onClose: () => void
  strings: any
}

export const PrizeModal: React.FC<PrizeModalProps> = ({ prize, onClose, strings }) => {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  // Don't show confetti for "Miss" prize
  const showConfetti = prize.name !== 'Miss'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-yellow-300"
      >
        {/* Prize Icon */}
        <div className="text-8xl mb-4">
          {prize.icon}
        </div>
        
        {/* Congratulations Text */}
        <h2 className="text-3xl font-bold text-black mb-2">
          {prize.name === 'Miss' ? '😔' : strings.congratulations}
        </h2>
        
        {/* Prize Name */}
        <h3 className="text-2xl font-bold text-black mb-6">
          {prize.name === 'Miss' 
            ? strings.prizes[prize.name] || prize.name
            : `${strings.youWon}: ${strings.prizes[prize.name] || prize.name}`
          }
        </h3>
        
        {/* Prize Cost (for reference) */}
        {prize.cost > 0 && (
          <div className="text-lg text-black/70 mb-6">
            Valore: €{prize.cost}
          </div>
        )}
        
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="bg-black text-yellow-400 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {strings.close}
        </motion.button>
      </motion.div>
    </div>
  )
}