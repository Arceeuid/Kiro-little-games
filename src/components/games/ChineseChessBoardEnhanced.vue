<template>
  <div class="chinese-chess-board-enhanced">
    <div class="board-container" :style="boardStyle" ref="boardContainer">
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
          <div class="diagonal-line red-palace-1" :style="redPalaceLine1Style"></div>
          <div class="diagonal-line red-palace-2" :style="redPalaceLine2Style"></div>
          <div class="diagonal-line black-palace-1" :style="blackPalaceLine1Style"></div>
          <div class="diagonal-line black-palace-2" :style="blackPalaceLine2Style"></div>
        </div>
        
        <!-- 楚河汉界 -->
        <div class="river-text">
          <div class="river-chu" :style="riverTextStyle">楚河</div>
          <div class="river-han" :style="riverTextStyle">汉界</div>
        </div>
        
        <!-- 特殊位置标记 -->
        <div class="position-markers">
          <div 
            v-for="marker in positionMarkers" 
            :key="marker.id"
            class="position-marker"
            :style="getMarkerStyle(marker)"
          ></div>
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
        @dragover.prevent
        @drop="handleDrop($event, square)"
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
          <div class="piece-shadow"></div>
        </div>
      </div>
      
      <!-- 选中高亮 -->
      <div 
        v-if="selectedSquare"
        class="selection-highlight"
        :style="getHighlightStyle(selectedSquare)"
      >
        <div class="selection-ring"></div>
      </div>
      
      <!-- 有效移动提示 -->
      <div 
        v-for="move in validMoves" 
        :key="`move-${move.row}-${move.col}`"
        class="valid-move-hint"
        :class="{ 'can-capture': canCapture(move) }"
        :style="getValidMoveStyle(move)"
        @click="handleValidMoveClick(move)"
      >
        <div class="move-dot"></div>
      </div>
      
      <!-- 最后移动高亮 -->
      <div 
        v-if="lastMove && showLastMove"
        class="last-move-highlight from"
        :style="getHighlightStyle(lastMove.from)"
      >
        <div class="move-arrow" :style="getArrowStyle()"></div>
      </div>
      <div 
        v-if="lastMove && showLastMove"
        class="last-move-highlight to"
        :style="getHighlightStyle(lastMove.to)"
      ></div>
      
      <!-- 拖拽预览 -->
      <div 
        v-if="dragPreview.show"
        class="drag-preview"
        :style="dragPreview.style"
      >
        <div class="piece-content preview">
          <span class="piece-text">{{ dragPreview.piece?.getChineseName() }}</span>
        </div>
      </div>
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
          {{ 10 - row + 1 }}
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
  name: 'ChineseChessBoardEnhanced',
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
    
    // 拖拽预览
    const dragPreview = reactive({
      show: false,
      piece: null,
      style: {}
    })
    
    // 棋盘尺寸计算
    const squareSize = computed(() => props.boardSize / 9)
    const boardHeight = computed(() => (props.boardSize / 9) * 10)
    
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
    
    // 位置标记（兵线、炮位等）
    const positionMarkers = computed(() => {
      const markers = []
      
      // 兵线标记
      const soldierPositions = [
        { row: 3, col: 0 }, { row: 3, col: 2 }, { row: 3, col: 4 }, { row: 3, col: 6 }, { row: 3, col: 8 },
        { row: 6, col: 0 }, { row: 6, col: 2 }, { row: 6, col: 4 }, { row: 6, col: 6 }, { row: 6, col: 8 }
      ]
      
      soldierPositions.forEach((pos, index) => {
        markers.push({
          id: `soldier-${index}`,
          row: pos.row,
          col: pos.col,
          type: 'soldier'
        })
      })
      
      // 炮位标记
      const cannonPositions = [
        { row: 2, col: 1 }, { row: 2, col: 7 },
        { row: 7, col: 1 }, { row: 7, col: 7 }
      ]
      
      cannonPositions.forEach((pos, index) => {
        markers.push({
          id: `cannon-${index}`,
          row: pos.row,
          col: pos.col,
          type: 'cannon'
        })
      })
      
      return markers
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
      height: `${squareSize.value}px`,
      zIndex: dragState.draggedPiece === piece ? 1000 : 10
    })
    
    const getHighlightStyle = (square) => ({
      left: `${square.col * squareSize.value}px`,
      top: `${square.row * squareSize.value}px`,
      width: `${squareSize.value}px`,
      height: `${squareSize.value}px`
    })
    
    const getValidMoveStyle = (move) => ({
      left: `${move.col * squareSize.value + squareSize.value / 2 - 12}px`,
      top: `${move.row * squareSize.value + squareSize.value / 2 - 12}px`
    })
    
    const getMarkerStyle = (marker) => ({
      left: `${marker.col * squareSize.value + squareSize.value / 2 - 3}px`,
      top: `${marker.row * squareSize.value + squareSize.value / 2 - 3}px`
    })
    
    // 棋盘线条样式
    const getHorizontalLineStyle = (row) => {
      const y = row * squareSize.value
      let width = props.boardSize
      
      if (row === 4 || row === 5) {
        return [
          {
            top: `${y}px`,
            left: '0px',
            width: `${squareSize.value * 3}px`,
            height: '2px'
          },
          {
            top: `${y}px`,
            left: `${squareSize.value * 6}px`,
            width: `${squareSize.value * 3}px`,
            height: '2px'
          }
        ]
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
      
      if (col >= 3 && col <= 5) {
        return {
          left: `${x}px`,
          top: '0px',
          width: '2px',
          height: `${boardHeight.value}px`
        }
      }
      
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
      fontSize: `${squareSize.value * 0.25}px`,
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
    
    // 箭头样式
    const getArrowStyle = () => {
      if (!props.lastMove) return {}
      
      const fromX = props.lastMove.from.col * squareSize.value + squareSize.value / 2
      const fromY = props.lastMove.from.row * squareSize.value + squareSize.value / 2
      const toX = props.lastMove.to.col * squareSize.value + squareSize.value / 2
      const toY = props.lastMove.to.row * squareSize.value + squareSize.value / 2
      
      const dx = toX - fromX
      const dy = toY - fromY
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * 180 / Math.PI
      
      return {
        width: `${length}px`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%'
      }
    }
    
    // CSS类计算
    const getSquareClass = (square) => ({
      'board-square': true,
      'selected': props.selectedSquare && square.square.equals(props.selectedSquare),
      'valid-move': props.validMoves.some(move => move.equals(square.square)),
      'drag-over': dragState.isDragging
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
    const handleSquareClick = (square) => {
      if (dragState.isDragging) return
      emit('square-click', square.square)
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
      
      // 设置拖拽数据
      event.dataTransfer.setData('text/plain', piece.id)
      event.dataTransfer.effectAllowed = 'move'
      
      // 隐藏默认拖拽图像
      const dragImage = new Image()
      dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='
      event.dataTransfer.setDragImage(dragImage, 0, 0)
      
      // 显示拖拽预览
      dragPreview.show = true
      dragPreview.piece = piece
      
      // 触发选中
      emit('piece-click', piece)
    }
    
    const handleDragEnd = () => {
      dragState.isDragging = false
      dragState.draggedPiece = null
      dragState.startSquare = null
      
      dragPreview.show = false
      dragPreview.piece = null
    }
    
    const handleDrop = (event, square) => {
      event.preventDefault()
      
      if (!dragState.isDragging || !dragState.draggedPiece) return
      
      const piece = dragState.draggedPiece
      const fromSquare = dragState.startSquare
      const toSquare = square.square
      
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
      dragPreview,
      boardStyle,
      boardSquares,
      pieces,
      positionMarkers,
      squareSize,
      getSquareStyle,
      getPieceStyle,
      getHighlightStyle,
      getValidMoveStyle,
      getMarkerStyle,
      getHorizontalLineStyle,
      getVerticalLineStyle,
      redPalaceLine1Style,
      redPalaceLine2Style,
      blackPalaceLine1Style,
      blackPalaceLine2Style,
      riverTextStyle,
      getRowCoordinateStyle,
      getColCoordinateStyle,
      getArrowStyle,
      getSquareClass,
      getPieceClass,
      isDraggable,
      canCapture,
      handleSquareClick,
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
.chinese-chess-board-enhanced {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #f4e4bc 0%, #e8d5a3 100%);
  border: 4px solid #8b4513;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.board-container {
  position: relative;
  background: linear-gradient(135deg, #f4e4bc 0%, #e8d5a3 100%);
  border-radius: 4px;
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
  height: 2px;
  background: #8b4513;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.position-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.position-marker {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b4513;
  opacity: 0.3;
}

.board-square {
  position: absolute;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.board-square:hover {
  background: rgba(255, 255, 255, 0.1);
}

.board-square.drag-over {
  background: rgba(102, 126, 234, 0.2);
}

.intersection-point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b4513;
  opacity: 0.2;
  transition: all 0.2s ease;
}

.board-square:hover .intersection-point {
  opacity: 0.4;
  transform: scale(1.2);
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
  opacity: 0.7;
  transform: scale(1.1);
  z-index: 1000;
}

.chess-piece:hover {
  transform: scale(1.05);
}

.piece-content {
  width: 88%;
  height: 88%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  border: 3px solid;
  position: relative;
  overflow: hidden;
}

.piece-content.preview {
  opacity: 0.8;
  transform: scale(0.9);
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
  font-size: 0.65em;
  font-weight: bold;
  text-align: center;
  line-height: 1;
  z-index: 2;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.piece-shadow {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
  pointer-events: none;
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
  z-index: 5;
  pointer-events: none;
}

.selection-ring {
  width: 100%;
  height: 100%;
  border: 4px solid #2196f3;
  border-radius: 50%;
  background: rgba(33, 150, 243, 0.1);
  animation: pulse 1.5s infinite;
}

.valid-move-hint {
  position: absolute;
  width: 24px;
  height: 24px;
  z-index: 5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.move-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.7);
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.valid-move-hint:hover .move-dot {
  background: rgba(76, 175, 80, 0.9);
  transform: scale(1.2);
}

.valid-move-hint.can-capture .move-dot {
  background: rgba(244, 67, 54, 0.7);
  box-shadow: 0 2px 6px rgba(244, 67, 54, 0.3);
}

.valid-move-hint.can-capture:hover .move-dot {
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

.move-arrow {
  position: absolute;
  height: 3px;
  background: linear-gradient(to right, #ff9800, transparent);
  top: 50%;
  left: 0;
  transform-origin: 0 50%;
  pointer-events: none;
}

.move-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 8px solid #ff9800;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.drag-preview {
  position: absolute;
  pointer-events: none;
  z-index: 1001;
  opacity: 0.8;
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
  .chinese-chess-board-enhanced {
    padding: 15px;
  }
  
  .piece-text {
    font-size: 0.55em;
  }
  
  .coordinate-label {
    font-size: 10px;
    width: 16px;
    height: 16px;
  }
  
  .move-dot {
    width: 12px;
    height: 12px;
  }
  
  .valid-move-hint {
    width: 20px;
    height: 20px;
  }
}
</style>