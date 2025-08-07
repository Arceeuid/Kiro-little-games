<template>
  <div class="modal-overlay" v-if="show" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ game.name }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <div class="game-overview">
          <div class="game-icon-large">{{ game.icon }}</div>
          <div class="game-basic-info">
            <p class="game-description">{{ game.description }}</p>
            <div class="game-details">
              <div class="detail-item">
                <span class="detail-label">分类：</span>
                <span class="detail-value">{{ game.category }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">难度：</span>
                <span class="detail-value difficulty" :class="game.difficulty">
                  {{ difficultyText }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">玩家：</span>
                <span class="detail-value">{{ game.players }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="game-features" v-if="game.features">
          <h3>游戏特色</h3>
          <ul class="features-list">
            <li v-for="feature in game.features" :key="feature">
              <span class="feature-icon">✓</span>
              {{ feature }}
            </li>
          </ul>
        </div>
        
        <div class="game-rules" v-if="game.rules">
          <h3>游戏规则</h3>
          <div class="rules-content">
            <div class="rule-section">
              <h4>游戏目标</h4>
              <p>{{ game.rules.objective }}</p>
            </div>
            
            <div class="rule-section" v-if="game.rules.pieces">
              <h4>棋子移动</h4>
              <div class="pieces-rules">
                <div 
                  v-for="(rule, piece) in game.rules.pieces" 
                  :key="piece"
                  class="piece-rule"
                >
                  <span class="piece-name">{{ piece }}：</span>
                  <span class="piece-description">{{ rule }}</span>
                </div>
              </div>
            </div>
            
            <div class="rule-section" v-if="game.rules.specialRules">
              <h4>特殊规则</h4>
              <ul class="special-rules-list">
                <li v-for="rule in game.rules.specialRules" :key="rule">
                  {{ rule }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="game-stats-section" v-if="game.stats">
          <h3>游戏统计</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ game.stats.playCount || 0 }}</div>
              <div class="stat-label">游戏次数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ game.stats.bestScore || '-' }}</div>
              <div class="stat-label">最佳成绩</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ lastPlayedText }}</div>
              <div class="stat-label">最后游戏</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">关闭</button>
        <button class="btn btn-primary" @click="startGame">开始游戏</button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GameInfoModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    game: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'start-game'],
  setup(props, { emit }) {
    const router = useRouter()
    
    const difficultyText = computed(() => {
      const texts = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      }
      return texts[props.game.difficulty] || '未知'
    })
    
    const lastPlayedText = computed(() => {
      if (!props.game.stats.lastPlayed) return '从未'
      
      const lastPlayed = new Date(props.game.stats.lastPlayed)
      const now = new Date()
      const diffTime = now - lastPlayed
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      return `${Math.floor(diffDays / 30)}月前`
    })
    
    const closeModal = () => {
      emit('close')
    }
    
    const startGame = () => {
      emit('start-game', props.game)
      router.push(props.game.route)
      closeModal()
    }
    
    return {
      difficultyText,
      lastPlayedText,
      closeModal,
      startGame
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 2rem;
}

.game-overview {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.game-icon-large {
  font-size: 5rem;
  flex-shrink: 0;
}

.game-basic-info {
  flex: 1;
}

.game-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.game-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #333;
  min-width: 60px;
}

.detail-value {
  color: #666;
}

.detail-value.difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.difficulty.easy { background: #28a745; }
.difficulty.medium { background: #ffc107; color: #333; }
.difficulty.hard { background: #dc3545; }

.game-features,
.game-rules,
.game-stats-section {
  margin-bottom: 2rem;
}

.game-features h3,
.game-rules h3,
.game-stats-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;
}

.feature-icon {
  color: #28a745;
  font-weight: bold;
}

.rules-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.rule-section {
  margin-bottom: 1.5rem;
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-section h4 {
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.pieces-rules {
  display: grid;
  gap: 0.5rem;
}

.piece-rule {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.piece-name {
  font-weight: 500;
  color: #333;
  min-width: 80px;
  flex-shrink: 0;
}

.piece-description {
  color: #666;
  line-height: 1.4;
}

.special-rules-list {
  list-style: disc;
  padding-left: 1.5rem;
  color: #666;
}

.special-rules-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem;
  border-top: 1px solid #e9ecef;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .game-overview {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .game-icon-large {
    font-size: 4rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem 1.5rem;
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style>