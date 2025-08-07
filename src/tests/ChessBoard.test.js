// ChessBoard.vue 组件单元测试

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChessBoard from '../components/games/ChessBoard.vue'
import { Square, ChessPiece } from '../utils/chess-types.js'

describe('ChessBoard.vue', () => {
  let wrapper
  let mockPieces
  
  beforeEach(() => {
    // 创建测试用的棋子数据
    mockPieces = [
      new ChessPiece('white-king', 'king', 'white', new Square(0, 4)),
      new ChessPiece('black-king', 'king', 'black', new Square(7, 4)),
      new ChessPiece('white-rook', 'rook', 'white', new Square(0, 0)),
      new ChessPiece('black-rook', 'rook', 'black', new Square(7, 0))
    ]
    
    wrapper = mount(ChessBoard, {
      props: {
        boardSize: 8,
        pieces: mockPieces,
        currentPlayer: 'white',
        gameStatus: 'playing'
      }
    })
  })
  
  it('应该正确渲染棋盘', () => {
    expect(wrapper.find('.chess-board').exists()).toBe(true)
    expect(wrapper.find('.board-grid').exists()).toBe(true)
  })
  
  it('应该渲染正确数量的格子', () => {
    const squares = wrapper.findAll('.board-square')
    expect(squares).toHaveLength(64) // 8x8 = 64
  })
  
  it('应该正确显示棋子', () => {
    const pieces = wrapper.findAllComponents({ name: 'ChessPiece' })
    expect(pieces).toHaveLength(mockPieces.length)
  })
  
  it('应该正确处理格子点击事件', async () => {
    const square = wrapper.find('.board-square')
    await square.trigger('click')
    
    expect(wrapper.emitted('square-click')).toBeTruthy()
    expect(wrapper.emitted('square-click')[0][0]).toBeInstanceOf(Square)
  })
  
  it('应该正确显示当前玩家', () => {
    const playerIndicator = wrapper.find('.player-indicator')
    expect(playerIndicator.classes()).toContain('white')
  })
  
  it('应该正确处理棋子点击事件', async () => {
    const piece = wrapper.findComponent({ name: 'ChessPiece' })
    await piece.vm.$emit('click', mockPieces[0])
    
    expect(wrapper.emitted('piece-click')).toBeTruthy()
    expect(wrapper.emitted('piece-click')[0][0]).toBe(mockPieces[0])
  })
  
  it('应该正确显示选中的格子', async () => {
    await wrapper.setProps({
      selectedSquare: new Square(0, 4)
    })
    
    const selectedSquare = wrapper.find('.board-square.selected')
    expect(selectedSquare.exists()).toBe(true)
  })
  
  it('应该正确显示有效移动位置', async () => {
    const validMoves = [new Square(1, 4), new Square(2, 4)]
    await wrapper.setProps({ validMoves })
    
    const validMoveSquares = wrapper.findAll('.board-square.valid-move')
    expect(validMoveSquares).toHaveLength(validMoves.length)
  })
  
  it('应该正确显示最后移动', async () => {
    const lastMove = {
      from: new Square(0, 0),
      to: new Square(1, 0)
    }
    await wrapper.setProps({ lastMove })
    
    const lastMoveSquares = wrapper.findAll('.board-square.last-move')
    expect(lastMoveSquares).toHaveLength(2) // from 和 to
  })
  
  it('应该支持不同的棋盘大小', async () => {
    await wrapper.setProps({ boardSize: 10 })
    
    const squares = wrapper.findAll('.board-square')
    expect(squares).toHaveLength(100) // 10x10 = 100
  })
  
  it('应该正确处理拖拽事件', async () => {
    const piece = wrapper.findComponent({ name: 'ChessPiece' })
    await piece.vm.$emit('drag-start', mockPieces[0])
    
    expect(wrapper.emitted('piece-drag-start')).toBeTruthy()
    expect(wrapper.emitted('piece-drag-start')[0][0]).toBe(mockPieces[0])
  })
  
  it('应该支持隐藏坐标', async () => {
    await wrapper.setProps({ showCoordinates: false })
    
    const coordinates = wrapper.find('.coordinates')
    expect(coordinates.exists()).toBe(false)
  })
  
  it('应该支持隐藏信息栏', async () => {
    await wrapper.setProps({ showInfo: false })
    
    const boardInfo = wrapper.find('.board-info')
    expect(boardInfo.exists()).toBe(false)
  })
  
  it('应该正确显示游戏状态', async () => {
    await wrapper.setProps({ gameStatus: 'check' })
    
    const gameStatus = wrapper.find('.game-status')
    expect(gameStatus.text()).toBe('将军！')
  })
  
  it('应该正确应用棋盘主题', async () => {
    await wrapper.setProps({ boardTheme: 'wood' })
    
    const chessBoard = wrapper.find('.chess-board')
    expect(chessBoard.classes()).toContain('board-theme-wood')
  })
})

describe('ChessBoard 工具方法', () => {
  let wrapper
  
  beforeEach(() => {
    const mockPieces = [
      new ChessPiece('test-piece', 'king', 'white', new Square(4, 4))
    ]
    
    wrapper = mount(ChessBoard, {
      props: {
        pieces: mockPieces
      }
    })
  })
  
  it('getPieceAt 应该正确返回指定位置的棋子', () => {
    const piece = wrapper.vm.getPieceAt(4, 4)
    expect(piece).toBeTruthy()
    expect(piece.type).toBe('king')
  })
  
  it('getPieceAt 应该在空位置返回 undefined', () => {
    const piece = wrapper.vm.getPieceAt(0, 0)
    expect(piece).toBeUndefined()
  })
  
  it('isSquareSelected 应该正确检查选中状态', async () => {
    await wrapper.setProps({
      selectedSquare: new Square(4, 4)
    })
    
    expect(wrapper.vm.isSquareSelected(4, 4)).toBe(true)
    expect(wrapper.vm.isSquareSelected(0, 0)).toBe(false)
  })
  
  it('isValidMoveSquare 应该正确检查有效移动', async () => {
    const validMoves = [new Square(4, 5), new Square(5, 4)]
    await wrapper.setProps({ validMoves })
    
    expect(wrapper.vm.isValidMoveSquare(4, 5)).toBe(true)
    expect(wrapper.vm.isValidMoveSquare(0, 0)).toBe(false)
  })
  
  it('getSquareClasses 应该返回正确的CSS类', async () => {
    await wrapper.setProps({
      selectedSquare: new Square(0, 0),
      validMoves: [new Square(0, 1)]
    })
    
    const selectedClasses = wrapper.vm.getSquareClasses(0, 0)
    expect(selectedClasses).toContain('selected')
    expect(selectedClasses).toContain('light-square')
    
    const validMoveClasses = wrapper.vm.getSquareClasses(0, 1)
    expect(validMoveClasses).toContain('valid-move')
    expect(validMoveClasses).toContain('dark-square')
  })
})