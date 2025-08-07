// 中国象棋游戏逻辑

import { Square, ChessPiece, Move, GameStatus, ChessUtils } from './chess-types.js'
import { BoardManager, MoveValidator } from './board-utils.js'

/**
 * 中国象棋棋子类型
 */
export const ChinesePieceType = {
  GENERAL: 'general',    // 将/帅
  ADVISOR: 'advisor',    // 士/仕
  ELEPHANT: 'elephant',  // 象/相
  HORSE: 'horse',        // 马
  CHARIOT: 'chariot',    // 车
  CANNON: 'cannon',      // 炮
  SOLDIER: 'soldier'     // 兵/卒
}

/**
 * 中国象棋颜色
 */
export const ChineseColor = {
  RED: 'red',    // 红方（下方）
  BLACK: 'black' // 黑方（上方）
}

/**
 * 中国象棋棋子类
 */
export class ChineseChessPiece extends ChessPiece {
  constructor(id, type, color, position) {
    super(id, type, color, position)
    this.originalSide = color === ChineseColor.RED ? 'bottom' : 'top'
  }
  
  // 获取棋子的中文名称
  getChineseName() {
    const names = {
      [ChinesePieceType.GENERAL]: this.color === ChineseColor.RED ? '帅' : '将',
      [ChinesePieceType.ADVISOR]: this.color === ChineseColor.RED ? '仕' : '士',
      [ChinesePieceType.ELEPHANT]: this.color === ChineseColor.RED ? '相' : '象',
      [ChinesePieceType.HORSE]: '马',
      [ChinesePieceType.CHARIOT]: '车',
      [ChinesePieceType.CANNON]: '炮',
      [ChinesePieceType.SOLDIER]: this.color === ChineseColor.RED ? '兵' : '卒'
    }
    return names[this.type] || this.type
  }
  
  // 检查是否已过河
  hasCrossedRiver() {
    if (this.type !== ChinesePieceType.SOLDIER) return false
    
    if (this.color === ChineseColor.RED) {
      return this.position.row >= 5 // 红方兵过河（到达黑方半场）
    } else {
      return this.position.row <= 4 // 黑方卒过河（到达红方半场）
    }
  }
  
  // 检查是否在己方九宫内
  isInOwnPalace() {
    const { row, col } = this.position
    
    if (this.color === ChineseColor.RED) {
      // 红方九宫：行0-2，列3-5
      return row >= 0 && row <= 2 && col >= 3 && col <= 5
    } else {
      // 黑方九宫：行7-9，列3-5
      return row >= 7 && row <= 9 && col >= 3 && col <= 5
    }
  }
  
  // 检查是否在己方半场
  isInOwnSide() {
    if (this.color === ChineseColor.RED) {
      return this.position.row <= 4
    } else {
      return this.position.row >= 5
    }
  }
}

/**
 * 中国象棋棋盘管理器
 */
export class ChineseChessBoard extends BoardManager {
  constructor() {
    super(10) // 中国象棋是10x9，这里用10x10简化
    this.setupInitialPosition()
  }
  
  // 设置初始棋子位置
  setupInitialPosition() {
    this.reset()
    
    // 红方棋子（下方，行0-4）
    const redPieces = [
      // 第一排（底线）
      new ChineseChessPiece('red-chariot-1', ChinesePieceType.CHARIOT, ChineseColor.RED, new Square(0, 0)),
      new ChineseChessPiece('red-horse-1', ChinesePieceType.HORSE, ChineseColor.RED, new Square(0, 1)),
      new ChineseChessPiece('red-elephant-1', ChinesePieceType.ELEPHANT, ChineseColor.RED, new Square(0, 2)),
      new ChineseChessPiece('red-advisor-1', ChinesePieceType.ADVISOR, ChineseColor.RED, new Square(0, 3)),
      new ChineseChessPiece('red-general', ChinesePieceType.GENERAL, ChineseColor.RED, new Square(0, 4)),
      new ChineseChessPiece('red-advisor-2', ChinesePieceType.ADVISOR, ChineseColor.RED, new Square(0, 5)),
      new ChineseChessPiece('red-elephant-2', ChinesePieceType.ELEPHANT, ChineseColor.RED, new Square(0, 6)),
      new ChineseChessPiece('red-horse-2', ChinesePieceType.HORSE, ChineseColor.RED, new Square(0, 7)),
      new ChineseChessPiece('red-chariot-2', ChinesePieceType.CHARIOT, ChineseColor.RED, new Square(0, 8)),
      
      // 炮
      new ChineseChessPiece('red-cannon-1', ChinesePieceType.CANNON, ChineseColor.RED, new Square(2, 1)),
      new ChineseChessPiece('red-cannon-2', ChinesePieceType.CANNON, ChineseColor.RED, new Square(2, 7)),
      
      // 兵
      new ChineseChessPiece('red-soldier-1', ChinesePieceType.SOLDIER, ChineseColor.RED, new Square(3, 0)),
      new ChineseChessPiece('red-soldier-2', ChinesePieceType.SOLDIER, ChineseColor.RED, new Square(3, 2)),
      new ChineseChessPiece('red-soldier-3', ChinesePieceType.SOLDIER, ChineseColor.RED, new Square(3, 4)),
      new ChineseChessPiece('red-soldier-4', ChinesePieceType.SOLDIER, ChineseColor.RED, new Square(3, 6)),
      new ChineseChessPiece('red-soldier-5', ChinesePieceType.SOLDIER, ChineseColor.RED, new Square(3, 8))
    ]
    
    // 黑方棋子（上方，行5-9）
    const blackPieces = [
      // 第一排（顶线）
      new ChineseChessPiece('black-chariot-1', ChinesePieceType.CHARIOT, ChineseColor.BLACK, new Square(9, 0)),
      new ChineseChessPiece('black-horse-1', ChinesePieceType.HORSE, ChineseColor.BLACK, new Square(9, 1)),
      new ChineseChessPiece('black-elephant-1', ChinesePieceType.ELEPHANT, ChineseColor.BLACK, new Square(9, 2)),
      new ChineseChessPiece('black-advisor-1', ChinesePieceType.ADVISOR, ChineseColor.BLACK, new Square(9, 3)),
      new ChineseChessPiece('black-general', ChinesePieceType.GENERAL, ChineseColor.BLACK, new Square(9, 4)),
      new ChineseChessPiece('black-advisor-2', ChinesePieceType.ADVISOR, ChineseColor.BLACK, new Square(9, 5)),
      new ChineseChessPiece('black-elephant-2', ChinesePieceType.ELEPHANT, ChineseColor.BLACK, new Square(9, 6)),
      new ChineseChessPiece('black-horse-2', ChinesePieceType.HORSE, ChineseColor.BLACK, new Square(9, 7)),
      new ChineseChessPiece('black-chariot-2', ChinesePieceType.CHARIOT, ChineseColor.BLACK, new Square(9, 8)),
      
      // 炮
      new ChineseChessPiece('black-cannon-1', ChinesePieceType.CANNON, ChineseColor.BLACK, new Square(7, 1)),
      new ChineseChessPiece('black-cannon-2', ChinesePieceType.CANNON, ChineseColor.BLACK, new Square(7, 7)),
      
      // 卒
      new ChineseChessPiece('black-soldier-1', ChinesePieceType.SOLDIER, ChineseColor.BLACK, new Square(6, 0)),
      new ChineseChessPiece('black-soldier-2', ChinesePieceType.SOLDIER, ChineseColor.BLACK, new Square(6, 2)),
      new ChineseChessPiece('black-soldier-3', ChinesePieceType.SOLDIER, ChineseColor.BLACK, new Square(6, 4)),
      new ChineseChessPiece('black-soldier-4', ChinesePieceType.SOLDIER, ChineseColor.BLACK, new Square(6, 6)),
      new ChineseChessPiece('black-soldier-5', ChinesePieceType.SOLDIER, ChineseColor.BLACK, new Square(6, 8))
    ]
    
    // 放置所有棋子
    const allPieces = redPieces.concat(blackPieces)
    allPieces.forEach(piece => {
      this.placePiece(piece, piece.position)
    })
  }
  
  // 获取将/帅的位置
  getGeneralPosition(color) {
    const pieces = this.getPiecesByColor(color)
    const general = pieces.find(piece => piece.type === ChinesePieceType.GENERAL)
    return general ? general.position : null
  }
  
  // 检查两个将是否照面
  areGeneralsFacing() {
    const redGeneral = this.getGeneralPosition(ChineseColor.RED)
    const blackGeneral = this.getGeneralPosition(ChineseColor.BLACK)
    
    if (!redGeneral || !blackGeneral) return false
    
    // 检查是否在同一列
    if (redGeneral.col !== blackGeneral.col) return false
    
    // 检查中间是否有棋子阻挡
    const minRow = Math.min(redGeneral.row, blackGeneral.row)
    const maxRow = Math.max(redGeneral.row, blackGeneral.row)
    
    for (let row = minRow + 1; row < maxRow; row++) {
      if (this.getPieceAt(new Square(row, redGeneral.col))) {
        return false
      }
    }
    
    return true
  }
}

/**
 * 中国象棋移动验证器
 */
export class ChineseChessMoveValidator extends MoveValidator {
  constructor(boardManager) {
    super(boardManager)
  }
  
  // 验证移动是否合法
  isValidMove(piece, from, to) {
    if (!this.isBasicMoveValid(piece, from, to)) {
      return false
    }
    
    // 根据棋子类型验证移动
    switch (piece.type) {
      case ChinesePieceType.GENERAL:
        return this.isValidGeneralMove(piece, from, to)
      case ChinesePieceType.ADVISOR:
        return this.isValidAdvisorMove(piece, from, to)
      case ChinesePieceType.ELEPHANT:
        return this.isValidElephantMove(piece, from, to)
      case ChinesePieceType.HORSE:
        return this.isValidHorseMove(piece, from, to)
      case ChinesePieceType.CHARIOT:
        return this.isValidChariotMove(piece, from, to)
      case ChinesePieceType.CANNON:
        return this.isValidCannonMove(piece, from, to)
      case ChinesePieceType.SOLDIER:
        return this.isValidSoldierMove(piece, from, to)
      default:
        return false
    }
  }
  
  // 将/帅移动验证
  isValidGeneralMove(piece, from, to) {
    const { row, col } = to
    
    // 只能在九宫内移动
    if (piece.color === ChineseColor.RED) {
      if (row < 0 || row > 2 || col < 3 || col > 5) return false
    } else {
      if (row < 7 || row > 9 || col < 3 || col > 5) return false
    }
    
    // 只能移动一格
    const distance = ChessUtils.getDistance(from, to)
    if (distance !== 1) return false
    
    // 只能横向或纵向移动
    if (!ChessUtils.isSameRow(from, to) && !ChessUtils.isSameCol(from, to)) {
      return false
    }
    
    return true
  }
  
  // 士/仕移动验证
  isValidAdvisorMove(piece, from, to) {
    const { row, col } = to
    
    // 只能在九宫内移动
    if (piece.color === ChineseColor.RED) {
      if (row < 0 || row > 2 || col < 3 || col > 5) return false
    } else {
      if (row < 7 || row > 9 || col < 3 || col > 5) return false
    }
    
    // 只能斜向移动一格
    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)
    
    return rowDiff === 1 && colDiff === 1
  }
  
  // 象/相移动验证
  isValidElephantMove(piece, from, to) {
    // 不能过河
    if (piece.color === ChineseColor.RED && to.row > 4) return false
    if (piece.color === ChineseColor.BLACK && to.row < 5) return false
    
    // 只能斜向移动两格
    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)
    
    if (rowDiff !== 2 || colDiff !== 2) return false
    
    // 检查象眼是否被堵
    const eyeRow = from.row + (to.row - from.row) / 2
    const eyeCol = from.col + (to.col - from.col) / 2
    const eyeSquare = new Square(eyeRow, eyeCol)
    
    return !this.board.getPieceAt(eyeSquare)
  }
  
  // 马移动验证
  isValidHorseMove(piece, from, to) {
    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)
    
    // 马走日字
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      return false
    }
    
    // 检查马腿是否被堵
    let legSquare
    if (rowDiff === 2) {
      // 纵向移动两格，检查中间一格
      legSquare = new Square(from.row + (to.row - from.row) / 2, from.col)
    } else {
      // 横向移动两格，检查中间一格
      legSquare = new Square(from.row, from.col + (to.col - from.col) / 2)
    }
    
    return !this.board.getPieceAt(legSquare)
  }
  
  // 车移动验证
  isValidChariotMove(piece, from, to) {
    // 只能横向或纵向移动
    if (!ChessUtils.isSameRow(from, to) && !ChessUtils.isSameCol(from, to)) {
      return false
    }
    
    // 检查路径是否被阻挡
    return this.board.isPathClear(from, to)
  }
  
  // 炮移动验证
  isValidCannonMove(piece, from, to) {
    // 只能横向或纵向移动
    if (!ChessUtils.isSameRow(from, to) && !ChessUtils.isSameCol(from, to)) {
      return false
    }
    
    const targetPiece = this.board.getPieceAt(to)
    const path = ChessUtils.getPath(from, to)
    const blockers = path.filter(square => this.board.getPieceAt(square))
    
    if (targetPiece) {
      // 吃子时必须隔一个棋子
      return blockers.length === 1
    } else {
      // 移动时路径必须畅通
      return blockers.length === 0
    }
  }
  
  // 兵/卒移动验证
  isValidSoldierMove(piece, from, to) {
    const rowDiff = to.row - from.row
    const colDiff = Math.abs(to.col - from.col)
    
    // 只能移动一格
    if (Math.abs(rowDiff) + colDiff !== 1) return false
    
    if (piece.color === ChineseColor.RED) {
      // 红兵
      if (!piece.hasCrossedRiver()) {
        // 未过河只能向前
        return rowDiff === 1 && colDiff === 0
      } else {
        // 过河后可以横向移动，但不能后退
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
      }
    } else {
      // 黑卒
      if (!piece.hasCrossedRiver()) {
        // 未过河只能向前
        return rowDiff === -1 && colDiff === 0
      } else {
        // 过河后可以横向移动，但不能后退
        return (rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
      }
    }
  }
  
  // 检查是否将军
  isInCheck(color) {
    const generalPosition = this.board.getGeneralPosition(color)
    if (!generalPosition) return false
    
    // 检查对方所有棋子是否能攻击到将/帅
    const opponentColor = color === ChineseColor.RED ? ChineseColor.BLACK : ChineseColor.RED
    const opponentPieces = this.board.getPiecesByColor(opponentColor)
    
    return opponentPieces.some(piece => 
      this.isValidMove(piece, piece.position, generalPosition)
    )
  }
  
  // 检查是否将死
  isCheckmate(color) {
    if (!this.isInCheck(color)) return false
    
    // 尝试所有可能的移动，看是否能解除将军
    const pieces = this.board.getPiecesByColor(color)
    
    for (const piece of pieces) {
      const validMoves = this.getValidMoves(piece)
      
      for (const move of validMoves) {
        // 模拟移动
        const originalBoard = this.board.clone()
        const capturedPiece = this.board.movePiece(piece.position, move)
        
        // 检查移动后是否还在被将军
        const stillInCheck = this.isInCheck(color)
        
        // 恢复棋盘
        this.board = originalBoard
        
        if (!stillInCheck) {
          return false // 找到了解除将军的移动
        }
      }
    }
    
    return true // 没有找到解除将军的移动
  }
}

/**
 * 中国象棋游戏管理器
 */
export class ChineseChessGame {
  constructor() {
    this.board = new ChineseChessBoard()
    this.validator = new ChineseChessMoveValidator(this.board)
    this.currentPlayer = ChineseColor.RED
    this.gameStatus = GameStatus.PLAYING
    this.moveHistory = []
    this.capturedPieces = []
  }
  
  // 获取当前棋盘状态
  getBoardState() {
    return {
      pieces: this.board.toArray(),
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      moveHistory: this.moveHistory,
      capturedPieces: this.capturedPieces
    }
  }
  
  // 获取棋子的有效移动
  getValidMoves(piece) {
    if (piece.color !== this.currentPlayer) return []
    
    const moves = this.validator.getValidMoves(piece)
    
    // 过滤掉会导致自己被将军的移动
    return moves.filter(move => {
      const originalBoard = this.board.clone()
      const capturedPiece = this.board.movePiece(piece.position, move)
      
      const wouldBeInCheck = this.validator.isInCheck(this.currentPlayer)
      
      // 恢复棋盘
      this.board = originalBoard
      
      return !wouldBeInCheck
    })
  }
  
  // 移动棋子
  movePiece(from, to) {
    const piece = this.board.getPieceAt(from)
    if (!piece || piece.color !== this.currentPlayer) {
      return { success: false, error: '无效的棋子' }
    }
    
    if (!this.validator.isValidMove(piece, from, to)) {
      return { success: false, error: '无效的移动' }
    }
    
    // 检查移动后是否会被将军
    const originalBoard = this.board.clone()
    const capturedPiece = this.board.movePiece(from, to)
    
    if (this.validator.isInCheck(this.currentPlayer)) {
      // 恢复棋盘
      this.board = originalBoard
      return { success: false, error: '此移动会导致被将军' }
    }
    
    // 记录移动
    const move = new Move(from, to, piece, capturedPiece)
    this.moveHistory.push(move)
    
    // 记录被吃的棋子
    if (capturedPiece) {
      this.capturedPieces.push(capturedPiece)
    }
    
    // 检查游戏状态
    this.updateGameStatus()
    
    // 切换玩家
    if (this.gameStatus === GameStatus.PLAYING) {
      this.currentPlayer = this.currentPlayer === ChineseColor.RED ? ChineseColor.BLACK : ChineseColor.RED
    }
    
    return { success: true, move, capturedPiece }
  }
  
  // 更新游戏状态
  updateGameStatus() {
    const opponentColor = this.currentPlayer === ChineseColor.RED ? ChineseColor.BLACK : ChineseColor.RED
    
    if (this.validator.isCheckmate(opponentColor)) {
      this.gameStatus = GameStatus.CHECKMATE
    } else if (this.validator.isInCheck(opponentColor)) {
      this.gameStatus = GameStatus.CHECK
    } else if (this.board.areGeneralsFacing()) {
      // 将帅照面，当前玩家获胜
      this.gameStatus = GameStatus.CHECKMATE
    } else {
      this.gameStatus = GameStatus.PLAYING
    }
  }
  
  // 重新开始游戏
  restart() {
    this.board = new ChineseChessBoard()
    this.validator = new ChineseChessMoveValidator(this.board)
    this.currentPlayer = ChineseColor.RED
    this.gameStatus = GameStatus.PLAYING
    this.moveHistory = []
    this.capturedPieces = []
  }
  
  // 悔棋
  undoMove() {
    if (this.moveHistory.length === 0) return false
    
    const lastMove = this.moveHistory.pop()
    
    // 恢复棋子位置
    this.board.movePiece(lastMove.to, lastMove.from)
    
    // 恢复被吃的棋子
    if (lastMove.capturedPiece) {
      this.board.placePiece(lastMove.capturedPiece, lastMove.to)
      this.capturedPieces.pop()
    }
    
    // 切换玩家
    this.currentPlayer = this.currentPlayer === ChineseColor.RED ? ChineseColor.BLACK : ChineseColor.RED
    
    // 更新游戏状态
    this.gameStatus = GameStatus.PLAYING
    
    return true
  }
  
  // 获取游戏结果
  getGameResult() {
    if (this.gameStatus === GameStatus.CHECKMATE) {
      return {
        winner: this.currentPlayer,
        loser: this.currentPlayer === ChineseColor.RED ? ChineseColor.BLACK : ChineseColor.RED,
        reason: '将死'
      }
    }
    
    return null
  }
}