import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@blinkdotnew/sdk'
import { GameSettings, SpinResult } from '../App'
import translations from '../data/translations.json'

const blink = createClient({
  projectId: 'ruota-fortuna-party-edition-lhlxipwi',
  authRequired: true
})

interface AdminPanelProps {
  gameSettings: GameSettings
  onSettingsChange: (settings: GameSettings) => void
  language: 'it' | 'en'
}

export function AdminPanel({ gameSettings, onSettingsChange, language }: AdminPanelProps) {
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([])
  const [prizeStats, setPrizeStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const t = translations[language]

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        // Load recent spins
        const spinsResult = await blink.db.spinResults.list({
          orderBy: { timestamp: 'desc' },
          limit: 50
        })
        setRecentSpins(spinsResult)

        // Calculate prize statistics
        const allSpins = await blink.db.spinResults.list()
        const statsData = gameSettings.prizes.map(prize => {
          const count = allSpins.filter(spin => spin.prizeId === prize.id).length
          return {
            name: prize.name,
            count: count,
            weight: prize.weight,
            color: prize.color
          }
        })
        setPrizeStats(statsData)
      } catch (error) {
        console.error('Error loading admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [gameSettings])



  const handleWeightChange = (prizeId: number, newWeight: number) => {
    const updatedPrizes = gameSettings.prizes.map(prize =>
      prize.id === prizeId ? { ...prize, weight: newWeight } : prize
    )
    onSettingsChange({
      ...gameSettings,
      prizes: updatedPrizes
    })
  }

  const handlePityThresholdChange = (value: number[]) => {
    onSettingsChange({
      ...gameSettings,
      pityThreshold: value[0]
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatEmail = (email: string) => {
    const [name, domain] = email.split('@')
    return `${name.substring(0, 3)}***@${domain}`
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <span className="ml-2 text-white">{t.loading}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-orbitron font-bold text-yellow-400 mb-4">
        {t.adminPanel}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">
              {language === 'it' ? 'Configurazione' : 'Configuration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pity threshold */}
            <div>
              <label className="text-white font-medium mb-2 block">
                {t.pityThreshold}: {gameSettings.pityThreshold}
              </label>
              <Slider
                value={[gameSettings.pityThreshold]}
                onValueChange={handlePityThresholdChange}
                max={50}
                min={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Prize weights */}
            <div>
              <h4 className="text-white font-medium mb-4">{t.prizeWeights}</h4>
              <div className="space-y-4">
                {gameSettings.prizes.map(prize => (
                  <div key={prize.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white flex items-center gap-2">
                        <span>{prize.icon}</span>
                        {prize.name}
                      </span>
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        {prize.weight}%
                      </Badge>
                    </div>
                    <Slider
                      value={[prize.weight]}
                      onValueChange={(value) => handleWeightChange(prize.id, value[0])}
                      max={60}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">{t.statistics}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prizeStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent spins */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-yellow-400">{t.recentSpins}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {recentSpins.length === 0 ? (
              <p className="text-slate-400 text-center py-8">{t.noSpinsYet}</p>
            ) : (
              <div className="space-y-2">
                {recentSpins.map((spin) => (
                  <div
                    key={spin.id}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {gameSettings.prizes.find(p => p.id === spin.prizeId)?.icon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{spin.prizeName}</p>
                        <p className="text-slate-400 text-sm">
                          {formatEmail(spin.userEmail)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">
                        {formatTime(spin.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}