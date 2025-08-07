<template>
  <div class="chinese-chess-game">
    <div class="game-header">
      <div class="game-info">
        <h2>中国象棋</h2>
        <div class="game-status">
          <span class="current-player">
            当前玩家: <strong :class="currentPlayerClass">{{ currentPlayerName }}</strong>
          </span>
          <span class="game-state" :class="gameStatusClass">{{ gameStatusText }}</span>
        </div>
      </div>
      
      <div class="game-controls">
        <button class="btn btn-secondary" @click="undoMove" :disabled="!canUndo">
          悔棋
        </button>
        <button class="btn btn-secondary" @click="restartGame">
          重新开始
        </button>
        <button class="btn btn-secondary" @click="$emit('back-to-home')">
          返回主页
        </button>
      </div>
    </div>
    
    <div class="game-board-container">
      <div class="board-wrapper">
        <ChineseChessBoard
          :game="game"
          :selected-square="selectedSquare"
          :valid-moves="validMoves"
          :last-move="lastMove"
          @square-click="handleSquareClick"
          @piece-click="handlePieceClick"
        />
      </div>
      
      <div class="game-sidebar">
        <div class="captured-pieces">
          <h3>被吃棋子</h3>
          <div class="captured-section">
            <h4>红方被吃</h4>
            <div class="pieces-list">
              <span 
                v-for="piece in capturedRedPieces" 
                :key="piece.id"
                class="captured-piece red"
              >
                {{ piece.getChineseName() }}
              </span>
            </div>
          </div>
          <div class="captured-section">
            <h4>黑方被吃</h4>
            <div class="pieces-list">
              <span 
                v-for="piece in capturedBlackPieces" 
                :key="piece.id"
                class="captured-piece black"
              >
                {{ piece.getChineseName() }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="move-history">
          <h3>走棋记录</h3>
          <div class="history-list">
            <div 
              v-for="(move, index) in moveHistory" 
              :key="index"
              class="history-item"
              :class="{ active: index === moveHistory.length - 1 }"
            >
              <span class="move-number">{{ index + 1 }}.</span>
              <span class="move-text">{{ formatMove(move) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 游戏结束对话框 -->
    <div v-if="gameResult" class="game-result-modal">
      <div class="modal-content">
        <h2>游戏结束</h2>
        <div class="result-info">
          <div class="winner">
            <span class="winner-label">获胜方:</span>
            <span class="winner-name" :class="gameResult.winner">
              {{ gameResult.winner === 'red' ? '红方' : '黑方' }}
            </span>
          </div>
          <div class="result-reason">
            <span>获胜原因: {{ gameResult.reason }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="restartGame">再来一局</button>
          <button class="btn btn-secondary" @click="$emit('back-to-home')">返回主页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ChineseChessBoard from './ChineseChessBoard.vue'
import { ChineseChessGame, ChineseColor } from '../../utils/chinese-chess.js'
import { ChessUtils } from '../../utils/chess-types.js'

export default {
  name: 'ChineseChessGame',
  components: {
    ChineseChessBoard
  },
  emits: ['back-to-home'],
  setup(props, { emit }) {
    // 游戏实例
    const game = ref(new ChineseChessGame())
    
    // 界面状态
    const selectedSquare = ref(null)
    const validMoves = ref([])
    const lastMove = ref(null)
    
    // 计算属性
    const currentPlayerName = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? '红方' : '黑方'
    })
    
    const currentPlayerClass = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? 'red-player' : 'black-player'
    })
    
    const gameStatusText = computed(() => {
      const statusMap = {
        'playing': '进行中',
        'check': '将军',
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
    
    const moveHistory = computed(() => {
      return game.value.moveHistory
    })
    
    const capturedRedPieces = computed(() => {
      return game.value.capturedPieces.filter(piece => piece.color === ChineseColor.RED)
    })
    
    const capturedBlackPieces = computed(() => {
      return game.value.capturedPieces.filter(piece => piece.color === ChineseColor.BLACK)
    })
    
    const canUndo = computed(() => {
      return game.value.moveHistory.length > 0
    })
    
    const gameResult = computed(() => {
      if (game.value.gameStatus === 'checkmate') {
        return game.value.getGameResult()
      }
      return null
    })
    
    // 事件处理
    const handleSquareClick = (square) => {
      console.log('点击格子:', square)
      
      // 如果有选中的棋子，尝试移动
      if (selectedSquare.value) {
        const selectedPiece = game.value.board.getPieceAt(selectedSquare.value)
        
        if (selectedPiece && !square.equals(selectedSquare.value)) {
          // 尝试移动棋子
          const result = game.value.movePiece(selectedSquare.value, square)
          
          if (result.success) {
            lastMove.value = result.move
            selectedSquare.value = null
            validMoves.value = []
            console.log('移动成功:', result.move)
          } else {
            console.log('移动失败:', result.error)
          }
          return
        }
      }
      
      // 选择新的棋子
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
    
    const undoMove = () => {
      if (game.value.undoMove()) {
        selectedSquare.value = null
        validMoves.value = []
        lastMove.value = null
        console.log('悔棋成功')
      }
    }
    
    const restartGame = () => {
      game.value.restart()
      selectedSquare.value = null
      validMoves.value = []
      lastMove.value = null
      console.log('游戏重新开始')
    }
    
    const formatMove = (move) => {
      const piece = move.piece
      const from = ChessUtils.squareToAlgebraic(move.from)
      const to = ChessUtils.squareToAlgebraic(move.to)
      
      let moveText = `${piece.getChineseName()} ${from}-${to}`
      
      if (move.capturedPiece) {
        moveText += ` 吃${move.capturedPiece.getChineseName()}`
      }
      
      return moveText
    }
    
    // 生命周期
    onMounted(() => {
      console.log('中国象棋游戏初始化完成')
    })
    
    return {
      game,
      selectedSquare,
      validMoves,
      lastMove,
      currentPlayerName,
      currentPlayerClass,
      gameStatusText,
      gameStatusClass,
      moveHistory,
      capturedRedPieces,
      capturedBlackPieces,
      canUndo,
      gameResult,
      handleSquareClick,
      handlePieceClick,
      undoMove,
      restartGame,
      formatMove
    }
  }
}
</script>

<style scoped>
.chinese-chess-game {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.game-info h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.game-status {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.current-player {
  font-size: 1rem;
  color: #666;
}

.red-player {
  color: #d32f2f;
}

.black-player {
  color: #333;
}

.game-state {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-playing {
  background: #e3f2fd;
  color: #1976d2;
}

.status-check {
  background: #fff3e0;
  color: #f57c00;
}

.status-checkmate {
  background: #ffebee;
  color: #d32f2f;
}

.status-draw {
  background: #f3e5f5;
  color: #7b1fa2;
}

.game-controls {
  display: flex;
  gap: 1rem;
}

.game-board-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.board-wrapper {
  display: flex;
  justify-content: center;
}

.game-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.captured-pieces,
.move-history {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.captured-pieces h3,
.move-history h3 {
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

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.captured-piece {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.captured-piece.red {
  background: #ffebee;
  color: #d32f2f;
}

.captured-piece.black {
  background: #f5f5f5;
  color: #333;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.history-item.active {
  background: #e3f2fd;
}

.move-number {
  font-weight: 500;
  color: #666;
  min-width: 30px;
}

.move-text {
  color: #333;
}

.game-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  min-width: 300px;
}

.modal-content h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

.result-info {
  margin-bottom: 2rem;
}

.winner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.winner-label {
  color: #666;
}

.winner-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.winner-name.red {
  color: #d32f2f;
}

.winner-name.black {
  color: #333;
}

.result-reason {
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .chinese-chess-game {
    padding: 0.5rem;
  }
  
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-status {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .game-board-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .game-sidebar {
    order: -1;
  }
  
  .captured-pieces,
  .move-history {
    padding: 1rem;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>