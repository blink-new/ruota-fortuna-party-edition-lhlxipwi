/**
 * Probability Engine for Ruota della Fortuna
 * 
 * Manages prize selection with configurable probabilities and pity system
 * for rare prizes to ensure fair distribution over time.
 */

/**
 * Prize configuration with costs and base probabilities
 * Probabilities are designed to achieve ~1.95€ average cost per spin
 */
export const PRIZES = [
  { id: 0, name: 'Moët', cost: 150, icon: '🍾', color: '#FFD700' },
  { id: 1, name: 'Bottiglia Premium', cost: 100, icon: '🍷', color: '#8B0000' },
  { id: 2, name: 'Raddoppia l\'ordine', cost: 10, icon: '2️⃣', color: '#4B0082' },
  { id: 3, name: 'Vino', cost: 60, icon: '🍷', color: '#DC143C' },
  { id: 4, name: 'Drink a scelta', cost: 10, icon: '🍹', color: '#1E90FF' },
  { id: 5, name: 'Spritz', cost: 10, icon: '🥂', color: '#FF8C00' },
  { id: 6, name: 'Birra', cost: 5, icon: '🍺', color: '#FFD700' },
  { id: 7, name: 'Miss', cost: 0, icon: '❌', color: '#808080' }
]

/**
 * Base probabilities (%) - total must equal 100
 * Order matches PRIZES array above
 */
export const BASE_PROBABILITIES = [0.2, 0.4, 1.2, 0.8, 1.5, 2.5, 5.0, 88.4]

/**
 * Pity system configuration
 * Ensures rare prizes are awarded within reasonable spin counts
 */
export const PITY_CONFIG = {
  enabled: true,
  rareIndexes: [0, 1, 2], // Moët, Bottiglia Premium, Raddoppia
  thresholdSpins: 30,     // Activate pity after 30 spins without rare
  multiplier: 2,          // Double the probability of rare prizes
  resetOnWin: true        // Reset counter when rare prize is won
}

/**
 * Game state to track spins and pity system
 */
let gameState = {
  totalSpins: 0,
  spinsWithoutRare: 0,
  isPityActive: false,
  spinHistory: []
}

/**
 * Calculate current probabilities considering pity system
 * @returns {number[]} Array of current probabilities (0-100)
 */
function getCurrentProbabilities() {
  let probabilities = [...BASE_PROBABILITIES]
  
  if (PITY_CONFIG.enabled && gameState.isPityActive) {
    // Apply pity multiplier to rare prizes
    PITY_CONFIG.rareIndexes.forEach(index => {
      probabilities[index] *= PITY_CONFIG.multiplier
    })
    
    // Normalize to ensure total equals 100
    const total = probabilities.reduce((sum, prob) => sum + prob, 0)
    probabilities = probabilities.map(prob => (prob / total) * 100)
  }
  
  return probabilities
}

/**
 * Select a prize based on current probabilities
 * @returns {Object} Selected prize with additional metadata
 */
export function selectPrize() {
  const probabilities = getCurrentProbabilities()
  const random = Math.random() * 100
  
  let cumulative = 0
  let selectedPrizeIndex = 0
  
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i]
    if (random <= cumulative) {
      selectedPrizeIndex = i
      break
    }
  }
  
  const selectedPrize = PRIZES[selectedPrizeIndex]
  
  // Update game state
  gameState.totalSpins++
  
  // Check if this is a rare prize
  const isRarePrize = PITY_CONFIG.rareIndexes.includes(selectedPrizeIndex)
  
  if (isRarePrize && PITY_CONFIG.resetOnWin) {
    // Reset pity system
    gameState.spinsWithoutRare = 0
    gameState.isPityActive = false
  } else if (!isRarePrize) {
    // Increment spins without rare
    gameState.spinsWithoutRare++
    
    // Check if pity should activate
    if (gameState.spinsWithoutRare >= PITY_CONFIG.thresholdSpins) {
      gameState.isPityActive = true
    }
  }
  
  // Add to history (keep last 10)
  const spinResult = {
    id: `spin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    prize: selectedPrize,
    timestamp: Date.now(),
    wasPityActive: gameState.isPityActive,
    spinsWithoutRare: gameState.spinsWithoutRare
  }
  
  gameState.spinHistory.unshift(spinResult)
  if (gameState.spinHistory.length > 10) {
    gameState.spinHistory = gameState.spinHistory.slice(0, 10)
  }
  
  return {
    ...selectedPrize,
    spinId: spinResult.id,
    wasPityActive: spinResult.wasPityActive
  }
}

/**
 * Get current game statistics
 * @returns {Object} Current game state and statistics
 */
export function getGameStats() {
  return {
    totalSpins: gameState.totalSpins,
    spinsWithoutRare: gameState.spinsWithoutRare,
    isPityActive: gameState.isPityActive,
    spinHistory: [...gameState.spinHistory],
    currentProbabilities: getCurrentProbabilities(),
    baseProbabilities: [...BASE_PROBABILITIES]
  }
}

/**
 * Reset the game state (useful for testing or daily resets)
 */
export function resetGameState() {
  gameState = {
    totalSpins: 0,
    spinsWithoutRare: 0,
    isPityActive: false,
    spinHistory: []
  }
}

/**
 * Calculate expected cost per spin based on current probabilities
 * @returns {number} Expected cost in euros
 */
export function getExpectedCost() {
  const probabilities = getCurrentProbabilities()
  let expectedCost = 0
  
  for (let i = 0; i < PRIZES.length; i++) {
    expectedCost += (probabilities[i] / 100) * PRIZES[i].cost
  }
  
  return expectedCost
}