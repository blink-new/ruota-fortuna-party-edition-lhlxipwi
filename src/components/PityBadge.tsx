import React from 'react'
import { motion } from 'framer-motion'

interface PityBadgeProps {
  isActive: boolean
  strings: any
}

export const PityBadge: React.FC<PityBadgeProps> = ({ isActive, strings }) => {
  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg border-2 border-red-400 animate-pulse">
        🔥 {strings.rareBooster}
      </div>
    </motion.div>
  )
}