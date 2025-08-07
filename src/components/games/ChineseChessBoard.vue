<template>
  <div class="chinese-chess-board">
    <div class="board-container" :style="boardStyle">
      <!-- 棋盘背景 -->
      <div class="board-background">
        <!-- 横线 -->
        <div 
          v-for="row in 10" 
          :key="`h-${row}`"
          class="board-line horizontal"
          :style="getHorizontalLineStyle(row - 1)"
        ></div>
        
        <!-- 竖线 -->
        <div 
          v-for="col in 9" 
          :key="`v-${col}`"
          class="board-line vertical"
          :style="getVerticalLineStyle(col - 1)"
        ></div>
        
        <!-- 九宫格对角线 -->
        <div class="palace-lines">
          <!-- 红方九宫 -->
          <div class="diagonal-line red-palace-1" :style="redPalaceLine1Style"></div>
          <div class="diagonal-line red-palace-2" :style="redPalaceLine2Style"></div>
          
          <!-- 黑方九宫 -->
          <div class="diagonal-line black-palace-1" :style="blackPalaceLine1Style"></div>
          <div class="diagonal-line black-palace-2" :style="blackPalaceLine2Style"></div>
        </div>
        
        <!-- 楚河汉界 -->
        <div class="river-text">
          <div class="river-chu" :style="riverTextStyle">楚河</div>
          <div class="river-han" :style="riverTextStyle">汉界</div>
        </div>
      </div>
      
      <!-- 棋盘格子 -->
      <div 
        v-for="square in boardSquares" 
        :key="square.id"
        class="board-square"
        :class="getSquareClass(square)"
        :style="getSquareStyle(square)"
        @click="handleSquareClick(square)"
      >
        <!-- 交叉点标记 -->
        <div class="intersection-point"></div>
      </div>
      
      <!-- 棋子 -->
      <div 
        v-for="piece in pieces" 
        :key="piece.id"
        class="chess-piece"
        :class="getPieceClass(piece)"
        :style="getPieceStyle(piece)"
        @click="handlePieceClick(piece)"
      >
        <div class="piece-content">
          <span class="piece-text">{{ piece.getChineseName() }}</span>
        </div>
      </div>
      
      <!-- 选中高亮 -->
      <div 
        v-if="selectedSquare"
        class="selection-highlight"
        :style="getHighlightStyle(selectedSquare)"
      ></div>
      
      <!-- 有效移动提示 -->
      <div 
        v-for="move in validMoves" 
        :key="`move-${move.row}-${move.col}`"
        class="valid-move-hint"
        :style="getValidMoveStyle(move)"
      ></div>
      
      <!-- 最后移动高亮 -->
      <div 
        v-if="lastMove"
        class="last-move-highlight from"
        :style="getHighlightStyle(lastMove.from)"
      ></div>
      <div 
        v-if="lastMove"
        class="last-move-highlight to"
        :style="getHighlightStyle(lastMove.to)"
      ></div>
    </div>
    
    <!-- 坐标标记 -->
    <div class="coordinates">
      <!-- 行坐标 -->
      <div class="row-coordinates">
        <div 
          v-for="row in 10" 
          :key="`row-${row}`"
          class="coordinate-label"
          :style="getRowCoordinateStyle(row - 1)"
        >
          {{ 10 - row + 1 }}
        </div>
      </div>
      
      <!-- 列坐标 -->
      <div class="col-coordinates">
        <div 
          v-for="col in 9" 
          :key="`col-${col}`"
          class="coordinate-label"
          :style="getColCoordinateStyle(col - 1)"
        >
          {{ col }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { Square } from '../../utils/chess-types.js'

export default {
  name: 'ChineseChessBoard',
  props: {
    game: {
      type: Object,
      required: true
    },
    selectedSquare: {
      type: Object,
      default: null
    },
    validMoves: {
      type: Array,
      default: () => []
    },
    lastMove: {
      type: Object,
      default: null
    },
    boardSize: {
      type: Number,
      default: 480
    }
  },
  emits: ['square-click', 'piece-click'],
  setup(props, { emit }) {
    // 棋盘尺寸计算
    const squareSize = computed(() => props.boardSize / 9) // 中国象棋是9列
    const boardHeight = computed(() => (props.boardSize / 9) * 10) // 10行
    
    // 棋盘样式
    const boardStyle = computed(() => ({
      width: `${props.boardSize}px`,
      height: `${boardHeight.value}px`
    }))
    
    // 生成棋盘格子
    const boardSquares = computed(() => {
      const squares = []
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
          squares.push({
            row,
            col,
            id: `${row}-${col}`,
            square: new Square(row, col)
          })
        }
      }
      return squares
    })
    
    // 获取棋子列表
    const pieces = computed(() => {
      return props.game.board.getAllPieces()
    })
    
    // 样式计算方法
    const getSquareStyle = (square) => ({
      left: `${square.col * squareSize.value}px`,
      top: `${square.row * squareSize.value}px`,
      width: `${squareSize.value}px`,
      height: `${squareSize.value}px`
    })
    
    const getPieceStyle = (piece) => ({
      left: `${piece.position.col * squareSize.value}px`,
      top: `${piece.position.row * squareSize.value}px`,
      width: `${squareSize.value}px`,
      height: `${squareSize.value}px`
    })
    
    const getHighlightStyle = (square) => ({
      left: `${square.col * squareSize.value}px`,
      top: `${square.row * squareSize.value}px`,
      width: `${squareSize.value}px`,
      height: `${squareSize.value}px`
    })
    
    const getValidMoveStyle = (move) => ({
      left: `${move.col * squareSize.value + squareSize.value / 2 - 8}px`,
      top: `${move.row * squareSize.value + squareSize.value / 2 - 8}px`
    })
    
    // 棋盘线条样式
    const getHorizontalLineStyle = (row) => {
      const y = row * squareSize.value
      let width = props.boardSize
      
      // 楚河汉界处的线条处理
      if (row === 4 || row === 5) {
        return {
          top: `${y}px`,
          left: '0px',
          width: `${squareSize.value * 3}px`,
          height: '2px'
        }
      }
      
      return {
        top: `${y}px`,
        left: '0px',
        width: `${width}px`,
        height: '2px'
      }
    }
    
    const getVerticalLineStyle = (col) => {
      const x = col * squareSize.value
      let height = boardHeight.value
      let top = 0
      
      // 中间三列在楚河汉界处断开
      if (col >= 3 && col <= 5) {
        if (col === 3 || col === 5) {
          // 边界列，分两段
          return [
            {
              left: `${x}px`,
              top: '0px',
              width: '2px',
              height: `${squareSize.value * 5}px`
            },
            {
              left: `${x}px`,
              top: `${squareSize.value * 5}px`,
              width: '2px',
              height: `${squareSize.value * 5}px`
            }
          ]
        } else {
          // 中间列，完整线条
          return {
            left: `${x}px`,
            top: `${top}px`,
            width: '2px',
            height: `${height}px`
          }
        }
      }
      
      return {
        left: `${x}px`,
        top: `${top}px`,
        width: '2px',
        height: `${height}px`
      }
    }
    
    // 九宫格对角线样式
    const redPalaceLine1Style = computed(() => ({
      left: `${3 * squareSize.value}px`,
      top: `${0 * squareSize.value}px`,
      width: `${Math.sqrt(2) * squareSize.value * 2}px`,
      transform: 'rotate(45deg)',
      transformOrigin: '0 0'
    }))
    
    const redPalaceLine2Style = computed(() => ({
      left: `${5 * squareSize.value}px`,
      top: `${0 * squareSize.value}px`,
      width: `${Math.sqrt(2) * squareSize.value * 2}px`,
      transform: 'rotate(-45deg)',
      transformOrigin: '0 0'
    }))
    
    const blackPalaceLine1Style = computed(() => ({
      left: `${3 * squareSize.value}px`,
      top: `${8 * squareSize.value}px`,
      width: `${Math.sqrt(2) * squareSize.value * 2}px`,
      transform: 'rotate(45deg)',
      transformOrigin: '0 0'
    }))
    
    const blackPalaceLine2Style = computed(() => ({
      left: `${5 * squareSize.value}px`,
      top: `${8 * squareSize.value}px`,
      width: `${Math.sqrt(2) * squareSize.value * 2}px`,
      transform: 'rotate(-45deg)',
      transformOrigin: '0 0'
    }))
    
    // 楚河汉界文字样式
    const riverTextStyle = computed(() => ({
      fontSize: `${squareSize.value * 0.3}px`,
      lineHeight: `${squareSize.value}px`
    }))
    
    // 坐标样式
    const getRowCoordinateStyle = (row) => ({
      top: `${row * squareSize.value + squareSize.value / 2 - 10}px`,
      right: '-30px'
    })
    
    const getColCoordinateStyle = (col) => ({
      left: `${col * squareSize.value + squareSize.value / 2 - 10}px`,
      bottom: '-30px'
    })
    
    // CSS类计算
    const getSquareClass = (square) => ({
      'board-square': true,
      'selected': props.selectedSquare && square.square.equals(props.selectedSquare),
      'valid-move': props.validMoves.some(move => move.equals(square.square))
    })
    
    const getPieceClass = (piece) => ({
      'chess-piece': true,
      'red-piece': piece.color === 'red',
      'black-piece': piece.color === 'black',
      'selected': props.selectedSquare && piece.position.equals(props.selectedSquare)
    })
    
    // 事件处理
    const handleSquareClick = (square) => {
      emit('square-click', square.square)
    }
    
    const handlePieceClick = (piece) => {
      emit('piece-click', piece)
    }
    
    return {
      boardStyle,
      boardSquares,
      pieces,
      squareSize,
      getSquareStyle,
      getPieceStyle,
      getHighlightStyle,
      getValidMoveStyle,
      getHorizontalLineStyle,
      getVerticalLineStyle,
      redPalaceLine1Style,
      redPalaceLine2Style,
      blackPalaceLine1Style,
      blackPalaceLine2Style,
      riverTextStyle,
      getRowCoordinateStyle,
      getColCoordinateStyle,
      getSquareClass,
      getPieceClass,
      handleSquareClick,
      handlePieceClick
    }
  }
}
</script>

<style scoped>
.chinese-chess-board {
  position: relative;
  display: inline-block;
  background: #f4e4bc;
  border: 3px solid #8b4513;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.board-container {
  position: relative;
  background: #f4e4bc;
}

.board-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.board-line {
  position: absolute;
  background: #8b4513;
}

.board-line.horizontal {
  height: 2px;
}

.board-line.vertical {
  width: 2px;
}

.palace-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.diagonal-line {
  position: absolute;
  height: 2px;
  background: #8b4513;
}

.river-text {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-around;
  pointer-events: none;
}

.river-chu,
.river-han {
  color: #8b4513;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.5em;
}

.board-square {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intersection-point {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b4513;
  opacity: 0.3;
}

.chess-piece {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.chess-piece:hover {
  transform: scale(1.05);
}

.piece-content {
  width: 85%;
  height: 85%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid;
  position: relative;
}

.red-piece .piece-content {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #d32f2f;
  color: #d32f2f;
}

.black-piece .piece-content {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-color: #333;
  color: #333;
}

.piece-text {
  font-size: 0.7em;
  font-weight: bold;
  text-align: center;
  line-height: 1;
}

.chess-piece.selected .piece-content {
  box-shadow: 0 0 0 3px #2196f3, 0 4px 12px rgba(0, 0, 0, 0.3);
}

.selection-highlight {
  position: absolute;
  border: 3px solid #2196f3;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.1);
  z-index: 5;
  animation: pulse 1s infinite;
}

.valid-move-hint {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.6);
  z-index: 5;
  animation: bounce 1s infinite;
}

.last-move-highlight {
  position: absolute;
  border: 2px solid #ff9800;
  border-radius: 50%;
  background: rgba(255, 152, 0, 0.1);
  z-index: 4;
}

.last-move-highlight.from {
  border-style: dashed;
}

.last-move-highlight.to {
  border-style: solid;
}

.coordinates {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.row-coordinates,
.col-coordinates {
  position: absolute;
}

.coordinate-label {
  position: absolute;
  font-size: 12px;
  font-weight: bold;
  color: #8b4513;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .chinese-chess-board {
    padding: 10px;
  }
  
  .piece-text {
    font-size: 0.6em;
  }
  
  .coordinate-label {
    font-size: 10px;
  }
}
</style>