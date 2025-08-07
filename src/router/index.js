import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页 - Vue 小游戏网站',
      description: '选择你喜欢的棋类游戏开始游戏'
    }
  },
  {
    path: '/chinese-chess',
    name: 'ChineseChess',
    component: () => import('../views/ChineseChess.vue'),
    meta: {
      title: '中国象棋 - Vue 小游戏网站',
      description: '体验传统的中国象棋游戏'
    }
  },
  {
    path: '/international-chess',
    name: 'InternationalChess',
    component: () => import('../views/InternationalChess.vue'),
    meta: {
      title: '国际象棋 - Vue 小游戏网站',
      description: '挑战经典的国际象棋游戏'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到 - Vue 小游戏网站',
      description: '抱歉，您访问的页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置，则恢复
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 设置页面描述
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = to.meta.description
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等逻辑
  console.log(`导航从 ${from.path} 到 ${to.path}`)
})

export default router