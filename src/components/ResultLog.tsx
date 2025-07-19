import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SpinResult {
  id: string
  prize: {
    id: number
    name: string
    icon: string
    color: string
  }
  timestamp: number
}

interface ResultLogProps {
  results: SpinResult[]
  strings: any
}

export const ResultLog: React.FC<ResultLogProps> = ({ results, strings }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30">
      <h3 className="text-yellow-400 font-bold text-lg mb-4 text-center">
        {strings.recentResults}
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {results.length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              {strings.noResults}
            </div>
          ) : (
            results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 bg-white/10 rounded-lg p-3 border border-white/20"
              >
                {/* Mini Icon */}
                <div className="text-2xl flex-shrink-0">
                  {result.prize.icon}
                </div>
                
                {/* Prize Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">
                    {strings.prizes[result.prize.name] || result.prize.name}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {formatTime(result.timestamp)}
                  </div>
                </div>
                
                {/* Prize Color Indicator */}
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: result.prize.color }}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}