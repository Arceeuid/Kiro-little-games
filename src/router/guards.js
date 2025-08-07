// 路由守卫工具函数

/**
 * 检查用户是否可以离开当前页面
 * @param {Object} to 目标路由
 * @param {Object} from 当前路由
 * @param {Function} next 导航确认函数
 */
export const checkCanLeave = (to, from, next) => {
  // 如果用户正在游戏中，询问是否确认离开
  const gameStore = useGameStore()
  
  if (gameStore.hasActiveGame && from.name !== 'Home') {
    const confirmed = window.confirm('您正在游戏中，确定要离开吗？游戏进度将会丢失。')
    if (confirmed) {
      gameStore.setCurrentGame(null)
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
}

/**
 * 页面加载状态管理
 * @param {Object} to 目标路由
 * @param {Object} from 当前路由
 * @param {Function} next 导航确认函数
 */
export const handlePageLoading = (to, from, next) => {
  // 显示加载状态
  const loadingElement = document.querySelector('.page-loading')
  if (loadingElement) {
    loadingElement.style.display = 'block'
  }
  
  next()
}

/**
 * 页面加载完成处理
 * @param {Object} to 目标路由
 * @param {Object} from 当前路由
 */
export const handlePageLoaded = (to, from) => {
  // 隐藏加载状态
  setTimeout(() => {
    const loadingElement = document.querySelector('.page-loading')
    if (loadingElement) {
      loadingElement.style.display = 'none'
    }
  }, 100)
}