<template>
  <div class="chess-board-container">
    <!-- 棋盘信息栏 -->
    <div class="board-info" v-if="showInfo">
      <div class="current-player">
        <span class="player-indicator" :class="currentPlayer">
          {{ playerNames[currentPlayer] || currentPlayer }}
        </span>
        <span class="turn-text">的回合</span>
      </div>
      <div class="game-status" v-if="gameStatus !== 'playing'">
        {{ statusText }}
      </div>
    </div>
    
    <!-- 棋盘主体 -->
    <div 
      class="chess-board" 
      :class="[`board-${boardSize}x${boardSize}`, boardTheme]"
      :style="boardStyles"
    >
      <!-- 坐标标签 -->
      <div v-if="showCoordinates" class="coordinates">
        <!-- 行坐标（左侧） -->
        <div class="row-coordinates left">
          <div 
            v-for="row in boardSize" 
            :key="`row-left-${row}`"
            class="coordinate-label"
          >
            {{ boardSize - row + 1 }}
          </div>
        </div>
        
        <!-- 行坐标（右侧） -->
        <div class="row-coordinates right">
          <div 
            v-for="row in boardSize" 
            :key="`row-right-${row}`"
            class="coordinate-label"
          >
            {{ boardSize - row + 1 }}
          </div>
        </div>
        
        <!-- 列坐标（顶部） -->
        <div class="col-coordinates top">
          <div 
            v-for="col in boardSize" 
            :key="`col-top-${col}`"
            class="coordinate-label"
          >
            {{ String.fromCharCode(96 + col) }}
          </div>
        </div>
        
        <!-- 列坐标（底部） -->
        <div class="col-coordinates bottom">
          <div 
            v-for="col in boardSize" 
            :key="`col-bottom-${col}`"
            class="coordinate-label"
          >
            {{ String.fromCharCode(96 + col) }}
          </div>
        </div>
      </div>
      
      <!-- 棋盘格子 -->
      <div class="board-grid">
        <div 
          v-for="row in boardSize" 
          :key="`row-${row}`"
          class="board-row"
        >
          <div
            v-for="col in boardSize"
            :key="`square-${row}-${col}`"
            class="board-square"
            :class="getSquareClasses(row - 1, col - 1)"
            @click="handleSquareClick(row - 1, col - 1)"
            @dragover.prevent
            @drop="handleDrop($event, row - 1, col - 1)"
          >
            <!-- 棋子组件 -->
            <ChessPiece
              v-if="getPieceAt(row - 1, col - 1)"
              :piece="getPieceAt(row - 1, col - 1)"
              :is-selected="isSquareSelected(row - 1, col - 1)"
              :is-valid-move="isValidMoveSquare(row - 1, col - 1)"
              :is-in-check="isPieceInCheck(getPieceAt(row - 1, col - 1))"
              :board-theme="boardTheme"
              @click="handlePieceClick"
              @drag-start="handleDragStart"
              @drag-end="handleDragEnd"
            />
            
            <!-- 移动提示点 -->
            <div 
              v-if="isValidMoveSquare(row - 1, col - 1)" 
              class="move-hint"
              :class="{ 'capture-hint': getPieceAt(row - 1, col - 1) }"
            ></div>
            
            <!-- 最后移动高亮 -->
            <div 
              v-if="isLastMoveSquare(row - 1, col - 1)" 
              class="last-move-highlight"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 被吃棋子展示 -->
    <div v-if="showCapturedPieces" class="captured-pieces">
      <div class="captured-section">
        <h4>{{ playerNames[currentPlayer === 'white' ? 'black' : 'white'] }}被吃棋子</h4>
        <div class="captured-list">
          <ChessPiece
            v-for="piece in capturedPieces.filter(p => p.color !== currentPlayer)"
            :key="piece.id"
            :piece="piece"
            :is-captured="true"
            :board-theme="boardTheme"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import ChessPiece from './ChessPiece.vue'
import { Square, ChessUtils } from '../../utils/chess-types.js'

export default {
  name: 'ChessBoard',
  components: {
    ChessPiece
  },
  props: {
    // 棋盘大小
    boardSize: {
      type: Number,
      default: 8
    },
    // 棋子数组
    pieces: {
      type: Array,
      default: () => []
    },
    // 当前选中的格子
    selectedSquare: {
      type: Object,
      default: null
    },
    // 有效移动位置
    validMoves: {
      type: Array,
      default: () => []
    },
    // 当前玩家
    currentPlayer: {
      type: String,
      default: 'white'
    },
    // 游戏状态
    gameStatus: {
      type: String,
      default: 'playing'
    },
    // 最后一步移动
    lastMove: {
      type: Object,
      default: null
    },
    // 被吃的棋子
    capturedPieces: {
      type: Array,
      default: () => []
    },
    // 棋盘主题
    boardTheme: {
      type: String,
      default: 'classic'
    },
    // 显示坐标
    showCoordinates: {
      type: Boolean,
      default: true
    },
    // 显示信息栏
    showInfo: {
      type: Boolean,
      default: true
    },
    // 显示被吃棋子
    showCapturedPieces: {
      type: Boolean,
      default: true
    },
    // 玩家名称
    playerNames: {
      type: Object,
      default: () => ({
        white: '白方',
        black: '黑方',
        red: '红方'
      })
    },
    // 棋盘尺寸（像素）
    boardPixelSize: {
      type: Number,
      default: 480
    }
  },
  emits: [
    'square-click',
    'piece-click', 
    'piece-move',
    'piece-drag-start',
    'piece-drag-end'
  ],
  setup(props, { emit }) {
    const isDragging = ref(false)
    const draggedPiece = ref(null)
    
    // 计算棋盘样式
    const boardStyles = computed(() => ({
      width: `${props.boardPixelSize}px`,
      height: `${props.boardPixelSize}px`
    }))
    
    // 状态文本
    const statusText = computed(() => {
      const statusTexts = {
        check: '将军！',
        checkmate: '将死！',
        stalemate: '僵局',
        draw: '平局',
        resigned: '认输'
      }
      return statusTexts[props.gameStatus] || ''
    })
    
    // 获取指定位置的棋子
    const getPieceAt = (row, col) => {
      return props.pieces.find(piece => 
        piece.position.row === row && piece.position.col === col
      )
    }
    
    // 检查格子是否被选中
    const isSquareSelected = (row, col) => {
      return props.selectedSquare && 
             props.selectedSquare.row === row && 
             props.selectedSquare.col === col
    }
    
    // 检查格子是否是有效移动位置
    const isValidMoveSquare = (row, col) => {
      return props.validMoves.some(move => 
        move.row === row && move.col === col
      )
    }
    
    // 检查格子是否是最后移动的位置
    const isLastMoveSquare = (row, col) => {
      if (!props.lastMove) return false
      return (props.lastMove.from.row === row && props.lastMove.from.col === col) ||
             (props.lastMove.to.row === row && props.lastMove.to.col === col)
    }
    
    // 检查棋子是否被将军
    const isPieceInCheck = (piece) => {
      if (!piece) return false
      // 这里需要根据具体游戏逻辑实现
      return false
    }
    
    // 获取格子的CSS类
    const getSquareClasses = (row, col) => {
      const classes = []
      
      // 棋盘颜色
      if ((row + col) % 2 === 0) {
        classes.push('light-square')
      } else {
        classes.push('dark-square')
      }
      
      // 选中状态
      if (isSquareSelected(row, col)) {
        classes.push('selected')
      }
      
      // 有效移动
      if (isValidMoveSquare(row, col)) {
        classes.push('valid-move')
      }
      
      // 最后移动
      if (isLastMoveSquare(row, col)) {
        classes.push('last-move')
      }
      
      return classes
    }
    
    // 处理格子点击
    const handleSquareClick = (row, col) => {
      const square = new Square(row, col)
      emit('square-click', square)
    }
    
    // 处理棋子点击
    const handlePieceClick = (piece) => {
      emit('piece-click', piece)
    }
    
    // 处理拖拽开始
    const handleDragStart = (piece) => {
      isDragging.value = true
      draggedPiece.value = piece
      emit('piece-drag-start', piece)
    }
    
    // 处理拖拽结束
    const handleDragEnd = () => {
      isDragging.value = false
      draggedPiece.value = null
      emit('piece-drag-end')
    }
    
    // 处理放置
    const handleDrop = (event, row, col) => {
      event.preventDefault()
      if (draggedPiece.value) {
        const targetSquare = new Square(row, col)
        emit('piece-move', {
          piece: draggedPiece.value,
          from: draggedPiece.value.position,
          to: targetSquare
        })
      }
      handleDragEnd()
    }
    
    return {
      boardStyles,
      statusText,
      getPieceAt,
      isSquareSelected,
      isValidMoveSquare,
      isLastMoveSquare,
      isPieceInCheck,
      getSquareClasses,
      handleSquareClick,
      handlePieceClick,
      handleDragStart,
      handleDragEnd,
      handleDrop
    }
  }
}
</script>

<style scoped>
.chess-board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  user-select: none;
}

.board-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 480px;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.current-player {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.player-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
}

.player-indicator.white {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #333;
}

.player-indicator.black {
  background: #333;
}

.player-indicator.red {
  background: #dc3545;
}

.game-status {
  font-weight: bold;
  color: #dc3545;
  font-size: 1.1rem;
}

.chess-board {
  position: relative;
  border: 2px solid #8b4513;
  border-radius: 4px;
  background: #deb887;
}

.coordinates {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.row-coordinates, .col-coordinates {
  position: absolute;
  display: flex;
}

.row-coordinates {
  flex-direction: column;
  height: 100%;
  width: 20px;
}

.row-coordinates.left {
  left: -25px;
}

.row-coordinates.right {
  right: -25px;
}

.col-coordinates {
  flex-direction: row;
  width: 100%;
  height: 20px;
}

.col-coordinates.top {
  top: -25px;
}

.col-coordinates.bottom {
  bottom: -25px;
}

.coordinate-label {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}

.board-grid {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.board-row {
  display: flex;
  flex: 1;
}

.board-square {
  flex: 1;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-square.light-square {
  background: #f0d9b5;
}

.board-square.dark-square {
  background: #b58863;
}

.board-square.selected {
  background: #f7ec74 !important;
  box-shadow: inset 0 0 0 3px #f7d51d;
}

.board-square.valid-move {
  background: rgba(0, 255, 0, 0.3) !important;
}

.board-square.last-move {
  background: rgba(255, 255, 0, 0.4) !important;
}

.board-square:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.move-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.move-hint.capture-hint {
  width: 100%;
  height: 100%;
  border-radius: 0;
  background: rgba(255, 0, 0, 0.3);
  border: 3px solid rgba(255, 0, 0, 0.6);
}

.last-move-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #ffeb3b;
  pointer-events: none;
}

.captured-pieces {
  width: 100%;
  max-width: 480px;
}

.captured-section h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.captured-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  min-height: 40px;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

/* 主题样式 */
.chess-board.board-theme-wood {
  background: #deb887;
  border-color: #8b4513;
}

.chess-board.board-theme-marble {
  background: #f5f5f5;
  border-color: #ccc;
}

.chess-board.board-theme-green {
  background: #769656;
  border-color: #4a5d23;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chess-board-container {
    padding: 0.5rem;
  }
  
  .board-info {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .coordinate-label {
    font-size: 0.7rem;
  }
  
  .row-coordinates.left {
    left: -20px;
  }
  
  .row-coordinates.right {
    right: -20px;
  }
  
  .col-coordinates.top {
    top: -20px;
  }
  
  .col-coordinates.bottom {
    bottom: -20px;
  }
}
</style>