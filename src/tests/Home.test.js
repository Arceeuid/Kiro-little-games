// Home.vue 组件单元测试
// 注意：这是一个测试文件示例，实际运行需要配置测试环境

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { gamesData } from '../data/games.js'

// 模拟路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/chinese-chess', component: { template: '<div>Chinese Chess</div>' } },
    { path: '/international-chess', component: { template: '<div>International Chess</div>' } }
  ]
})

describe('Home.vue', () => {
  let wrapper
  
  beforeEach(async () => {
    wrapper = mount(Home, {
      global: {
        plugins: [router]
      }
    })
    await router.isReady()
  })
  
  it('应该正确渲染主页标题', () => {
    expect(wrapper.find('.hero h2').text()).toBe('欢迎来到小游戏世界')
  })
  
  it('应该显示正确的游戏数量统计', () => {
    const totalGamesElement = wrapper.find('.stat-number')
    expect(totalGamesElement.text()).toBe(gamesData.length.toString())
  })
  
  it('应该渲染所有游戏卡片', () => {
    const gameCards = wrapper.findAllComponents({ name: 'GameCard' })
    expect(gameCards).toHaveLength(gamesData.length)
  })
  
  it('应该正确处理分类筛选', async () => {
    const categorySelect = wrapper.find('select').element
    categorySelect.value = '策略棋类'
    await categorySelect.dispatchEvent(new Event('change'))
    
    // 验证筛选后的游戏数量
    const filteredGames = gamesData.filter(game => game.category === '策略棋类')
    const gameCards = wrapper.findAllComponents({ name: 'GameCard' })
    expect(gameCards).toHaveLength(filteredGames.length)
  })
  
  it('应该正确处理难度筛选', async () => {
    const difficultySelects = wrapper.findAll('select')
    const difficultySelect = difficultySelects[1].element
    difficultySelect.value = 'medium'
    await difficultySelect.dispatchEvent(new Event('change'))
    
    // 验证筛选后的游戏数量
    const filteredGames = gamesData.filter(game => game.difficulty === 'medium')
    const gameCards = wrapper.findAllComponents({ name: 'GameCard' })
    expect(gameCards).toHaveLength(filteredGames.length)
  })
  
  it('应该能够重置筛选条件', async () => {
    // 先设置筛选条件
    const categorySelect = wrapper.find('select').element
    categorySelect.value = '策略棋类'
    await categorySelect.dispatchEvent(new Event('change'))
    
    // 点击重置按钮
    const resetButton = wrapper.find('.filter-group button')
    await resetButton.trigger('click')
    
    // 验证筛选条件已重置
    expect(wrapper.vm.selectedCategory).toBe('')
    expect(wrapper.vm.selectedDifficulty).toBe('')
  })
  
  it('应该能够打开游戏信息模态框', async () => {
    const gameCard = wrapper.findComponent({ name: 'GameCard' })
    await gameCard.vm.$emit('game-info', gamesData[0])
    
    expect(wrapper.vm.showModal).toBe(true)
    expect(wrapper.vm.selectedGame).toEqual(gamesData[0])
  })
  
  it('应该能够关闭游戏信息模态框', async () => {
    // 先打开模态框
    wrapper.vm.showModal = true
    wrapper.vm.selectedGame = gamesData[0]
    
    // 关闭模态框
    const modal = wrapper.findComponent({ name: 'GameInfoModal' })
    await modal.vm.$emit('close')
    
    expect(wrapper.vm.showModal).toBe(false)
  })
  
  it('应该正确处理游戏开始事件', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const gameCard = wrapper.findComponent({ name: 'GameCard' })
    
    await gameCard.vm.$emit('game-start', gamesData[0])
    
    expect(consoleSpy).toHaveBeenCalledWith('开始游戏:', gamesData[0].name)
  })
  
  it('当没有符合条件的游戏时应该显示空状态', async () => {
    // 设置一个不存在的筛选条件
    wrapper.vm.selectedCategory = '不存在的分类'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.no-games').exists()).toBe(true)
    expect(wrapper.find('.no-games h3').text()).toBe('没有找到符合条件的游戏')
  })
})

// 游戏数据测试
describe('Games Data', () => {
  it('应该包含必要的游戏数据', () => {
    expect(gamesData).toHaveLength(2)
    
    gamesData.forEach(game => {
      expect(game).toHaveProperty('id')
      expect(game).toHaveProperty('name')
      expect(game).toHaveProperty('description')
      expect(game).toHaveProperty('icon')
      expect(game).toHaveProperty('route')
      expect(game).toHaveProperty('category')
      expect(game).toHaveProperty('difficulty')
      expect(game).toHaveProperty('players')
      expect(game).toHaveProperty('stats')
    })
  })
  
  it('游戏路由应该正确配置', () => {
    const chineseChess = gamesData.find(game => game.id === 'chinese-chess')
    const internationalChess = gamesData.find(game => game.id === 'international-chess')
    
    expect(chineseChess.route).toBe('/chinese-chess')
    expect(internationalChess.route).toBe('/international-chess')
  })
  
  it('游戏统计数据应该有默认值', () => {
    gamesData.forEach(game => {
      expect(game.stats).toHaveProperty('playCount')
      expect(game.stats).toHaveProperty('bestScore')
      expect(game.stats).toHaveProperty('lastPlayed')
    })
  })
})