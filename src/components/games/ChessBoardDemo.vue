<template>
  <div class="chess-board-demo">
    <div class="demo-header">
      <h2>棋盘组件演示</h2>
      <p>这是一个通用棋盘组件的演示，展示了基本功能和交互</p>
    </div>
    
    <div class="demo-controls">
      <div class="control-group">
        <label>棋盘大小：</label>
        <select v-model="boardSize" @change="resetBoard">
          <option :value="8">8x8 (国际象棋)</option>
          <option :value="10">10x10 (中国象棋)</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>棋盘主题：</label>
        <select v-model="boardTheme">
          <option value="classic">经典</option>
          <option value="wood">木质</option>
          <option value="marble">大理石</option>
          <option value="green">绿色</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showCoordinates">
          显示坐标
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showInfo">
          显示信息栏
        </label>
      </div>
      
      <div class="control-group">
        <button class="btn" @click="addRandomPiece">添加随机棋子</button>
        <button class="btn btn-secondary" @click="clearBoard">清空棋盘</button>
        <button class="btn btn-secondary" @click="resetBoard">重置演示</button>
      </div>
    </div>
    
    <div class="demo-board">
      <ChessBoard
        :board-size="boardSize"
        :pieces="pieces"
        :selected-square="selectedSquare"
        :valid-moves="validMoves"
        :current-player="currentPlayer"
        :game-status="gameStatus"
        :last-move="lastMove"
        :captured-pieces="capturedPieces"
        :board-theme="boardTheme"
        :show-coordinates="showCoordinates"
        :show-info="showInfo"
        :show-captured-pieces="true"
        :board-pixel-size="480"
        @square-click="handleSquareClick"
        @piece-click="handlePieceClick"
        @piece-move="handlePieceMove"
        @piece-drag-start="handlePieceDragStart"
        @piece-drag-end="handlePieceDragEnd"
      />
    </div>
    
    <div class="demo-info">
      <div class="info-section">
        <h3>操作说明</h3>
        <ul>
          <li>点击棋子选择，再点击目标位置移动</li>
          <li>可以拖拽棋子到目标位置</li>
          <li>选中的棋子会高亮显示</li>
          <li>有效移动位置会显示提示</li>
          <li>最后移动的位置会有特殊标记</li>
        </ul>
      </div>
      
      <div class="info-section">
        <h3>当前状态</h3>
        <div class="status-info">
          <div><strong>当前玩家：</strong>{{ playerNames[currentPlayer] }}</div>
          <div><strong>游戏状态：</strong>{{ statusNames[gameStatus] }}</div>
          <div><strong>棋子数量：</strong>{{ pieces.length }}</div>
          <div><strong>被吃棋子：</strong>{{ capturedPieces.length }}</div>
          <div v-if="selectedSquare"><strong>选中位置：</strong>{{ formatSquare(selectedSquare) }}</div>
          <div v-if="lastMove"><strong>最后移动：</strong>{{ formatMove(lastMove) }}</div>
        </div>
      </div>
      
      <div class="info-section">
        <h3>事件日志</h3>
        <div class="event-log">
          <div 
            v-for="(event, index) in eventLog" 
            :key="index"
            class="log-entry"
            :class="event.type"
          >
            <span class="log-time">{{ event.time }}</span>
            <span class="log-message">{{ event.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import ChessBoard from './ChessBoard.vue'
import { Square, ChessPiece, ChessUtils } from '../../utils/chess-types.js'

export default {
  name: 'ChessBoardDemo',
  components: {
    ChessBoard
  },
  setup() {
    // 响应式数据
    const boardSize = ref(8)
    const boardTheme = ref('classic')
    const showCoordinates = ref(true)
    const showInfo = ref(true)
    const currentPlayer = ref('white')
    const gameStatus = ref('playing')
    
    const pieces = ref([])
    const selectedSquare = ref(null)
    const validMoves = ref([])
    const lastMove = ref(null)
    const capturedPieces = ref([])
    const eventLog = ref([])
    
    // 常量
    const playerNames = {
      white: '白方',
      black: '黑方',
      red: '红方'
    }
    
    const statusNames = {
      playing: '进行中',
      check: '将军',
      checkmate: '将死',
      stalemate: '僵局',
      draw: '平局'
    }
    
    const pieceTypes = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn']
    const colors = ['white', 'black']
    
    // 工具方法
    const addLogEntry = (type, message) => {
      const time = new Date().toLocaleTimeString()
      eventLog.value.unshift({ type, message, time })
      if (eventLog.value.length > 20) {
        eventLog.value.pop()
      }
    }
    
    const formatSquare = (square) => {
      return ChessUtils.squareToAlgebraic(square)
    }
    
    const formatMove = (move) => {
      return `${formatSquare(move.from)} → ${formatSquare(move.to)}`
    }
    
    const getRandomSquare = () => {
      const row = Math.floor(Math.random() * boardSize.value)
      const col = Math.floor(Math.random() * boardSize.value)
      return new Square(row, col)
    }
    
    const isSquareOccupied = (square) => {
      return pieces.value.some(piece => 
        piece.position.row === square.row && piece.position.col === square.col
      )
    }
    
    // 事件处理
    const handleSquareClick = (square) => {
      addLogEntry('click', `点击格子: ${formatSquare(square)}`)
      
      // 如果有选中的棋子，尝试移动
      if (selectedSquare.value) {
        const selectedPiece = pieces.value.find(piece =>
          piece.position.equals(selectedSquare.value)
        )
        
        if (selectedPiece && !square.equals(selectedSquare.value)) {
          handlePieceMove({
            piece: selectedPiece,
            from: selectedSquare.value,
            to: square
          })
          return
        }
      }
      
      // 选择新的格子
      const pieceAtSquare = pieces.value.find(piece => piece.position.equals(square))
      if (pieceAtSquare) {
        selectedSquare.value = square
        // 模拟生成有效移动（实际应该根据棋子类型和游戏规则）
        validMoves.value = generateMockValidMoves(pieceAtSquare)
        addLogEntry('select', `选中棋子: ${pieceAtSquare.type}`)
      } else {
        selectedSquare.value = null
        validMoves.value = []
      }
    }
    
    const handlePieceClick = (piece) => {
      addLogEntry('click', `点击棋子: ${piece.color} ${piece.type}`)
      selectedSquare.value = piece.position
      validMoves.value = generateMockValidMoves(piece)
    }
    
    const handlePieceMove = (moveData) => {
      const { piece, from, to } = moveData
      
      // 检查目标位置是否有棋子
      const targetPiece = pieces.value.find(p => p.position.equals(to))
      if (targetPiece && targetPiece.color !== piece.color) {
        // 吃子
        capturedPieces.value.push(targetPiece)
        pieces.value = pieces.value.filter(p => p.id !== targetPiece.id)
        addLogEntry('capture', `${piece.color} ${piece.type} 吃掉 ${targetPiece.color} ${targetPiece.type}`)
      }
      
      // 移动棋子
      piece.position = to
      piece.hasMoved = true
      
      // 更新状态
      lastMove.value = { from, to, piece }
      selectedSquare.value = null
      validMoves.value = []
      
      // 切换玩家
      currentPlayer.value = currentPlayer.value === 'white' ? 'black' : 'white'
      
      addLogEntry('move', `${piece.color} ${piece.type}: ${formatMove({ from, to })}`)
    }
    
    const handlePieceDragStart = (piece) => {
      addLogEntry('drag', `开始拖拽: ${piece.color} ${piece.type}`)
      selectedSquare.value = piece.position
      validMoves.value = generateMockValidMoves(piece)
    }
    
    const handlePieceDragEnd = () => {
      addLogEntry('drag', '拖拽结束')
    }
    
    // 生成模拟的有效移动（简化版本）
    const generateMockValidMoves = (piece) => {
      const moves = []
      const { row, col } = piece.position
      
      // 根据棋子类型生成不同的移动模式
      switch (piece.type) {
        case 'king':
          // 王可以向任意方向移动一格
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const newRow = row + dr
              const newCol = col + dc
              if (ChessUtils.isValidSquare(new Square(newRow, newCol), boardSize.value)) {
                moves.push(new Square(newRow, newCol))
              }
            }
          }
          break
          
        case 'rook':
          // 车可以横竖移动
          for (let i = 0; i < boardSize.value; i++) {
            if (i !== row) moves.push(new Square(i, col))
            if (i !== col) moves.push(new Square(row, i))
          }
          break
          
        case 'bishop':
          // 象可以斜向移动
          for (let i = 1; i < boardSize.value; i++) {
            const positions = [
              new Square(row + i, col + i),
              new Square(row + i, col - i),
              new Square(row - i, col + i),
              new Square(row - i, col - i)
            ]
            positions.forEach(pos => {
              if (ChessUtils.isValidSquare(pos, boardSize.value)) {
                moves.push(pos)
              }
            })
          }
          break
          
        default:
          // 其他棋子的简化移动
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              if (dr === 0 && dc === 0) continue
              const newRow = row + dr
              const newCol = col + dc
              if (ChessUtils.isValidSquare(new Square(newRow, newCol), boardSize.value)) {
                moves.push(new Square(newRow, newCol))
              }
            }
          }
      }
      
      return moves.slice(0, 8) // 限制显示的移动数量
    }
    
    // 控制方法
    const addRandomPiece = () => {
      let square
      let attempts = 0
      
      // 找一个空位置
      do {
        square = getRandomSquare()
        attempts++
      } while (isSquareOccupied(square) && attempts < 50)
      
      if (attempts >= 50) {
        addLogEntry('error', '棋盘已满，无法添加更多棋子')
        return
      }
      
      const color = colors[Math.floor(Math.random() * colors.length)]
      const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
      const id = `${color}-${type}-${Date.now()}`
      
      const piece = new ChessPiece(id, type, color, square)
      pieces.value.push(piece)
      
      addLogEntry('add', `添加棋子: ${color} ${type} 在 ${formatSquare(square)}`)
    }
    
    const clearBoard = () => {
      pieces.value = []
      capturedPieces.value = []
      selectedSquare.value = null
      validMoves.value = []
      lastMove.value = null
      addLogEntry('clear', '清空棋盘')
    }
    
    const resetBoard = () => {
      clearBoard()
      currentPlayer.value = 'white'
      gameStatus.value = 'playing'
      eventLog.value = []
      
      // 添加一些初始棋子
      const initialPieces = [
        new ChessPiece('white-king', 'king', 'white', new Square(0, 4)),
        new ChessPiece('black-king', 'king', 'black', new Square(boardSize.value - 1, 4)),
        new ChessPiece('white-rook1', 'rook', 'white', new Square(0, 0)),
        new ChessPiece('white-rook2', 'rook', 'white', new Square(0, boardSize.value - 1)),
        new ChessPiece('black-rook1', 'rook', 'black', new Square(boardSize.value - 1, 0)),
        new ChessPiece('black-rook2', 'rook', 'black', new Square(boardSize.value - 1, boardSize.value - 1))
      ]
      
      pieces.value = initialPieces
      addLogEntry('reset', '重置棋盘演示')
    }
    
    // 初始化
    resetBoard()
    
    return {
      // 数据
      boardSize,
      boardTheme,
      showCoordinates,
      showInfo,
      currentPlayer,
      gameStatus,
      pieces,
      selectedSquare,
      validMoves,
      lastMove,
      capturedPieces,
      eventLog,
      
      // 常量
      playerNames,
      statusNames,
      
      // 方法
      formatSquare,
      formatMove,
      handleSquareClick,
      handlePieceClick,
      handlePieceMove,
      handlePieceDragStart,
      handlePieceDragEnd,
      addRandomPiece,
      clearBoard,
      resetBoard
    }
  }
}
</script>

<style scoped>
.chess-board-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  text-align: center;
  margin-bottom: 2rem;
}

.demo-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.demo-header p {
  color: #666;
}

.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.control-group select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group input[type="checkbox"] {
  margin-right: 0.25rem;
}

.demo-board {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.demo-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.info-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  color: #666;
}

.info-section li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #666;
}

.event-log {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 0.5rem;
}

.log-entry {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 3px;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.log-entry.click {
  background: rgba(0, 123, 255, 0.1);
}

.log-entry.move {
  background: rgba(40, 167, 69, 0.1);
}

.log-entry.capture {
  background: rgba(220, 53, 69, 0.1);
}

.log-entry.drag {
  background: rgba(255, 193, 7, 0.1);
}

.log-entry.error {
  background: rgba(220, 53, 69, 0.2);
}

.log-time {
  font-size: 0.8rem;
  color: #666;
  min-width: 80px;
}

.log-message {
  color: #333;
}

@media (max-width: 768px) {
  .chess-board-demo {
    padding: 1rem;
  }
  
  .demo-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: space-between;
  }
  
  .demo-info {
    grid-template-columns: 1fr;
  }
}
</style>