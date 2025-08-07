<template>
  <div class="home">
    <Breadcrumb />
    
    <div class="hero">
      <h2>欢迎来到小游戏世界</h2>
      <p>选择你喜欢的游戏开始游戏吧！</p>
      
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">{{ totalGames }}</span>
          <span class="stat-label">可用游戏</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalPlays }}</span>
          <span class="stat-label">总游戏次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ gameCategories.length }}</span>
          <span class="stat-label">游戏分类</span>
        </div>
      </div>
    </div>
    
    <!-- 游戏筛选 -->
    <div class="game-filters">
      <div class="filter-group">
        <label>分类筛选：</label>
        <select v-model="selectedCategory" @change="filterGames">
          <option value="">全部分类</option>
          <option v-for="category in gameCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>难度筛选：</label>
        <select v-model="selectedDifficulty" @change="filterGames">
          <option value="">全部难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </div>
      
      <div class="filter-group">
        <button class="btn btn-secondary" @click="resetFilters">重置筛选</button>
      </div>
    </div>
    
    <!-- 游戏网格 -->
    <div class="games-section">
      <div v-if="filteredGames.length === 0" class="no-games">
        <div class="no-games-icon">🎮</div>
        <h3>没有找到符合条件的游戏</h3>
        <p>请尝试调整筛选条件</p>
        <button class="btn" @click="resetFilters">重置筛选</button>
      </div>
      
      <div v-else class="games-grid grid grid-2">
        <GameCard
          v-for="game in filteredGames"
          :key="game.id"
          :game="game"
          @game-info="showGameInfo"
          @game-start="handleGameStart"
        />
      </div>
    </div>
    
    <!-- 游戏信息模态框 -->
    <GameInfoModal
      :show="showModal"
      :game="selectedGame"
      @close="closeModal"
      @start-game="handleGameStart"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import GameCard from '../components/common/GameCard.vue'
import GameInfoModal from '../components/common/GameInfoModal.vue'
import { gamesData, getGameCategories, loadGameStats, updateGameStats } from '../data/games.js'

export default {
  name: 'Home',
  components: {
    Breadcrumb,
    GameCard,
    GameInfoModal
  },
  setup() {
    const selectedCategory = ref('')
    const selectedDifficulty = ref('')
    const showModal = ref(false)
    const selectedGame = ref({})
    
    // 计算属性
    const totalGames = computed(() => gamesData.length)
    
    const totalPlays = computed(() => {
      return gamesData.reduce((total, game) => total + (game.stats.playCount || 0), 0)
    })
    
    const gameCategories = computed(() => getGameCategories())
    
    const filteredGames = computed(() => {
      let games = [...gamesData]
      
      if (selectedCategory.value) {
        games = games.filter(game => game.category === selectedCategory.value)
      }
      
      if (selectedDifficulty.value) {
        games = games.filter(game => game.difficulty === selectedDifficulty.value)
      }
      
      return games
    })
    
    // 方法
    const filterGames = () => {
      // 筛选逻辑已在计算属性中处理
      console.log('筛选游戏:', { 
        category: selectedCategory.value, 
        difficulty: selectedDifficulty.value 
      })
    }
    
    const resetFilters = () => {
      selectedCategory.value = ''
      selectedDifficulty.value = ''
    }
    
    const showGameInfo = (game) => {
      selectedGame.value = game
      showModal.value = true
    }
    
    const closeModal = () => {
      showModal.value = false
      selectedGame.value = {}
    }
    
    const handleGameStart = (game) => {
      console.log('开始游戏:', game.name)
      
      // 更新游戏统计
      const newStats = {
        playCount: (game.stats.playCount || 0) + 1,
        lastPlayed: new Date().toISOString()
      }
      
      updateGameStats(game.id, newStats)
      
      // 可以在这里添加其他游戏开始的逻辑
      // 比如记录用户行为、显示加载状态等
    }
    
    // 生命周期
    onMounted(() => {
      // 加载游戏统计数据
      loadGameStats()
      console.log('主页加载完成，游戏数据:', gamesData)
    })
    
    return {
      selectedCategory,
      selectedDifficulty,
      showModal,
      selectedGame,
      totalGames,
      totalPlays,
      gameCategories,
      filteredGames,
      filterGames,
      resetFilters,
      showGameInfo,
      closeModal,
      handleGameStart
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
}

.hero h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.game-filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.filter-group select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.games-section {
  margin-top: 2rem;
}

.games-grid {
  gap: 2rem;
}

.no-games {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.no-games-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-games h3 {
  color: #333;
  margin-bottom: 1rem;
}

.no-games p {
  color: #666;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem;
  }
  
  .hero h2 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
  
  .hero-stats {
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .game-filters {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-group {
    justify-content: space-between;
  }
  
  .filter-group select {
    min-width: auto;
    flex: 1;
  }
  
  .games-grid {
    gap: 1.5rem;
  }
  
  .no-games {
    padding: 3rem 1.5rem;
  }
  
  .no-games-icon {
    font-size: 3rem;
  }
}
</style>