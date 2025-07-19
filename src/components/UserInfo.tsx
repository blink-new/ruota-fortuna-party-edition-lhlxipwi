import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, User, Zap } from 'lucide-react'
import translations from '../data/translations.json'

interface UserInfoProps {
  user: any
  userSpins: number
  timeUntilReset: string
  language: 'it' | 'en'
}

export function UserInfo({ user, userSpins, timeUntilReset, language }: UserInfoProps) {
  const t = translations[language]
  const spinsRemaining = Math.max(0, 1 - userSpins)

  return (
    <div className="space-y-4">
      {/* User card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <User className="w-5 h-5" />
            {language === 'it' ? 'Giocatore' : 'Player'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-white font-medium">{user?.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant={spinsRemaining > 0 ? "default" : "secondary"} className="bg-yellow-400 text-black">
                <Zap className="w-3 h-3 mr-1" />
                {spinsRemaining} {t.spinsRemaining}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Clock className="w-5 h-5" />
            {t.resetIn}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-orbitron font-bold text-white mb-1">
              {timeUntilReset}
            </div>
            <p className="text-slate-400 text-sm">
              {language === 'it' ? 'fino al prossimo reset' : 'until next reset'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rules card */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400 text-sm">
            {language === 'it' ? 'Regole' : 'Rules'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-slate-300 text-xs space-y-1">
            <li>• {language === 'it' ? '1 giro per giocatore al giorno' : '1 spin per player per day'}</li>
            <li>• {language === 'it' ? 'Reset giornaliero a mezzanotte' : 'Daily reset at midnight'}</li>
            <li>• {language === 'it' ? 'Max 200 partecipanti per serata' : 'Max 200 participants per night'}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}