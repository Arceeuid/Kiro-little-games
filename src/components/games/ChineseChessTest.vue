<template>
  <div class="chinese-chess-test">
    <h2>中国象棋测试</h2>
    
    <div class="test-info">
      <p>当前玩家: {{ currentPlayerName }}</p>
      <p>游戏状态: {{ gameStatusText }}</p>
      <p>移动历史: {{ moveHistory.length }} 步</p>
    </div>
    
    <div class="test-board">
      <ChineseChessBoardFixed
        :game="game"
        :selected-square="selectedSquare"
        :valid-moves="validMoves"
        :last-move="lastMove"
        :board-size="400"
        :show-coordinates="true"
        :show-last-move="true"
        @square-click="handleSquareClick"
        @piece-click="handlePieceClick"
        @piece-move="handlePieceMove"
      />
    </div>
    
    <div class="test-controls">
      <button @click="undoMove" :disabled="!canUndo">悔棋</button>
      <button @click="restartGame">重新开始</button>
    </div>
    
    <div class="test-log">
      <h3>操作日志</h3>
      <div class="log-entries">
        <div v-for="(entry, index) in logEntries" :key="index" class="log-entry">
          {{ entry }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import ChineseChessBoardFixed from './ChineseChessBoardFixed.vue'
import { ChineseChessGame, ChineseColor } from '../../utils/chinese-chess.js'

export default {
  name: 'ChineseChessTest',
  components: {
    ChineseChessBoardFixed
  },
  setup() {
    const game = ref(new ChineseChessGame())
    const selectedSquare = ref(null)
    const validMoves = ref([])
    const lastMove = ref(null)
    const logEntries = ref([])
    
    const addLog = (message) => {
      logEntries.value.unshift(`${new Date().toLocaleTimeString()}: ${message}`)
      if (logEntries.value.length > 20) {
        logEntries.value.pop()
      }
    }
    
    const currentPlayerName = computed(() => {
      return game.value.currentPlayer === ChineseColor.RED ? '红方' : '黑方'
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
    
    const moveHistory = computed(() => game.value.moveHistory)
    const canUndo = computed(() => moveHistory.value.length > 0)
    
    const handleSquareClick = (square) => {
      addLog(`点击位置: ${square.row},${square.col}`)
      
      if (selectedSquare.value) {
        const selectedPiece = game.value.board.getPieceAt(selectedSquare.value)
        
        if (selectedPiece && !square.equals(selectedSquare.value)) {
          const result = game.value.movePiece(selectedSquare.value, square)
          
          if (result.success) {
            lastMove.value = result.move
            selectedSquare.value = null
            validMoves.value = []
            addLog(`移动成功: ${selectedPiece.getChineseName()} 从 ${selectedSquare.value?.row},${selectedSquare.value?.col} 到 ${square.row},${square.col}`)
          } else {
            addLog(`移动失败: ${result.error}`)
          }
          return
        }
      }
      
      const pieceAtSquare = game.value.board.getPieceAt(square)
      if (pieceAtSquare && pieceAtSquare.color === game.value.currentPlayer) {
        selectedSquare.value = square
        validMoves.value = game.value.getValidMoves(pieceAtSquare)
        addLog(`选中棋子: ${pieceAtSquare.getChineseName()}, 有效移动: ${validMoves.value.length}`)
      } else {
        selectedSquare.value = null
        validMoves.value = []
        addLog('取消选择')
      }
    }
    
    const handlePieceClick = (piece) => {
      addLog(`点击棋子: ${piece.getChineseName()}`)
      
      if (piece.color === game.value.currentPlayer) {
        selectedSquare.value = piece.position
        validMoves.value = game.value.getValidMoves(piece)
        addLog(`选中棋子: ${piece.getChineseName()}, 有效移动: ${validMoves.value.length}`)
      }
    }
    
    const handlePieceMove = (moveData) => {
      addLog(`拖拽移动: ${moveData.piece.getChineseName()} 从 ${moveData.from.row},${moveData.from.col} 到 ${moveData.to.row},${moveData.to.col}`)
      
      const result = game.value.movePiece(moveData.from, moveData.to)
      
      if (result.success) {
        lastMove.value = result.move
        selectedSquare.value = null
        validMoves.value = []
        addLog('拖拽移动成功')
      } else {
        addLog(`拖拽移动失败: ${result.error}`)
      }
    }
    
    const undoMove = () => {
      if (game.value.undoMove()) {
        selectedSquare.value = null
        validMoves.value = []
        lastMove.value = null
        addLog('悔棋成功')
      } else {
        addLog('悔棋失败')
      }
    }
    
    const restartGame = () => {
      game.value.restart()
      selectedSquare.value = null
      validMoves.value = []
      lastMove.value = null
      logEntries.value = []
      addLog('游戏重新开始')
    }
    
    // 初始化日志
    addLog('游戏初始化完成')
    
    return {
      game,
      selectedSquare,
      validMoves,
      lastMove,
      logEntries,
      currentPlayerName,
      gameStatusText,
      moveHistory,
      canUndo,
      handleSquareClick,
      handlePieceClick,
      handlePieceMove,
      undoMove,
      restartGame
    }
  }
}
</script>

<style scoped>
.chinese-chess-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.test-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.test-info p {
  margin: 0.5rem 0;
  font-weight: 500;
}

.test-board {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.test-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.test-controls button {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.test-log {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.test-log h3 {
  margin: 0 0 1rem 0;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
}

.log-entry:last-child {
  border-bottom: none;
}
</style>