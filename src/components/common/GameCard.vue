<template>
  <div class="game-card card" @click="handleClick" :class="{ loading: isLoading }">
    <div class="card-content">
      <div class="game-icon-container">
        <div class="game-icon">{{ game.icon }}</div>
        <div v-if="game.difficulty" class="difficulty-badge" :class="game.difficulty">
          {{ difficultyText }}
        </div>
      </div>
      
      <div class="game-info">
        <h3>{{ game.name }}</h3>
        <p class="game-description">{{ game.description }}</p>
        
        <div class="game-meta">
          <span class="game-category">{{ game.category }}</span>
          <span class="game-players">{{ game.players }}</span>
        </div>
        
        <div class="game-stats" v-if="game.stats">
          <div class="stat-item">
            <span class="stat-label">游戏次数</span>
            <span class="stat-value">{{ game.stats.playCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最佳成绩</span>
            <span class="stat-value">{{ game.stats.bestScore || '-' }}</span>
          </div>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>开始游戏</span>
        </button>
        <button class="btn btn-secondary" @click.stop="showGameInfo">
          游戏说明
        </button>
      </div>
    </div>
    
    <!-- 游戏预览图片 -->
    <div v-if="game.image" class="game-preview">
      <img :src="game.image" :alt="game.name" @load="onImageLoad" @error="onImageError">
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GameCard',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  emits: ['game-info', 'game-start'],
  setup(props, setupContext) {
    const router = useRouter()
    const isLoading = ref(false)
    
    const difficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    }
    
    const difficultyText = difficultyMap[props.game.difficulty] || ''
    
    const handleClick = async function() {
      if (isLoading.value) return
      
      isLoading.value = true
      setupContext.emit('game-start', props.game)
      
      await new Promise(function(resolve) {
        setTimeout(resolve, 300)
      })
      await router.push(props.game.route)
      
      isLoading.value = false
    }
    
    const showGameInfo = function() {
      setupContext.emit('game-info', props.game)
    }
    
    const onImageLoad = function() {
      console.log(props.game.name + ' 预览图加载成功')
    }
    
    const onImageError = function() {
      console.log(props.game.name + ' 预览图加载失败')
    }
    
    return {
      isLoading,
      difficultyText,
      handleClick,
      showGameInfo,
      onImageLoad,
      onImageError
    }
  }
}
</script>

<style scoped>
.game-card {
  position: relative;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.game-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

.card-content {
  padding: 2rem;
  position: relative;
  z-index: 2;
}

.game-icon-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.game-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.difficulty-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
}

.difficulty-badge.easy {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.difficulty-badge.medium {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.difficulty-badge.hard {
  background: linear-gradient(135deg, #dc3545, #e83e8c);
}

.game-info h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
}

.game-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  font-size: 0.85rem;
}

.game-category {
  color: #667eea;
  font-weight: 500;
}

.game-players {
  color: #666;
}

.game-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn {
  flex: 1;
  max-width: 120px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.game-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  z-index: 1;
}

.game-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .card-content {
    padding: 1.5rem;
  }
  
  .game-icon {
    font-size: 3rem;
  }
  
  .game-info h3 {
    font-size: 1.3rem;
  }
  
  .game-description {
    font-size: 0.9rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .btn {
    max-width: none;
  }
}
</style>