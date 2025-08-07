<template>
  <div
    class="chess-piece"
    :class="pieceClasses"
    :draggable="!isCaptured && !disabled"
    @click="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    :title="pieceTitle"
  >
    <!-- 棋子图标或文字 -->
    <div class="piece-content">
      <span v-if="useUnicode" class="piece-unicode">{{ unicodeSymbol }}</span>
      <span v-else class="piece-text">{{ pieceText }}</span>
    </div>
    
    <!-- 选中指示器 -->
    <div v-if="isSelected" class="selection-indicator"></div>
    
    <!-- 将军指示器 -->
    <div v-if="isInCheck" class="check-indicator"></div>
    
    <!-- 移动动画 -->
    <div v-if="isMoving" class="move-animation"></div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ChessPiece',
  props: {
    // 棋子数据
    piece: {
      type: Object,
      required: true
    },
    // 是否被选中
    isSelected: {
      type: Boolean,
      default: false
    },
    // 是否是有效移动目标
    isValidMove: {
      type: Boolean,
      default: false
    },
    // 是否被将军
    isInCheck: {
      type: Boolean,
      default: false
    },
    // 是否被吃掉
    isCaptured: {
      type: Boolean,
      default: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否正在移动
    isMoving: {
      type: Boolean,
      default: false
    },
    // 棋盘主题
    boardTheme: {
      type: String,
      default: 'classic'
    },
    // 是否使用Unicode符号
    useUnicode: {
      type: Boolean,
      default: true
    },
    // 棋子大小
    size: {
      type: String,
      default: 'normal', // 'small', 'normal', 'large'
    }
  },
  emits: ['click', 'drag-start', 'drag-end'],
  setup(props, { emit }) {
    // 棋子的CSS类
    const pieceClasses = computed(() => {
      const classes = [
        `piece-${props.piece.color}`,
        `piece-${props.piece.type}`,
        `size-${props.size}`,
        `theme-${props.boardTheme}`
      ]
      
      if (props.isSelected) classes.push('selected')
      if (props.isValidMove) classes.push('valid-target')
      if (props.isInCheck) classes.push('in-check')
      if (props.isCaptured) classes.push('captured')
      if (props.disabled) classes.push('disabled')
      if (props.isMoving) classes.push('moving')
      
      return classes
    })
    
    // 棋子标题（悬停提示）
    const pieceTitle = computed(() => {
      const colorNames = {
        white: '白',
        black: '黑',
        red: '红'
      }
      
      const pieceNames = {
        // 国际象棋
        king: '王',
        queen: '后',
        rook: '车',
        bishop: '象',
        knight: '马',
        pawn: '兵',
        // 中国象棋
        general: '将',
        advisor: '士',
        elephant: '相',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '卒'
      }
      
      const colorName = colorNames[props.piece.color] || props.piece.color
      const pieceName = pieceNames[props.piece.type] || props.piece.type
      
      return `${colorName}${pieceName}`
    })
    
    // Unicode符号映射
    const unicodeSymbol = computed(() => {
      const symbols = {
        // 白色棋子
        'white-king': '♔',
        'white-queen': '♕',
        'white-rook': '♖',
        'white-bishop': '♗',
        'white-knight': '♘',
        'white-pawn': '♙',
        // 黑色棋子
        'black-king': '♚',
        'black-queen': '♛',
        'black-rook': '♜',
        'black-bishop': '♝',
        'black-knight': '♞',
        'black-pawn': '♟',
        // 中国象棋（使用文字）
        'red-general': '帅',
        'red-advisor': '仕',
        'red-elephant': '相',
        'red-horse': '马',
        'red-chariot': '车',
        'red-cannon': '炮',
        'red-soldier': '兵',
        'black-general': '将',
        'black-advisor': '士',
        'black-elephant': '象',
        'black-horse': '马',
        'black-chariot': '车',
        'black-cannon': '炮',
        'black-soldier': '卒'
      }
      
      const key = `${props.piece.color}-${props.piece.type}`
      return symbols[key] || '?'
    })
    
    // 文字显示
    const pieceText = computed(() => {
      const textMap = {
        // 国际象棋简写
        'white-king': 'K',
        'white-queen': 'Q',
        'white-rook': 'R',
        'white-bishop': 'B',
        'white-knight': 'N',
        'white-pawn': 'P',
        'black-king': 'k',
        'black-queen': 'q',
        'black-rook': 'r',
        'black-bishop': 'b',
        'black-knight': 'n',
        'black-pawn': 'p'
      }
      
      const key = `${props.piece.color}-${props.piece.type}`
      return textMap[key] || unicodeSymbol.value
    })
    
    // 处理点击事件
    const handleClick = (event) => {
      if (props.disabled || props.isCaptured) return
      event.stopPropagation()
      emit('click', props.piece)
    }
    
    // 处理拖拽开始
    const handleDragStart = (event) => {
      if (props.disabled || props.isCaptured) {
        event.preventDefault()
        return
      }
      
      // 设置拖拽数据
      event.dataTransfer.setData('text/plain', JSON.stringify({
        pieceId: props.piece.id,
        from: props.piece.position
      }))
      
      event.dataTransfer.effectAllowed = 'move'
      emit('drag-start', props.piece)
    }
    
    // 处理拖拽结束
    const handleDragEnd = () => {
      emit('drag-end', props.piece)
    }
    
    return {
      pieceClasses,
      pieceTitle,
      unicodeSymbol,
      pieceText,
      handleClick,
      handleDragStart,
      handleDragEnd
    }
  }
}
</script>

<style scoped>
.chess-piece {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.chess-piece:hover {
  transform: scale(1.05);
}

.chess-piece.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.chess-piece.captured {
  transform: scale(0.7);
  opacity: 0.8;
}

.chess-piece.moving {
  z-index: 100;
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.piece-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.piece-unicode {
  font-size: 2.5rem;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.piece-text {
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* 棋子颜色样式 */
.piece-white .piece-content {
  color: #fff;
  background: radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #333;
}

.piece-black .piece-content {
  color: #fff;
  background: radial-gradient(circle, #495057 0%, #212529 100%);
  border: 2px solid #fff;
}

.piece-red .piece-content {
  color: #fff;
  background: radial-gradient(circle, #dc3545 0%, #c82333 100%);
  border: 2px solid #fff;
}

/* 尺寸变体 */
.size-small .piece-unicode {
  font-size: 1.5rem;
}

.size-small .piece-text {
  font-size: 1.2rem;
}

.size-large .piece-unicode {
  font-size: 3rem;
}

.size-large .piece-text {
  font-size: 2.2rem;
}

/* 选中状态 */
.chess-piece.selected .piece-content {
  box-shadow: 0 0 0 3px #f7d51d, 0 0 20px rgba(247, 213, 29, 0.5);
  transform: scale(1.1);
}

.selection-indicator {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 3px solid #f7d51d;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

/* 将军状态 */
.chess-piece.in-check .piece-content {
  box-shadow: 0 0 0 3px #dc3545, 0 0 20px rgba(220, 53, 69, 0.5);
  animation: shake 0.5s infinite;
}

.check-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: #dc3545;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: blink 1s infinite;
}

/* 有效移动目标 */
.chess-piece.valid-target .piece-content {
  box-shadow: 0 0 0 3px #28a745, 0 0 15px rgba(40, 167, 69, 0.4);
}

/* 主题样式 */
.theme-wood .piece-content {
  background: radial-gradient(circle, #deb887 0%, #cd853f 100%);
}

.theme-marble .piece-white .piece-content {
  background: radial-gradient(circle, #f8f9fa 0%, #dee2e6 100%);
}

.theme-marble .piece-black .piece-content {
  background: radial-gradient(circle, #6c757d 0%, #495057 100%);
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.move-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 60%, rgba(255, 255, 255, 0.3) 100%);
  animation: moveGlow 0.3s ease-out;
}

@keyframes moveGlow {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .piece-unicode {
    font-size: 2rem;
  }
  
  .piece-text {
    font-size: 1.5rem;
  }
  
  .size-small .piece-unicode {
    font-size: 1.2rem;
  }
  
  .size-small .piece-text {
    font-size: 1rem;
  }
  
  .check-indicator {
    width: 10px;
    height: 10px;
    top: -3px;
    right: -3px;
  }
}
</style>