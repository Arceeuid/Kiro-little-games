// 棋类游戏通用类型定义

/**
 * 棋盘坐标
 */
export class Square {
  constructor(row, col) {
    this.row = row
    this.col = col
  }
  
  equals(other) {
    return this.row === other.row && this.col === other.col
  }
  
  toString() {
    return `${this.row},${this.col}`
  }
  
  // 创建新的坐标实例
  static from(row, col) {
    return new Square(row, col)
  }
  
  // 从字符串解析坐标
  static fromString(str) {
    const [row, col] = str.split(',').map(Number)
    return new Square(row, col)
  }
}

/**
 * 棋子基类
 */
export class ChessPiece {
  constructor(id, type, color, position) {
    this.id = id
    this.type = type
    this.color = color
    this.position = position
    this.hasMoved = false
  }
  
  // 移动棋子到新位置
  moveTo(newPosition) {
    this.position = newPosition
    this.hasMoved = true
  }
  
  // 克隆棋子
  clone() {
    const cloned = new this.constructor(this.id, this.type, this.color, this.position)
    cloned.hasMoved = this.hasMoved
    return cloned
  }
}

/**
 * 移动记录
 */
export class Move {
  constructor(from, to, piece, capturedPiece = null, specialMove = null) {
    this.from = from
    this.to = to
    this.piece = piece
    this.capturedPiece = capturedPiece
    this.specialMove = specialMove // 'castling', 'enPassant', 'promotion' 等
    this.timestamp = new Date()
  }
}

/**
 * 游戏状态枚举
 */
export const GameStatus = {
  PLAYING: 'playing',
  CHECK: 'check',
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  DRAW: 'draw',
  RESIGNED: 'resigned'
}

/**
 * 棋子颜色枚举
 */
export const PieceColor = {
  WHITE: 'white',
  BLACK: 'black',
  RED: 'red' // 中国象棋使用
}

/**
 * 工具函数
 */
export const ChessUtils = {
  // 检查坐标是否在棋盘范围内
  isValidSquare(square, boardSize) {
    return square.row >= 0 && square.row < boardSize && 
           square.col >= 0 && square.col < boardSize
  },
  
  // 计算两个坐标之间的距离
  getDistance(square1, square2) {
    return Math.max(
      Math.abs(square1.row - square2.row),
      Math.abs(square1.col - square2.col)
    )
  },
  
  // 检查两个坐标是否在同一行
  isSameRow(square1, square2) {
    return square1.row === square2.row
  },
  
  // 检查两个坐标是否在同一列
  isSameCol(square1, square2) {
    return square1.col === square2.col
  },
  
  // 检查两个坐标是否在同一对角线
  isSameDiagonal(square1, square2) {
    return Math.abs(square1.row - square2.row) === Math.abs(square1.col - square2.col)
  },
  
  // 获取两个坐标之间的路径（不包括起点和终点）
  getPath(from, to) {
    const path = []
    const rowDiff = to.row - from.row
    const colDiff = to.col - from.col
    
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff)
    
    let currentRow = from.row + rowStep
    let currentCol = from.col + colStep
    
    while (currentRow !== to.row || currentCol !== to.col) {
      path.push(new Square(currentRow, currentCol))
      currentRow += rowStep
      currentCol += colStep
    }
    
    return path
  },
  
  // 将棋盘坐标转换为代数记号（如 a1, b2）
  squareToAlgebraic(square) {
    const files = 'abcdefghijklmnop'
    return files[square.col] + (square.row + 1)
  },
  
  // 将代数记号转换为棋盘坐标
  algebraicToSquare(algebraic) {
    const files = 'abcdefghijklmnop'
    const col = files.indexOf(algebraic[0])
    const row = parseInt(algebraic.slice(1)) - 1
    return new Square(row, col)
  }
}