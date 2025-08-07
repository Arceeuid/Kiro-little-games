<template>
  <div class="international-chess">
    <Breadcrumb />
    
    <div class="game-header">
      <router-link to="/" class="btn btn-secondary">← 返回主页</router-link>
      <h2>国际象棋</h2>
    </div>
    
    <div class="game-content">
      <div class="game-placeholder">
        <div class="placeholder-icon">♛</div>
        <h3>国际象棋游戏</h3>
        <p>游戏功能正在开发中...</p>
        <p>即将支持完整的国际象棋对局功能</p>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../components/common/Breadcrumb.vue'

export default {
  name: 'InternationalChess',
  components: {
    Breadcrumb
  }
}
</script>

<style scoped>
.international-chess {
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
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