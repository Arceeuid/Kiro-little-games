import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    currentGame: null,
    gameHistory: [],
    settings: {
      showCoordinates: true,
      enableSoundEffects: true,
      animationSpeed: 'normal'
    }
  }),
  
  getters: {
    hasActiveGame: (state) => state.currentGame !== null,
    gameCount: (state) => state.gameHistory.length
  },
  
  actions: {
    setCurrentGame(game) {
      this.currentGame = game
    },
    
    addToHistory(gameResult) {
      this.gameHistory.push(Object.assign({}, gameResult, {
        timestamp: new Date()
      }))
    },
    
    updateSettings(newSettings) {
      this.settings = Object.assign({}, this.settings, newSettings)
    },
    
    clearHistory() {
      this.gameHistory = []
    }
  }
})