import React, { useState, useEffect } from 'react'
import { Wheel } from './components/Wheel'
import { ResultLog } from './components/ResultLog'
import { PityBadge } from './components/PityBadge'
import { PrizeModal } from './components/PrizeModal'
import { selectPrize, getGameStats } from './utils/probabilityEngine'
import strings from './data/strings.json'

interface SpinResult {
  id: string
  prize: {
    id: number
    name: string
    icon: string
    color: string
    cost: number
  }
  timestamp: number
}

function App() {
  const [language, setLanguage] = useState<'it' | 'en'>('it')
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningSegment, setWinningSegment] = useState<number | null>(null)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [lastPrize, setLastPrize] = useState<any>(null)
  const [spinResults, setSpinResults] = useState<SpinResult[]>([])
  const [gameStats, setGameStats] = useState(getGameStats())

  const t = strings[language]

  // Update game stats when results change
  useEffect(() => {
    setGameStats(getGameStats())
  }, [spinResults])

  const handleSpin = (prizeIndex: number) => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setWinningSegment(null)
    
    // Use the probability engine to select the actual prize
    const selectedPrize = selectPrize()
    setLastPrize(selectedPrize)
    
    // Create spin result
    const spinResult: SpinResult = {
      id: selectedPrize.spinId,
      prize: selectedPrize,
      timestamp: Date.now()
    }
    
    // Add to results (keep last 10)
    setSpinResults(prev => {
      const newResults = [spinResult, ...prev]
      return newResults.slice(0, 10)
    })
    
    // Show winning segment and modal after a delay
    setTimeout(() => {
      setWinningSegment(selectedPrize.id)
      setShowPrizeModal(true)
      setIsSpinning(false)
    }, 3200) // Slightly after wheel animation completes
  }

  const handleCloseModal = () => {
    setShowPrizeModal(false)
    setWinningSegment(null)
    setLastPrize(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
          {t.title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-4">
          {t.subtitle}
        </p>
        
        {/* Language Selector */}
        <div className="flex justify-center mb-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as 'it' | 'en')}
            className="bg-black/30 text-white px-4 py-2 rounded-lg border border-yellow-400/50 backdrop-blur-sm"
          >
            <option value="it">🇮🇹 Italiano</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        
        {/* Game Stats */}
        <div className="flex justify-center gap-6 text-white/80">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{gameStats.totalSpins}</div>
            <div className="text-sm">{t.totalSpins}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">€{gameStats.totalSpins * 2}</div>
            <div className="text-sm">Incasso Totale</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Results Log - Left Side */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ResultLog results={spinResults} strings={t} />
          </div>
          
          {/* Wheel - Center */}
          <div className="lg:col-span-2 order-1 lg:order-2 flex justify-center">
            <Wheel
              onSpin={handleSpin}
              disabled={false} // No limits - can always spin if paying
              isSpinning={isSpinning}
              winningSegment={winningSegment}
              strings={t}
              selectedPrize={lastPrize}
            />
          </div>
        </div>
      </main>

      {/* Pity Badge */}
      <PityBadge isActive={gameStats.isPityActive} strings={t} />

      {/* Prize Modal */}
      {showPrizeModal && lastPrize && (
        <PrizeModal
          prize={lastPrize}
          onClose={handleCloseModal}
          strings={t}
        />
      )}
    </div>
  )
}

export default App