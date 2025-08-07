<template>
  <div class="not-found">
    <div class="error-content">
      <div class="error-animation">
        <div class="error-icon">🎮</div>
        <div class="error-code">404</div>
      </div>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移动</p>
      <div class="error-actions">
        <router-link to="/" class="btn">返回主页</router-link>
        <button @click="goBack" class="btn btn-secondary">返回上页</button>
      </div>
      
      <div class="suggestions">
        <h3>您可能想要访问：</h3>
        <div class="suggestion-links">
          <router-link to="/" class="suggestion-link">
            <span class="suggestion-icon">🏠</span>
            <span>首页</span>
          </router-link>
          <router-link to="/chinese-chess" class="suggestion-link">
            <span class="suggestion-icon">🏮</span>
            <span>中国象棋</span>
          </router-link>
          <router-link to="/international-chess" class="suggestion-link">
            <span class="suggestion-icon">♛</span>
            <span>国际象棋</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      if (window.history.length > 1) {
        router.go(-1)
      } else {
        router.push('/')
      }
    }
    
    return {
      goBack
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.error-animation {
  position: relative;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
  animation: bounce 2s infinite;
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  color: #667eea;
  opacity: 0.1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.error-content h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.error-content p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.suggestions {
  border-top: 1px solid #e9ecef;
  padding-top: 2rem;
}

.suggestions h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
}

.suggestion-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  color: #333;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.suggestion-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.suggestion-icon {
  font-size: 1.2rem;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .error-content {
    padding: 2rem 1rem;
  }
  
  .error-icon {
    font-size: 4rem;
  }
  
  .error-content h2 {
    font-size: 1.5rem;
  }
  
  .error-content p {
    font-size: 1rem;
  }
}
</style>