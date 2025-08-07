<template>
  <div class="chinese-chess">
    <Breadcrumb />
    
    <div class="game-header">
      <router-link to="/" class="btn btn-secondary">← 返回主页</router-link>
      <h2>中国象棋</h2>
    </div>
    
    <div class="game-content">
      <div class="game-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'demo' }"
          @click="activeTab = 'demo'"
        >
          棋盘演示
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'game' }"
          @click="activeTab = 'game'"
        >
          游戏模式
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'test' }"
          @click="activeTab = 'test'"
        >
          测试模式
        </button>
      </div>
      
      <div v-if="activeTab === 'demo'" class="tab-content">
        <ChessBoardDemo />
      </div>
      
      <div v-if="activeTab === 'game'" class="tab-content">
        <ChineseChessGameEnhanced @back-to-home="goHome" />
      </div>
      
      <div v-if="activeTab === 'test'" class="tab-content">
        <ChineseChessTest />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Breadcrumb from '../components/common/Breadcrumb.vue'
import ChessBoardDemo from '../components/games/ChessBoardDemo.vue'
import ChineseChessGameEnhanced from '../components/games/ChineseChessGameEnhanced.vue'
import ChineseChessTest from '../components/games/ChineseChessTest.vue'

export default {
  name: 'ChineseChess',
  components: {
    Breadcrumb,
    ChessBoardDemo,
    ChineseChessGameEnhanced,
    ChineseChessTest
  },
  setup() {
    const router = useRouter()
    const activeTab = ref('test') // 默认显示测试模式
    
    const goHome = () => {
      router.push('/')
    }
    
    return {
      activeTab,
      goHome
    }
  }
}
</script>

<style scoped>
.chinese-chess {
  max-width: 1000px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.game-header h2 {
  font-size: 2rem;
  color: #333;
}

.game-content {
  min-height: 500px;
}

.game-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #333;
  background: rgba(102, 126, 234, 0.1);
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.game-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.game-placeholder {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.game-placeholder h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
}

.game-placeholder p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .game-header h2 {
    font-size: 1.5rem;
  }
  
  .game-placeholder {
    padding: 2rem 1rem;
  }
  
  .placeholder-icon {
    font-size: 4rem;
  }
  
  .game-placeholder h3 {
    font-size: 1.5rem;
  }
  
  .game-placeholder p {
    font-size: 1rem;
  }
}
</style>