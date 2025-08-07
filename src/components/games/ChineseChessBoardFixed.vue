<template>
  <div class="chinese-chess-board-fixed">
    <div class="board-container" :style="boardStyle" ref="boardContainer">
      <!-- 棋盘背景 -->
      <div class="board-background">
        <!-- 横线 (10条线，从0到9) -->
        <div 
          v-for="row in 10" 
          :key="`h-${row}`"
          class="board-line horizontal"
          :style="getHorizontalLineStyle(row - 1)"
        ></div>
        
        <!-- 竖线 (9条线，从0到8) -->
        <div 
          v-for="col in 9" 
          :key="`v-${col}`"
          class="board-line vertical"
          :style="getVerticalLineStyle(col - 1)"
        ></div>
        
        <!-- 九宫格对角线 -->
        <div class="palace-lines">
          <!-- 红方九宫 (底部) -->
          <div class="diagonal-line" :style="getRedPalaceLine1Style()"></div>
          <div class="diagonal-line" :style="getRedPalaceLine2Style()"></div>
          
          <!-- 黑方九宫 (顶部) -->
          <div class="diagonal-line" :style="getBlackPalaceLine1Style()"></div>
          <div class="diagonal-line" :style="getBlackPalaceLine2Style()"></div>
        </div>
        
        <!-- 楚河汉界 -->
        <div class="river-text">
          <div class="river-chu" :style="riverTextStyle">楚河</div>
          <div class="river-han" :style="riverTextStyle">汉界</div>
        </div>
      </div>
      
      <!-- 交叉点（棋子放置位置） -->
      <div 
        v-for="intersection in intersections" 
        :key="intersection.id"
        class="intersection"
        :class="getIntersectionClass(intersection)"
        :style="getIntersectionStyle(intersection)"
        @click="handleIntersectionClick(intersection)"
        @dragover.prevent
        @drop="handleDrop($event, intersection)"
      >
        <div class="intersection-point"></div>
      </div>
      
      <!-- 棋子 -->
      <div 
        v-for="piece in pieces" 
        :key="piece.id"
        class="chess-piece"
        :class="getPieceClass(piece)"
        :style="getPieceStyle(piece)"
        :draggable="isDraggable(piece)"
        @click="handlePieceClick(piece)"
        @dragstart="handleDragStart($event, piece)"
        @dragend="handleDragEnd"
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
        :class="{ 'can-capture': canCapture(move) }"
        :style="getValidMoveStyle(move)"
        @click="handleValidMoveClick(move)"
      ></div>
      
      <!-- 最后移动高亮 -->
      <div 
        v-if="lastMove && showLastMove"
        class="last-move-highlight from"
        :style="getHighlightStyle(lastMove.from)"
      ></div>
      <div 
        v-if="lastMove && showLastMove"
        class="last-move-highlight to"
        :style="getHighlightStyle(lastMove.to)"
      ></div>
    </div>
    
    <!-- 坐标标记 -->
    <div v-if="showCoordinates" class="coordinates">
      <div class="row-coordinates">
        <div 
          v-for="row in 10" 
          :key="`row-${row}`"
          class="coordinate-label"
          :style="getRowCoordinateStyle(row - 1)"
        >
          {{ 10 - row }}
        </div>
      </div>
      
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
import { computed, ref, reactive } from 'vue'
import { Square } from '../../utils/chess-types.js'

export default {
  name: 'ChineseChessBoardFixed',
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
    },
    showCoordinates: {
      type: Boolean,
      default: true
    },
    showLastMove: {
      type: Boolean,
      default: true
    }
  },
  emits: ['square-click', 'piece-click', 'piece-move'],
  setup(props, { emit }) {
    const boardContainer = ref(null)
    
    // 拖拽状态
    const dragState = reactive({
      isDragging: false,
      draggedPiece: null,
      startSquare: null
    })
    
    // 棋盘尺寸计算 - 中国象棋是9列10行
    const squareWidth = computed(() => props.boardSize / 8) // 8个间隔，9条竖线
    const squareHeight = computed(() => props.boardSize / 9) // 9个间隔，10条横线
    const boardHeight = computed(() => squareHeight.value * 9)
    
    // 棋盘样式
    const boardStyle = computed(() => ({
      width: `${props.boardSize}px`,
      height: `${boardHeight.value}px`
    }))
    
    // 生成所有交叉点（棋子可以放置的位置）
    const intersections = computed(() => {
      const points = []
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
          points.push({
            row,
            col,
            id: `${row}-${col}`,
            square: new Square(row, col)
          })
        }
      }
      return points
    })
    
    // 获取棋子列表
    const pieces = computed(() => {
      return props.game.board.getAllPieces()
    })
    
    // 样式计算方法
    const getIntersectionStyle = (intersection) => ({
      left: `${intersection.col * squareWidth.value}px`,
      top: `${intersection.row * squareHeight.value}px`,
      width: '20px',
      height: '20px',
      marginLeft: '-10px',
      marginTop: '-10px'
    })
    
    const getPieceStyle = (piece) => ({
      left: `${piece.position.col * squareWidth.value}px`,
      top: `${piece.position.row * squareHeight.value}px`,
      width: `${Math.min(squareWidth.value, squareHeight.value) * 0.9}px`,
      height: `${Math.min(squareWidth.value, squareHeight.value) * 0.9}px`,
      marginLeft: `${-Math.min(squareWidth.value, squareHeight.value) * 0.45}px`,
      marginTop: `${-Math.min(squareWidth.value, squareHeight.value) * 0.45}px`,
      zIndex: dragState.draggedPiece === piece ? 1000 : 10
    })
    
    const getHighlightStyle = (square) => ({
      left: `${square.col * squareWidth.value}px`,
      top: `${square.row * squareHeight.value}px`,
      width: `${Math.min(squareWidth.value, squareHeight.value) * 0.95}px`,
      height: `${Math.min(squareWidth.value, squareHeight.value) * 0.95}px`,
      marginLeft: `${-Math.min(squareWidth.value, squareHeight.value) * 0.475}px`,
      marginTop: `${-Math.min(squareWidth.value, squareHeight.value) * 0.475}px`
    })
    
    const getValidMoveStyle = (move) => ({
      left: `${move.col * squareWidth.value}px`,
      top: `${move.row * squareHeight.value}px`,
      width: '16px',
      height: '16px',
      marginLeft: '-8px',
      marginTop: '-8px'
    })
    
    // 棋盘线条样式
    const getHorizontalLineStyle = (row) => {
      const y = row * squareHeight.value
      
      // 楚河汉界之间不画横线
      if (row === 4 || row === 5) {
        return {
          display: 'none'
        }
      }
      
      return {
        top: `${y}px`,
        left: '0px',
        width: `${props.boardSize}px`,
        height: '2px'
      }
    }
    
    const getVerticalLineStyle = (col) => {
      const x = col * squareWidth.value
      
      // 中间三列在楚河汉界处断开
      if (col >= 3 && col <= 5) {
        return [
          {
            left: `${x}px`,
            top: '0px',
            width: '2px',
            height: `${squareHeight.value * 4.5}px`
          },
          {
            left: `${x}px`,
            top: `${squareHeight.value * 5.5}px`,
            width: '2px',
            height: `${squareHeight.value * 4.5}px`
          }
        ]
      }
      
      return {
        left: `${x}px`,
        top: '0px',
        width: '2px',
        height: `${boardHeight.value}px`
      }
    }
    
    // 九宫格对角线样式
    const getRedPalaceLine1Style = () => {
      const startX = 3 * squareWidth.value
      const startY = 0 * squareHeight.value
      const endX = 5 * squareWidth.value
      const endY = 2 * squareHeight.value
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
      
      return {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        height: '2px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0'
      }
    }
    
    const getRedPalaceLine2Style = () => {
      const startX = 5 * squareWidth.value
      const startY = 0 * squareHeight.value
      const endX = 3 * squareWidth.value
      const endY = 2 * squareHeight.value
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
      
      return {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        height: '2px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0'
      }
    }
    
    const getBlackPalaceLine1Style = () => {
      const startX = 3 * squareWidth.value
      const startY = 7 * squareHeight.value
      const endX = 5 * squareWidth.value
      const endY = 9 * squareHeight.value
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
      
      return {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        height: '2px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0'
      }
    }
    
    const getBlackPalaceLine2Style = () => {
      const startX = 5 * squareWidth.value
      const startY = 7 * squareHeight.value
      const endX = 3 * squareWidth.value
      const endY = 9 * squareHeight.value
      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
      const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
      
      return {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${length}px`,
        height: '2px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0'
      }
    }
    
    // 楚河汉界文字样式
    const riverTextStyle = computed(() => ({
      fontSize: `${Math.min(squareWidth.value, squareHeight.value) * 0.3}px`,
      lineHeight: `${squareHeight.value}px`
    }))
    
    // 坐标样式
    const getRowCoordinateStyle = (row) => ({
      top: `${row * squareHeight.value - 10}px`,
      right: '-30px'
    })
    
    const getColCoordinateStyle = (col) => ({
      left: `${col * squareWidth.value - 10}px`,
      bottom: '-30px'
    })
    
    // CSS类计算
    const getIntersectionClass = (intersection) => ({
      'intersection': true,
      'selected': props.selectedSquare && intersection.square.equals(props.selectedSquare),
      'valid-move': props.validMoves.some(move => move.equals(intersection.square))
    })
    
    const getPieceClass = (piece) => ({
      'chess-piece': true,
      'red-piece': piece.color === 'red',
      'black-piece': piece.color === 'black',
      'selected': props.selectedSquare && piece.position.equals(props.selectedSquare),
      'dragging': dragState.draggedPiece === piece,
      'draggable': isDraggable(piece)
    })
    
    // 工具方法
    const isDraggable = (piece) => {
      return piece.color === props.game.currentPlayer
    }
    
    const canCapture = (square) => {
      const piece = props.game.board.getPieceAt(square)
      return piece && piece.color !== props.game.currentPlayer
    }
    
    // 事件处理
    const handleIntersectionClick = (intersection) => {
      if (dragState.isDragging) return
      emit('square-click', intersection.square)
    }
    
    const handlePieceClick = (piece) => {
      if (dragState.isDragging) return
      emit('piece-click', piece)
    }
    
    const handleValidMoveClick = (square) => {
      if (props.selectedSquare) {
        emit('square-click', square)
      }
    }
    
    const handleDragStart = (event, piece) => {
      if (!isDraggable(piece)) {
        event.preventDefault()
        return
      }
      
      dragState.isDragging = true
      dragState.draggedPiece = piece
      dragState.startSquare = piece.position
      
      event.dataTransfer.setData('text/plain', piece.id)
      event.dataTransfer.effectAllowed = 'move'
      
      // 隐藏默认拖拽图像
      const dragImage = new Image()
      dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
      event.dataTransfer.setDragImage(dragImage, 0, 0)
      
      emit('piece-click', piece)
    }
    
    const handleDragEnd = () => {
      dragState.isDragging = false
      dragState.draggedPiece = null
      dragState.startSquare = null
    }
    
    const handleDrop = (event, intersection) => {
      event.preventDefault()
      
      if (!dragState.isDragging || !dragState.draggedPiece) return
      
      const piece = dragState.draggedPiece
      const fromSquare = dragState.startSquare
      const toSquare = intersection.square
      
      if (!fromSquare.equals(toSquare)) {
        emit('piece-move', {
          piece,
          from: fromSquare,
          to: toSquare
        })
      }
      
      handleDragEnd()
    }
    
    return {
      boardContainer,
      dragState,
      boardStyle,
      intersections,
      pieces,
      squareWidth,
      squareHeight,
      getIntersectionStyle,
      getPieceStyle,
      getHighlightStyle,
      getValidMoveStyle,
      getHorizontalLineStyle,
      getVerticalLineStyle,
      getRedPalaceLine1Style,
      getRedPalaceLine2Style,
      getBlackPalaceLine1Style,
      getBlackPalaceLine2Style,
      riverTextStyle,
      getRowCoordinateStyle,
      getColCoordinateStyle,
      getIntersectionClass,
      getPieceClass,
      isDraggable,
      canCapture,
      handleIntersectionClick,
      handlePieceClick,
      handleValidMoveClick,
      handleDragStart,
      handleDragEnd,
      handleDrop
    }
  }
}
</script>

<style scoped>
.chinese-chess-board-fixed {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #f4e4bc 0%, #e8d5a3 100%);
  border: 4px solid #8b4513;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.board-container {
  position: relative;
  background: linear-gradient(135deg, #f4e4bc 0%, #e8d5a3 100%);
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  background: #8b4513;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.river-text {
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  height: 10%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  pointer-events: none;
}

.river-chu,
.river-han {
  color: #8b4513;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.5em;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.intersection {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.intersection:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.intersection-point {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b4513;
  opacity: 0.3;
  transition: all 0.2s ease;
}

.intersection:hover .intersection-point {
  opacity: 0.6;
  transform: scale(1.3);
}

.chess-piece {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.chess-piece.draggable {
  cursor: grab;
}

.chess-piece.dragging {
  cursor: grabbing;
  opacity: 0.8;
  transform: scale(1.1);
  z-index: 1000;
}

.chess-piece:hover {
  transform: scale(1.05);
}

.piece-content {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  border: 3px solid;
  position: relative;
}

.red-piece .piece-content {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 50%, #ef5350 100%);
  border-color: #d32f2f;
  color: #d32f2f;
}

.black-piece .piece-content {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #757575 100%);
  border-color: #333;
  color: #333;
}

.piece-text {
  font-size: 0.7em;
  font-weight: bold;
  text-align: center;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.chess-piece.selected .piece-content {
  box-shadow: 
    0 0 0 4px #2196f3,
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  animation: selectedPulse 1.5s infinite;
}

.selection-highlight {
  position: absolute;
  border: 4px solid #2196f3;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.1);
  z-index: 5;
  animation: pulse 1.5s infinite;
  pointer-events: none;
}

.valid-move-hint {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.7);
  z-index: 5;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.valid-move-hint:hover {
  background: rgba(76, 175, 80, 0.9);
  transform: scale(1.2);
}

.valid-move-hint.can-capture {
  background: rgba(244, 67, 54, 0.7);
  box-shadow: 0 2px 6px rgba(244, 67, 54, 0.3);
}

.valid-move-hint.can-capture:hover {
  background: rgba(244, 67, 54, 0.9);
}

.last-move-highlight {
  position: absolute;
  border: 3px solid #ff9800;
  border-radius: 50%;
  background: rgba(255, 152, 0, 0.1);
  z-index: 4;
  pointer-events: none;
}

.last-move-highlight.from {
  border-style: dashed;
  animation: fadeInOut 2s infinite;
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
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0%, 100% { 
    opacity: 0.6; 
    transform: scale(1);
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05);
  }
}

@keyframes selectedPulse {
  0%, 100% { 
    box-shadow: 
      0 0 0 4px #2196f3,
      0 4px 12px rgba(0, 0, 0, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }
  50% { 
    box-shadow: 
      0 0 0 6px rgba(33, 150, 243, 0.7),
      0 6px 16px rgba(0, 0, 0, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@media (max-width: 768px) {
  .chinese-chess-board-fixed {
    padding: 20px;
  }
  
  .piece-text {
    font-size: 0.6em;
  }
  
  .coordinate-label {
    font-size: 10px;
    width: 16px;
    height: 16px;
  }
}
</style>