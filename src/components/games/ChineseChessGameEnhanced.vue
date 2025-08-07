<template>
  <div class="chinese-chess-game-enhanced">
    <!-- 游戏顶部信息栏 -->
    <div class="game-header">
      <div class="game-info">
        <div class="game-title">
          <h2>中国象棋</h2>
          <div class="game-timer" v-if="gameTimer.enabled">
            <span class="timer-label">游戏时间:</span>
            <span class="timer-value">{{ formatTime(gameTimer.elapsed) }}</span>
          </div>
        </div>
        
        <div class="game-status">
          <div class="current-player-info">
            <span class="player-label">当前玩家:</span>
            <div class="player-indicator" :class="currentPlayerClass">
              <span class="player-icon">{{ currentPlayerIcon }}</span>
              <span class="player-name">{{ currentPlayerName }}</span>
            </div>
          </div>
          
          <div class="game-state-info">
            <span class="state-badge" :class="gameStatusClass">
              {{ gameStatusText }}
            </span>
            <span class="move-count">第 {{ moveCount }} 回合</span>
          </div>
        </div>
      </div>
      
      <div class="game-controls">
        <div class="control-group">
          <button 
            class="btn btn-icon" 
            @click="undoMove" 
            :disabled="!canUndo"
            title="悔棋"
          >
            <span class="icon">↶</span>
            悔棋
          </button>
          
          <button 
            class="btn btn-icon" 
            @click="toggleHints"
            :class="{ active: showHints }"
            title="显示/隐藏移动提示"
          >
            <span class="icon">💡</span>
            提示
          </button>
          
          <button 
            class="btn btn-icon" 
            @click="toggleSound"
            :class="{ active: soundEnabled }"
            title="开启/关闭音效"
          >
            <span class="icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
            音效
          </button>
        </div>
        
        <div class="control-group">
          <button class="btn btn-secondary" @click="restartGame">
            重新开始
          </button>
          <button class="btn btn-secondary" @click="$emit('back-to-home')">
            返回主页
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主游戏区域 -->
    <div class="game-main">
      <div class="game-board-section">
        <div class="board-wrapper">
          <ChineseChessBoard
            :game="game"
            :selected-square="selectedSquare"
            :valid-moves="showHints ? validMoves : []"
            :last-move="lastMove"
            :board-size="boardSize"
            :show-coordinates="showCoordinates"
            :show-last-move="showLastMove"
            @square-click="handleSquareClick"
            @piece-click="handlePieceClick"
            @piece-move="handlePieceMove"
          />
        </div>
        
        <!-- 棋盘控制 -->
        <div class="board-controls">
          <div class="size-control">
            <label>棋盘大小:</label>
            <input 
              type="range" 
              v-model="boardSize" 
              min="320" 
              max="600" 
              step="20"
              class="size-slider"
            >
            <span class="size-value">{{ boardSize }}px</span>
          </div>
          
          <div class="display-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showCoordinates">
              显示坐标
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="showLastMove">
              显示最后移动
            </label>
          </div>
        </div>
      </div>
      
      <!-- 侧边栏 -->
      <div class="game-sidebar">
        <!-- 玩家信息 -->
        <div class="players-info">
          <div class="player-card black-player" :class="{ active: currentPlayer === 'black' }">
            <div class="player-header">
              <span class="player-icon">⚫</span>
              <span class="player-name">黑方</span>
              <span class="player-status" v-if="currentPlayer === 'black'">思考中...</span>
            </div>
            <div class="player-stats">
              <span>被吃: {{ capturedBlackPieces.length }}</span>
              <span>价值: {{ calculateCapturedValue(capturedBlackPieces) }}</span>
            </div>
          </div>
          
          <div class="vs-indicator">VS</div>
          
          <div class="player-card red-player" :class="{ active: currentPlayer === 'red' }">
            <div class="player-header">
              <span class="player-icon">🔴</span>
              <span class="player-name">红方</span>
              <span class="player-status" v-if="currentPlayer === 'red'">思考中...</span>
            </div>
            <div class="player-stats">
              <span>被吃: {{ capturedRedPieces.length }}</span>
              <span>价值: {{ calculateCapturedValue(capturedRedPieces) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 被吃棋子展示 -->
        <div class="captured-pieces">
          <h3>被吃棋子</h3>
          
          <div class="captured-section">
            <h4>黑方被吃</h4>
            <div class="pieces-grid">
              <div 
                v-for="piece in capturedBlackPieces" 
                :key="piece.id"
                class="captured-piece black"
                :title="piece.getChineseName()"
              >
                {{ piece.getChineseName() }}
              </div>
              <div v-if="capturedBlackPieces.length === 0" class="no-pieces">
                暂无
              </div>
            </div>
          </div>
          
          <div class="captured-section">
            <h4>红方被吃</h4>
            <div class="pieces-grid">
              <div 
                v-for="piece in capturedRedPieces" 
                :key="piece.id"
                class="captured-piece red"
                :title="piece.getChineseName()"
              >
                {{ piece.getChineseName() }}
              </div>
              <div v-if="capturedRedPieces.length === 0" class="no-pieces">
                暂无
              </div>
            </div>
          </div>
        </div>
        
        <!-- 走棋记录 -->
        <div class="move-history">
          <div class="history-header">
            <h3>走棋记录</h3>
            <button 
              class="btn btn-small" 
              @click="exportMoves"
              :disabled="moveHistory.length === 0"
            >
              导出
            </button>
          </div>
          
          <div class="history-list" ref="historyList">
            <div 
              v-for="(move, index) in moveHistory" 
              :key="index"
              class="history-item"
              :class="{ 
                active: index === moveHistory.length - 1,
                red: move.piece.color === 'red',
                black: move.piece.color === 'black'
              }"
              @click="highlightMove(move)"
            >
              <span class="move-number">{{ Math.floor(index / 2) + 1 }}{{ index % 2 === 0 ? '.' : '...' }}</span>
              <span class="move-text">{{ formatMoveDetailed(move) }}</span>
              <span class="move-time" v-if="move.timestamp">
                {{ formatMoveTime(move.timestamp) }}
              </span>
            </div>
            
            <div v-if="moveHistory.length === 0" class="no-moves">
              暂无走棋记录
            </div>
          </div>
        </div>
        
        <!-- 游戏统计 -->
        <div class="game-stats">
          <h3>游戏统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总步数</span>
              <span class="stat-value">{{ moveHistory.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">红方步数</span>
              <span class="stat-value">{{ redMoveCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">黑方步数</span>
              <span class="stat-value">{{ blackMoveCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均用时</span>
              <span class="stat-value">{{ averageMoveTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 游戏结束对话框 -->
    <div v-if="gameResult" class="game-result-modal" @click="closeResultModal">
      <div class="modal-content" @click.stop>
        <div class="result-header">
          <h2>🎉 游戏结束</h2>
          <button class="close-btn" @click="closeResultModal">×</button>
        </div>
        
        <div class="result-body">
          <div class="winner-info">
            <div class="winner-icon">
              {{ gameResult.winner === 'red' ? '🔴' : '⚫' }}
            </div>
            <div class="winner-text">
              <h3>{{ gameResult.winner === 'red' ? '红方' : '黑方' }} 获胜！</h3>
              <p>获胜原因: {{ gameResult.reason }}</p>
            </div>
          </div>
          
          <div class="game-summary">
            <div class="summary-item">
              <span class="label">总回合数:</span>
              <span class="value">{{ Math.ceil(moveHistory.length / 2) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">游戏时长:</span>
              <span class="value">{{ formatTime(gameTimer.elapsed) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">红方被吃:</span>
              <span class="value">{{ capturedRedPieces.length }} 子</span>
            </div>
            <div class="summary-item">
              <span class="label">黑方被吃:</span>
              <span class="value">{{ capturedBlackPieces.length }} 子</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="btn btn-primary" @click="restartGame">再来一局</button>
          <button class="btn btn-secondary" @click="$emit('back-to-home')">返回主页</button>
          <button class="btn btn-secondary" @click="exportGameRecord">导出棋谱</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ChineseChessBoardFixed from './ChineseChessBoardFixed.vue'
import { ChineseChessGame, ChineseColor, ChinesePieceType } from '../../utils/chinese-chess.js'
import { ChessUtils } from '../../utils/chess-types.js'

export default {
  name: 'ChineseChessGameEnhanced',
  components: {
    ChineseChessBoard: ChineseChessBoardFixed
  },
  emits: ['back-to-home'],
  setup(props, { emit }) {
    // 游戏实例
    const game = ref(new ChineseChessGame())
    
    // 界面状态
    const selectedSquare = ref(null)
    const validMoves = ref([])
    const lastMove = ref(null)
    const showResultModal = ref(false)
    
    // 设置选项
    const boardSize = ref(480)
    const showCoordinates = ref(true)
    const showLastMove = ref(true)
    const showHints = ref(true)
    const soundEnabled = ref(true)
    
    // 游戏计时器
    const gameTimer = ref({
      enabled: true,
      startTime: Date.now(),
      elapsed: 0,
      interval: null
    })
    
    // 计算属性
    const currentPlayer = computed(() => game.value.currentPlayer)
    
    const currentPlayerName = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? '红方' : '黑方'
    })
    
    const currentPlayerClass = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? 'red-player' : 'black-player'
    })
    
    const currentPlayerIcon = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? '🔴' : '⚫'
    })
    
    const gameStatusText = computed(() => {
      const statusMap = {
        'playing': '进行中',
        'check': '将军！',
        'checkmate': '将死',
        'draw': '平局'
      }
      return statusMap[game.value.gameStatus] || '未知状态'
    })
    
    const gameStatusClass = computed(() => {
      return {
        'status-playing': game.value.gameStatus === 'playing',
        'status-check': game.value.gameStatus === 'check',
        'status-checkmate': game.value.gameStatus === 'checkmate',
        'status-draw': game.value.gameStatus === 'draw'
      }
    })
    
    const moveHistory = computed(() => game.value.moveHistory)
    const moveCount = computed(() => Math.ceil(moveHistory.value.length / 2))
    
    const capturedRedPieces = computed(() => {
      return game.value.capturedPieces.filter(piece => piece.color === ChineseColor.RED)
    })
    
    const capturedBlackPieces = computed(() => {
      return game.value.capturedPieces.filter(piece => piece.color === ChineseColor.BLACK)
    })
    
    const canUndo = computed(() => moveHistory.value.length > 0)
    
    const gameResult = computed(() => {
      if (game.value.gameStatus === 'checkmate') {
        return game.value.getGameResult()
      }
      return null
    })
    
    const redMoveCount = computed(() => {
      return moveHistory.value.filter((move, index) => index % 2 === 0).length
    })
    
    const blackMoveCount = computed(() => {
      return moveHistory.value.filter((move, index) => index % 2 === 1).length
    })
    
    const averageMoveTime = computed(() => {
      if (moveHistory.value.length === 0) return '0s'
      const avgMs = gameTimer.value.elapsed / moveHistory.value.length
      return formatTime(avgMs)
    })
    
    // 工具方法
    const formatTime = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
      } else if (minutes > 0) {
        return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
      } else {
        return `${seconds}s`
      }
    }
    
    const formatMoveDetailed = (move) => {
      const piece = move.piece
      const from = ChessUtils.squareToAlgebraic(move.from)
      const to = ChessUtils.squareToAlgebraic(move.to)
      
      let moveText = `${piece.getChineseName()}${from}-${to}`
      
      if (move.capturedPiece) {
        moveText += `吃${move.capturedPiece.getChineseName()}`
      }
      
      return moveText
    }
    
    const formatMoveTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }
    
    const calculateCapturedValue = (pieces) => {
      const values = {
        [ChinesePieceType.GENERAL]: 1000,
        [ChinesePieceType.ADVISOR]: 20,
        [ChinesePieceType.ELEPHANT]: 20,
        [ChinesePieceType.HORSE]: 40,
        [ChinesePieceType.CHARIOT]: 90,
        [ChinesePieceType.CANNON]: 45,
        [ChinesePieceType.SOLDIER]: 10
      }
      
      return pieces.reduce((total, piece) => total + (values[piece.type] || 0), 0)
    }
    
    // 事件处理
    const handleSquareClick = (square) => {
      console.log('点击格子:', square)
      
      if (selectedSquare.value) {
        const selectedPiece = game.value.board.getPieceAt(selectedSquare.value)
        
        if (selectedPiece && !square.equals(selectedSquare.value)) {
          const result = game.value.movePiece(selectedSquare.value, square)
          
          if (result.success) {
            lastMove.value = result.move
            selectedSquare.value = null
            validMoves.value = []
            
            if (soundEnabled.value) {
              playMoveSound(result.capturedPiece ? 'capture' : 'move')
            }
            
            console.log('移动成功:', result.move)
          } else {
            console.log('移动失败:', result.error)
            if (soundEnabled.value) {
              playMoveSound('invalid')
            }
          }
          return
        }
      }
      
      const pieceAtSquare = game.value.board.getPieceAt(square)
      if (pieceAtSquare && pieceAtSquare.color === game.value.currentPlayer) {
        selectedSquare.value = square
        validMoves.value = game.value.getValidMoves(pieceAtSquare)
        console.log('选中棋子:', pieceAtSquare.getChineseName(), '有效移动:', validMoves.value.length)
      } else {
        selectedSquare.value = null
        validMoves.value = []
      }
    }
    
    const handlePieceClick = (piece) => {
      console.log('点击棋子:', piece.getChineseName())
      
      if (piece.color === game.value.currentPlayer) {
        selectedSquare.value = piece.position
        validMoves.value = game.value.getValidMoves(piece)
      }
    }
    
    const handlePieceMove = (moveData) => {
      // 处理拖拽移动
      const result = game.value.movePiece(moveData.from, moveData.to)
      
      if (result.success) {
        lastMove.value = result.move
        selectedSquare.value = null
        validMoves.value = []
        
        if (soundEnabled.value) {
          playMoveSound(result.capturedPiece ? 'capture' : 'move')
        }
      }
    }
    
    const undoMove = () => {
      if (game.value.undoMove()) {
        selectedSquare.value = null
        validMoves.value = []
        lastMove.value = null
        
        if (soundEnabled.value) {
          playMoveSound('undo')
        }
        
        console.log('悔棋成功')
      }
    }
    
    const restartGame = () => {
      game.value.restart()
      selectedSquare.value = null
      validMoves.value = []
      lastMove.value = null
      showResultModal.value = false
      
      // 重置计时器
      gameTimer.value.startTime = Date.now()
      gameTimer.value.elapsed = 0
      
      console.log('游戏重新开始')
    }
    
    const toggleHints = () => {
      showHints.value = !showHints.value
    }
    
    const toggleSound = () => {
      soundEnabled.value = !soundEnabled.value
    }
    
    const highlightMove = (move) => {
      lastMove.value = move
      selectedSquare.value = null
      validMoves.value = []
    }
    
    const closeResultModal = () => {
      showResultModal.value = false
    }
    
    const exportMoves = () => {
      const moves = moveHistory.value.map((move, index) => {
        return `${Math.floor(index / 2) + 1}${index % 2 === 0 ? '.' : '...'} ${formatMoveDetailed(move)}`
      }).join('\n')
      
      const blob = new Blob([moves], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `中国象棋-${new Date().toISOString().slice(0, 10)}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    const exportGameRecord = () => {
      const gameData = {
        date: new Date().toISOString(),
        result: gameResult.value,
        moves: moveHistory.value.map(move => ({
          from: move.from,
          to: move.to,
          piece: move.piece.getChineseName(),
          captured: move.capturedPiece ? move.capturedPiece.getChineseName() : null
        })),
        duration: formatTime(gameTimer.value.elapsed)
      }
      
      const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `中国象棋棋谱-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    const playMoveSound = (type) => {
      // 简单的音效实现（可以替换为真实音频文件）
      if (!soundEnabled.value) return
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      const frequencies = {
        move: 800,
        capture: 600,
        invalid: 300,
        undo: 1000
      }
      
      oscillator.frequency.setValueAtTime(frequencies[type] || 800, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
    
    // 生命周期
    onMounted(() => {
      console.log('中国象棋游戏初始化完成')
      
      // 启动计时器
      gameTimer.value.interval = setInterval(() => {
        gameTimer.value.elapsed = Date.now() - gameTimer.value.startTime
      }, 1000)
    })
    
    onUnmounted(() => {
      if (gameTimer.value.interval) {
        clearInterval(gameTimer.value.interval)
      }
    })
    
    return {
      game,
      selectedSquare,
      validMoves,
      lastMove,
      showResultModal,
      boardSize,
      showCoordinates,
      showLastMove,
      showHints,
      soundEnabled,
      gameTimer,
      currentPlayer,
      currentPlayerName,
      currentPlayerClass,
      currentPlayerIcon,
      gameStatusText,
      gameStatusClass,
      moveHistory,
      moveCount,
      capturedRedPieces,
      capturedBlackPieces,
      canUndo,
      gameResult,
      redMoveCount,
      blackMoveCount,
      averageMoveTime,
      formatTime,
      formatMoveDetailed,
      formatMoveTime,
      calculateCapturedValue,
      handleSquareClick,
      handlePieceClick,
      handlePieceMove,
      undoMove,
      restartGame,
      toggleHints,
      toggleSound,
      highlightMove,
      closeResultModal,
      exportMoves,
      exportGameRecord
    }
  }
}
</script>

<style scoped>
.chinese-chess-game-enhanced {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.game-title {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.game-title h2 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.game-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.timer-label {
  color: #666;
  font-size: 0.9rem;
}

.timer-value {
  color: #333;
  font-weight: 600;
  font-family: monospace;
}

.game-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-label {
  color: #666;
  font-weight: 500;
}

.player-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.player-indicator.red-player {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
}

.player-indicator.black-player {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.game-state-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.state-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.state-badge.status-playing {
  background: #e3f2fd;
  color: #1976d2;
}

.state-badge.status-check {
  background: #fff3e0;
  color: #f57c00;
  animation: pulse 1s infinite;
}

.state-badge.status-checkmate {
  background: #ffebee;
  color: #d32f2f;
}

.move-count {
  color: #666;
  font-size: 0.9rem;
}

.game-controls {
  display: flex;
  gap: 1rem;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}

.btn-icon .icon {
  font-size: 1.2rem;
}

.btn-icon.active {
  background: #667eea;
  color: white;
}

.game-main {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

.game-board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.board-wrapper {
  display: flex;
  justify-content: center;
}

.board-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.size-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.size-slider {
  flex: 1;
}

.size-value {
  font-weight: 500;
  color: #333;
  min-width: 60px;
}

.display-options {
  display: flex;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.players-info {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.player-card {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.player-card.active {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.player-card.black-player {
  background: rgba(0, 0, 0, 0.05);
}

.player-card.red-player {
  background: rgba(244, 67, 54, 0.05);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.player-name {
  font-weight: 600;
  color: #333;
}

.player-status {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.player-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.vs-indicator {
  text-align: center;
  font-weight: bold;
  color: #667eea;
  font-size: 1.2rem;
}

.captured-pieces,
.move-history,
.game-stats {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.captured-pieces h3,
.move-history h3,
.game-stats h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.captured-section {
  margin-bottom: 1rem;
}

.captured-section h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.pieces-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.captured-piece {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.captured-piece.red {
  background: #ffebee;
  color: #d32f2f;
}

.captured-piece.black {
  background: #f5f5f5;
  color: #333;
}

.no-pieces {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: #f8f9fa;
}

.history-item.active {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.history-item.red {
  border-left: 3px solid #f44336;
}

.history-item.black {
  border-left: 3px solid #333;
}

.move-number {
  font-weight: 500;
  color: #666;
  min-width: 40px;
  font-size: 0.8rem;
}

.move-text {
  flex: 1;
  color: #333;
}

.move-time {
  font-size: 0.7rem;
  color: #999;
}

.no-moves {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.game-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.result-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.result-body {
  padding: 2rem;
}

.winner-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.winner-icon {
  font-size: 4rem;
}

.winner-text h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.winner-text p {
  margin: 0;
  color: #666;
}

.game-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  color: #333;
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 2rem 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 1200px) {
  .game-main {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .game-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .chinese-chess-game-enhanced {
    padding: 0.5rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-title {
    flex-direction: column;
    gap: 1rem;
  }
  
  .game-status {
    align-items: center;
  }
  
  .game-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .board-controls {
    max-width: none;
  }
  
  .display-options {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
</style>