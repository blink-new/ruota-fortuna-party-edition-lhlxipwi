import React from 'react'
import { motion } from 'framer-motion'

interface SpinButtonProps {
  onClick: () => void
  disabled: boolean
  isSpinning: boolean
  strings: any
}

export const SpinButton: React.FC<SpinButtonProps> = ({ 
  onClick, 
  disabled, 
  isSpinning, 
  strings 
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isSpinning}
      className={`px-8 py-4 text-xl font-bold rounded-full border-4 transition-all duration-200 ${
        disabled || isSpinning
          ? 'bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed'
          : 'bg-yellow-400 border-yellow-600 text-black hover:bg-yellow-500 hover:scale-105 active:scale-95 shadow-lg'
      }`}
      whileTap={{ scale: disabled || isSpinning ? 1 : 0.95 }}
      whileHover={{ scale: disabled || isSpinning ? 1 : 1.05 }}
    >
      {isSpinning ? strings.spinning : strings.spinButton}
    </motion.button>
  )
}