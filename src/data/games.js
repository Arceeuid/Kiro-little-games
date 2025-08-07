// 游戏配置数据

export const gamesData = [
  {
    id: 'chinese-chess',
    name: '中国象棋',
    description: '体验传统的中国象棋，感受千年棋艺的魅力。楚河汉界，运筹帷幄，在这里展现你的智慧与策略。',
    icon: '🏮',
    route: '/chinese-chess',
    category: '策略棋类',
    difficulty: 'medium',
    players: '2人对战',
    image: null, // 可以后续添加预览图
    stats: {
      playCount: 0,
      bestScore: null,
      lastPlayed: null
    },
    features: [
      '经典中国象棋规则',
      '智能移动提示',
      '悔棋功能',
      '游戏记录保存'
    ],
    rules: {
      objective: '将死对方的将（帅）',
      pieces: {
        '将/帅': '只能在九宫内移动，每次移动一格',
        '士/仕': '只能在九宫内斜向移动',
        '象/相': '斜向移动两格，不能过河',
        '马': 'L形移动，会被蹩马腿',
        '车': '横竖直线移动',
        '炮': '隔子吃棋',
        '兵/卒': '向前移动，过河后可横向移动'
      }
    }
  },
  {
    id: 'international-chess',
    name: '国际象棋',
    description: '挑战经典的国际象棋，展现你的战略思维。64格棋盘上的智慧较量，体验世界级的棋类游戏。',
    icon: '♛',
    route: '/international-chess',
    category: '策略棋类',
    difficulty: 'hard',
    players: '2人对战',
    image: null,
    stats: {
      playCount: 0,
      bestScore: null,
      lastPlayed: null
    },
    features: [
      '标准国际象棋规则',
      '王车易位',
      '吃过路兵',
      '兵的升变',
      '将军检测'
    ],
    rules: {
      objective: '将死对方的王',
      pieces: {
        '王': '任意方向移动一格',
        '后': '任意方向移动任意格数',
        '车': '横竖直线移动',
        '象': '斜向移动任意格数',
        '马': 'L形移动',
        '兵': '向前移动，斜向吃子'
      },
      specialRules: [
        '王车易位：王和车的特殊移动',
        '吃过路兵：兵的特殊吃法',
        '兵的升变：兵到达底线可升变为其他棋子'
      ]
    }
  }
]

// 根据ID获取游戏数据
export const getGameById = (id) => {
  return gamesData.find(game => game.id === id)
}

// 获取游戏统计信息
export const getGameStats = (id) => {
  const game = getGameById(id)
  return game ? game.stats : null
}

// 更新游戏统计信息
export const updateGameStats = (id, stats) => {
  const game = getGameById(id)
  if (game) {
    game.stats = Object.assign({}, game.stats, stats)
    // 这里可以添加本地存储逻辑
    localStorage.setItem(`game-stats-${id}`, JSON.stringify(game.stats))
  }
}

// 从本地存储加载游戏统计
export const loadGameStats = () => {
  gamesData.forEach(game => {
    const savedStats = localStorage.getItem(`game-stats-${game.id}`)
    if (savedStats) {
      try {
        game.stats = Object.assign({}, game.stats, JSON.parse(savedStats))
      } catch (error) {
        console.error(`加载游戏统计失败: ${game.id}`, error)
      }
    }
  })
}

// 获取游戏分类
export const getGameCategories = () => {
  const categorySet = new Set(gamesData.map(game => game.category))
  const categories = Array.from(categorySet)
  return categories
}

// 根据分类筛选游戏
export const getGamesByCategory = (category) => {
  return gamesData.filter(game => game.category === category)
}

// 根据难度筛选游戏
export const getGamesByDifficulty = (difficulty) => {
  return gamesData.filter(game => game.difficulty === difficulty)
}