import { useState, useEffect } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import { Wheel } from './components/Wheel'
import { PrizeModal } from './components/PrizeModal'
import { AdminPanel } from './components/AdminPanel'
import { UserInfo } from './components/UserInfo'
import { Settings } from 'lucide-react'
import { Button } from './components/ui/button'
import { useToast } from './hooks/use-toast'
import { Toaster } from './components/ui/toaster'
import translations from './data/translations.json'

const blink = createClient({
  projectId: 'ruota-fortuna-party-edition-lhlxipwi',
  authRequired: true
})

export interface Prize {
  id: number
  name: string
  color: string
  weight: number
  icon: string
}

export interface SpinResult {
  id: string
  userId: string
  prizeId: number
  prizeName: string
  timestamp: number
  userEmail: string
}

export interface GameSettings {
  pityThreshold: number
  prizes: Prize[]
  dailyResetTime: string
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showPrizeModal, setShowPrizeModal] = useState(false)
  const [lastPrize, setLastPrize] = useState<Prize | null>(null)
  const [userSpins, setUserSpins] = useState(0)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [language, setLanguage] = useState<'it' | 'en'>('it')
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    pityThreshold: 25,
    prizes: [
      { id: 1, name: 'Moët Champagne', color: '#FFD700', weight: 1, icon: '🍾' },
      { id: 2, name: 'Bottiglia Premium', color: '#C0392B', weight: 2, icon: '🍷' },
      { id: 3, name: 'Raddoppia Ordine', color: '#8E44AD', weight: 2, icon: '2️⃣' },
      { id: 4, name: 'Vino', color: '#E74C3C', weight: 5, icon: '🍷' },
      { id: 5, name: 'Drink a Scelta', color: '#3498DB', weight: 8, icon: '🍹' },
      { id: 6, name: 'Spritz', color: '#F39C12', weight: 12, icon: '🥂' },
      { id: 7, name: 'Birra', color: '#F1C40F', weight: 20, icon: '🍺' },
      { id: 8, name: 'Nulla', color: '#95A5A6', weight: 50, icon: '❌' }
    ],
    dailyResetTime: '00:00'
  })

  const { toast } = useToast()
  const t = translations[language]

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Initialize database tables
  useEffect(() => {
    const loadUserSpins = async () => {
      if (!user) return
      try {
        const today = new Date().toISOString().split('T')[0]
        const result = await blink.db.sql(`
          SELECT spins_today FROM user_spins 
          WHERE user_id = ? AND last_spin_date = ?
        `, [user.id, today])

        if (result.length > 0) {
          setUserSpins(result[0].spins_today)
        } else {
          setUserSpins(0)
        }
      } catch (error) {
        console.error('Error loading user spins:', error)
        setUserSpins(0)
      }
    }

    if (user) {
      initializeDatabase()
      loadUserSpins()
    }
  }, [user])

  // Timer for daily reset
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [])

  const initializeDatabase = async () => {
    try {
      await blink.db.sql(`
        CREATE TABLE IF NOT EXISTS spin_results (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          prize_id INTEGER NOT NULL,
          prize_name TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await blink.db.sql(`
        CREATE TABLE IF NOT EXISTS user_spins (
          user_id TEXT PRIMARY KEY,
          spins_today INTEGER DEFAULT 0,
          last_spin_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await blink.db.sql(`
        CREATE TABLE IF NOT EXISTS game_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          pity_threshold INTEGER DEFAULT 25,
          prizes_config TEXT,
          daily_reset_time TEXT DEFAULT '00:00',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    } catch (error) {
      console.error('Database initialization error:', error)
    }
  }



  const handleSpin = async (prizeId: number) => {
    if (!user || userSpins >= 1) return

    try {
      const prize = gameSettings.prizes.find(p => p.id === prizeId)
      if (!prize) return

      const spinId = `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const today = new Date().toISOString().split('T')[0]

      // Record the spin result
      await blink.db.sql(`
        INSERT INTO spin_results (id, user_id, user_email, prize_id, prize_name, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [spinId, user.id, user.email, prizeId, prize.name, Date.now()])

      // Update user spins
      await blink.db.sql(`
        INSERT OR REPLACE INTO user_spins (user_id, spins_today, last_spin_date)
        VALUES (?, 1, ?)
      `, [user.id, today])

      setUserSpins(1)
      setLastPrize(prize)
      setShowPrizeModal(true)

      toast({
        title: t.spinComplete,
        description: `${t.youWon}: ${prize.name}`,
      })
    } catch (error) {
      console.error('Error recording spin:', error)
      toast({
        title: t.error,
        description: t.spinError,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-xl font-orbitron">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-orbitron font-bold text-yellow-400 mb-4">
            {t.title}
          </h1>
          <p className="text-white text-lg mb-8">{t.pleaseSignIn}</p>
          <Button 
            onClick={() => blink.auth.login()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3 text-lg"
          >
            {t.signIn}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/40 to-slate-900"></div>
      
      {/* Header */}
      <header className="relative z-10 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-yellow-400">
            {t.title}
          </h1>
          <p className="text-slate-300 text-sm">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as 'it' | 'en')}
            className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600"
          >
            <option value="it">🇮🇹 IT</option>
            <option value="en">🇬🇧 EN</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdmin(!showAdmin)}
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User info */}
          <div className="lg:col-span-1">
            <UserInfo 
              user={user}
              userSpins={userSpins}
              timeUntilReset={timeUntilReset}
              language={language}
            />
          </div>

          {/* Wheel */}
          <div className="lg:col-span-2 flex justify-center">
            <Wheel
              prizes={gameSettings.prizes}
              onSpin={handleSpin}
              disabled={userSpins >= 1}
              language={language}
            />
          </div>
        </div>

        {/* Admin panel */}
        {showAdmin && (
          <div className="mt-8">
            <AdminPanel
              gameSettings={gameSettings}
              onSettingsChange={setGameSettings}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Prize modal */}
      {showPrizeModal && lastPrize && (
        <PrizeModal
          prize={lastPrize}
          onClose={() => setShowPrizeModal(false)}
          language={language}
        />
      )}

      <Toaster />
    </div>
  )
}

export default App