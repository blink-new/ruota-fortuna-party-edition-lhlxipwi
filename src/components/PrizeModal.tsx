import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { Prize } from '../App'
import translations from '../data/translations.json'

interface PrizeModalProps {
  prize: Prize
  onClose: () => void
  language: 'it' | 'en'
}

export function PrizeModal({ prize, onClose, language }: PrizeModalProps) {
  const t = translations[language]

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 8000) // Auto close after 8 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Confetti */}
        {prize.id <= 3 && ( // Only for rare prizes
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-yellow-400 shadow-2xl"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Content */}
          <div className="text-center">
            {/* Congratulations */}
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-orbitron font-bold text-yellow-400 mb-4"
            >
              {t.congratulations}
            </motion.h2>

            {/* Prize icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
              className="text-8xl mb-4"
            >
              {prize.icon}
            </motion.div>

            {/* Prize name */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {prize.name}
              </h3>
              
              {/* Prize rarity indicator */}
              {prize.id <= 3 && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-sm font-bold">
                  ⭐ {language === 'it' ? 'PREMIO RARO!' : 'RARE PRIZE!'}
                </div>
              )}
            </motion.div>

            {/* Prize description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-300 mb-6"
            >
              {language === 'it' 
                ? 'Mostra questo messaggio al bar per ritirare il tuo premio!'
                : 'Show this message at the bar to claim your prize!'
              }
            </motion.p>

            {/* Close button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={onClose}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3"
              >
                {t.close}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}