# 设计文档

## 概述

Vue小游戏网站是一个基于Vue 3的单页面应用，提供多种棋类小游戏。系统采用组件化架构，使用Vue Router管理路由，通过模块化设计确保代码的可维护性和可扩展性。

## 架构

### 整体架构

```
src/
├── components/          # 可复用组件
│   ├── common/         # 通用组件
│   ├── games/          # 游戏相关组件
│   └── layout/         # 布局组件
├── views/              # 页面组件
│   ├── Home.vue        # 主页
│   ├── ChineseChess.vue # 中国象棋
│   └── InternationalChess.vue # 国际象棋
├── router/             # 路由配置
├── stores/             # 状态管理
├── utils/              # 工具函数
├── assets/             # 静态资源
└── styles/             # 样式文件
```

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式**: CSS3 + CSS Modules
- **类型检查**: TypeScript (可选)

## 组件和接口

### 核心组件

#### 1. App.vue (根组件)
- 提供应用的整体布局结构
- 包含路由出口 `<router-view>`
- 管理全局样式和主题

#### 2. Home.vue (主页组件)
- 展示游戏卡片网格
- 处理游戏导航逻辑
- 响应式布局适配

#### 3. GameCard.vue (游戏卡片组件)
```javascript
interface GameCardProps {
  id: string
  name: string
  description: string
  image: string
  route: string
}
```

#### 4. ChessBoard.vue (棋盘基础组件)
```javascript
interface ChessBoardProps {
  boardSize: number
  pieces: ChessPiece[]
  selectedSquare?: Square
  validMoves?: Square[]
}

interface ChessPiece {
  id: string
  type: string
  color: 'white' | 'black'
  position: Square
}

interface Square {
  row: number
  col: number
}
```

#### 5. ChessPiece.vue (棋子组件)
```javascript
interface ChessPieceProps {
  piece: ChessPiece
  isSelected: boolean
  isValidMove: boolean
  onClick: (piece: ChessPiece) => void
}
```

### 游戏逻辑接口

#### 中国象棋游戏逻辑
```javascript
interface ChineseChessGame {
  board: ChessPiece[][]
  currentPlayer: 'red' | 'black'
  gameStatus: 'playing' | 'check' | 'checkmate' | 'draw'
  
  // 方法
  movePiece(from: Square, to: Square): boolean
  getValidMoves(piece: ChessPiece): Square[]
  isInCheck(color: string): boolean
  isCheckmate(color: string): boolean
}
```

#### 国际象棋游戏逻辑
```javascript
interface InternationalChessGame {
  board: ChessPiece[][]
  currentPlayer: 'white' | 'black'
  gameStatus: 'playing' | 'check' | 'checkmate' | 'draw'
  castlingRights: CastlingRights
  enPassantTarget?: Square
  
  // 方法
  movePiece(from: Square, to: Square): boolean
  getValidMoves(piece: ChessPiece): Square[]
  canCastle(side: 'kingside' | 'queenside'): boolean
  isInCheck(color: string): boolean
}
```

## 数据模型

### 游戏配置模型
```javascript
interface GameConfig {
  id: string
  name: string
  description: string
  image: string
  route: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### 游戏状态模型
```javascript
interface GameState {
  gameId: string
  board: ChessPiece[][]
  currentPlayer: string
  moveHistory: Move[]
  gameStatus: GameStatus
  startTime: Date
  endTime?: Date
}

interface Move {
  from: Square
  to: Square
  piece: ChessPiece
  capturedPiece?: ChessPiece
  timestamp: Date
}
```

### 用户界面状态
```javascript
interface UIState {
  selectedSquare?: Square
  validMoves: Square[]
  showMoveHistory: boolean
  gameSettings: GameSettings
}

interface GameSettings {
  showCoordinates: boolean
  enableSoundEffects: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
}
```

## 路由设计

### 路由配置
```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/chinese-chess',
    name: 'ChineseChess',
    component: ChineseChess
  },
  {
    path: '/international-chess',
    name: 'InternationalChess',
    component: InternationalChess
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]
```

### 导航守卫
- 实现页面切换时的状态保存
- 处理游戏进行中的离开确认

## 错误处理

### 错误类型定义
```javascript
enum ErrorType {
  INVALID_MOVE = 'INVALID_MOVE',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

interface GameError {
  type: ErrorType
  message: string
  details?: any
}
```

### 错误处理策略
1. **游戏逻辑错误**: 显示友好的提示信息，不中断游戏流程
2. **网络错误**: 提供重试机制和离线模式提示
3. **路由错误**: 重定向到404页面或主页
4. **组件错误**: 使用错误边界组件捕获并显示备用UI

## 测试策略

### 单元测试
- **组件测试**: 使用Vue Test Utils测试组件渲染和交互
- **游戏逻辑测试**: 测试棋类游戏规则和移动验证
- **工具函数测试**: 测试辅助函数的正确性

### 集成测试
- **路由测试**: 测试页面导航和参数传递
- **状态管理测试**: 测试Pinia store的状态变更
- **用户交互测试**: 测试完整的用户操作流程

### 端到端测试
- **游戏流程测试**: 模拟完整的游戏对局
- **响应式测试**: 测试不同屏幕尺寸下的表现
- **性能测试**: 测试应用加载速度和运行性能

### 测试工具
- **单元测试**: Vitest + Vue Test Utils
- **端到端测试**: Cypress 或 Playwright
- **代码覆盖率**: c8 或 Istanbul

## 性能优化

### 代码分割
- 使用动态导入实现路由级别的代码分割
- 游戏组件按需加载

### 资源优化
- 图片资源使用WebP格式并提供fallback
- 实现图片懒加载
- 使用CSS精灵图优化小图标

### 缓存策略
- 实现游戏状态的本地存储
- 使用Service Worker缓存静态资源

## 响应式设计

### 断点设计
- 移动端: < 768px
- 平板端: 768px - 1024px  
- 桌面端: > 1024px

### 适配策略
- 棋盘大小根据屏幕尺寸自适应
- 移动端优化触摸交互
- 使用CSS Grid和Flexbox实现灵活布局