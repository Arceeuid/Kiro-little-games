// 棋盘工具函数

import { Square, ChessUtils } from './chess-types.js'

/**
 * 棋盘管理器类
 */
export class BoardManager {
  constructor(boardSize = 8) {
    this.boardSize = boardSize
    this.board = this.createEmptyBoard()
  }
  
  // 创建空棋盘
  createEmptyBoard() {
    const board = []
    for (let row = 0; row < this.boardSize; row++) {
      board[row] = []
      for (let col = 0; col < this.boardSize; col++) {
        board[row][col] = null
      }
    }
    return board
  }
  
  // 放置棋子
  placePiece(piece, square) {
    if (!ChessUtils.isValidSquare(square, this.boardSize)) {
      throw new Error(`Invalid square: ${square.toString()}`)
    }
    
    this.board[square.row][square.col] = piece
    piece.position = square
  }
  
  // 移除棋子
  removePiece(square) {
    if (!ChessUtils.isValidSquare(square, this.boardSize)) {
      throw new Error(`Invalid square: ${square.toString()}`)
    }
    
    const piece = this.board[square.row][square.col]
    this.board[square.row][square.col] = null
    return piece
  }
  
  // 获取指定位置的棋子
  getPieceAt(square) {
    if (!ChessUtils.isValidSquare(square, this.boardSize)) {
      return null
    }
    return this.board[square.row][square.col]
  }
  
  // 移动棋子
  movePiece(from, to) {
    const piece = this.removePiece(from)
    if (!piece) {
      throw new Error(`No piece at ${from.toString()}`)
    }
    
    const capturedPiece = this.getPieceAt(to)
    this.placePiece(piece, to)
    
    return capturedPiece
  }
  
  // 检查路径是否被阻挡
  isPathClear(from, to) {
    const path = ChessUtils.getPath(from, to)
    return path.every(square => this.getPieceAt(square) === null)
  }
  
  // 获取所有棋子
  getAllPieces() {
    const pieces = []
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const piece = this.board[row][col]
        if (piece) {
          pieces.push(piece)
        }
      }
    }
    return pieces
  }
  
  // 获取指定颜色的棋子
  getPiecesByColor(color) {
    return this.getAllPieces().filter(piece => piece.color === color)
  }
  
  // 克隆棋盘
  clone() {
    const cloned = new BoardManager(this.boardSize)
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const piece = this.board[row][col]
        if (piece) {
          cloned.board[row][col] = piece.clone()
        }
      }
    }
    return cloned
  }
  
  // 重置棋盘
  reset() {
    this.board = this.createEmptyBoard()
  }
  
  // 转换为数组格式（用于Vue组件）
  toArray() {
    const pieces = []
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const piece = this.board[row][col]
        if (piece) {
          pieces.push({
            id: piece.id,
            type: piece.type,
            color: piece.color,
            hasMoved: piece.hasMoved,
            position: new Square(row, col)
          })
        }
      }
    }
    return pieces
  }
}

/**
 * 移动验证器基类
 */
export class MoveValidator {
  constructor(boardManager) {
    this.board = boardManager
  }
  
  // 验证移动是否合法（需要子类实现）
  isValidMove(piece, from, to) {
    throw new Error('isValidMove must be implemented by subclass')
  }
  
  // 获取棋子的所有有效移动
  getValidMoves(piece) {
    const validMoves = []
    
    for (let row = 0; row < this.board.boardSize; row++) {
      for (let col = 0; col < this.board.boardSize; col++) {
        const targetSquare = new Square(row, col)
        if (this.isValidMove(piece, piece.position, targetSquare)) {
          validMoves.push(targetSquare)
        }
      }
    }
    
    return validMoves
  }
  
  // 基础移动验证
  isBasicMoveValid(piece, from, to) {
    // 检查目标位置是否在棋盘内
    if (!ChessUtils.isValidSquare(to, this.board.boardSize)) {
      return false
    }
    
    // 检查是否移动到相同位置
    if (from.equals(to)) {
      return false
    }
    
    // 检查目标位置是否有己方棋子
    const targetPiece = this.board.getPieceAt(to)
    if (targetPiece && targetPiece.color === piece.color) {
      return false
    }
    
    return true
  }
}

/**
 * 棋盘渲染工具
 */
export class BoardRenderer {
  constructor(boardSize = 8) {
    this.boardSize = boardSize
  }
  
  // 生成棋盘格子数据
  generateSquares() {
    const squares = []
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        squares.push({
          row,
          col,
          id: `${row}-${col}`,
          isLight: (row + col) % 2 === 0,
          algebraic: ChessUtils.squareToAlgebraic(new Square(row, col))
        })
      }
    }
    return squares
  }
  
  // 计算棋盘像素坐标
  getPixelPosition(square, squareSize) {
    return {
      x: square.col * squareSize,
      y: square.row * squareSize
    }
  }
  
  // 从像素坐标计算棋盘坐标
  getSquareFromPixel(x, y, squareSize) {
    const col = Math.floor(x / squareSize)
    const row = Math.floor(y / squareSize)
    return new Square(row, col)
  }
}

/**
 * 动画管理器
 */
export class AnimationManager {
  constructor() {
    this.animations = new Map()
  }
  
  // 添加移动动画
  addMoveAnimation(pieceId, from, to, duration = 300) {
    const animation = {
      type: 'move',
      pieceId,
      from,
      to,
      duration,
      startTime: Date.now()
    }
    
    this.animations.set(pieceId, animation)
    
    // 自动清理动画
    setTimeout(() => {
      this.animations.delete(pieceId)
    }, duration)
    
    return animation
  }
  
  // 添加捕获动画
  addCaptureAnimation(pieceId, duration = 200) {
    const animation = {
      type: 'capture',
      pieceId,
      duration,
      startTime: Date.now()
    }
    
    this.animations.set(pieceId, animation)
    
    setTimeout(() => {
      this.animations.delete(pieceId)
    }, duration)
    
    return animation
  }
  
  // 获取棋子的当前动画
  getAnimation(pieceId) {
    return this.animations.get(pieceId)
  }
  
  // 检查棋子是否在动画中
  isAnimating(pieceId) {
    return this.animations.has(pieceId)
  }
  
  // 清除所有动画
  clearAll() {
    this.animations.clear()
  }
}

/**
 * 棋盘主题管理器
 */
export class ThemeManager {
  constructor() {
    this.themes = {
      classic: {
        name: '经典',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        border: '#8b4513',
        coordinates: '#666'
      },
      wood: {
        name: '木质',
        lightSquare: '#deb887',
        darkSquare: '#8b4513',
        border: '#654321',
        coordinates: '#333'
      },
      marble: {
        name: '大理石',
        lightSquare: '#f5f5f5',
        darkSquare: '#d0d0d0',
        border: '#999',
        coordinates: '#666'
      },
      green: {
        name: '绿色',
        lightSquare: '#ffffdd',
        darkSquare: '#86a666',
        border: '#4a5d23',
        coordinates: '#333'
      },
      blue: {
        name: '蓝色',
        lightSquare: '#dee3e6',
        darkSquare: '#8ca2ad',
        border: '#4682b4',
        coordinates: '#333'
      }
    }
    
    this.currentTheme = 'classic'
  }
  
  // 获取主题
  getTheme(name = this.currentTheme) {
    return this.themes[name] || this.themes.classic
  }
  
  // 设置主题
  setTheme(name) {
    if (this.themes[name]) {
      this.currentTheme = name
    }
  }
  
  // 获取所有主题名称
  getThemeNames() {
    return Object.keys(this.themes)
  }
  
  // 添加自定义主题
  addTheme(name, theme) {
    this.themes[name] = theme
  }
}

// 导出工具函数
export const boardUtils = {
  // 创建标准8x8棋盘
  createStandardBoard() {
    return new BoardManager(8)
  },
  
  // 创建中国象棋棋盘
  createChineseChessBoard() {
    return new BoardManager(10) // 中国象棋是10x9，这里简化为10x10
  },
  
  // 格式化移动记录
  formatMove(move) {
    const from = ChessUtils.squareToAlgebraic(move.from)
    const to = ChessUtils.squareToAlgebraic(move.to)
    return `${from}-${to}`
  },
  
  // 解析移动记录
  parseMove(moveString) {
    const [from, to] = moveString.split('-')
    return {
      from: ChessUtils.algebraicToSquare(from),
      to: ChessUtils.algebraicToSquare(to)
    }
  }
}