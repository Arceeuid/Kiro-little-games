<template>
  <nav class="breadcrumb" v-if="breadcrumbs.length > 1">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in breadcrumbs" 
        :key="item.path"
        class="breadcrumb-item"
        :class="{ active: index === breadcrumbs.length - 1 }"
      >
        <router-link 
          v-if="index < breadcrumbs.length - 1" 
          :to="item.path"
          class="breadcrumb-link"
        >
          {{ item.name }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ item.name }}</span>
        <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">
          →
        </span>
      </li>
    </ol>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    
    const breadcrumbs = computed(() => {
      const matched = route.matched.filter(item => item.name)
      const breadcrumbItems = []
      
      // 总是包含首页
      if (route.name !== 'Home') {
        breadcrumbItems.push({
          name: '首页',
          path: '/'
        })
      }
      
      // 添加当前页面
      const routeNames = {
        'Home': '首页',
        'ChineseChess': '中国象棋',
        'InternationalChess': '国际象棋',
        'NotFound': '页面未找到'
      }
      
      if (route.name && route.name !== 'Home') {
        breadcrumbItems.push({
          name: routeNames[route.name] || route.name,
          path: route.path
        })
      }
      
      return breadcrumbItems
    })
    
    return {
      breadcrumbs
    }
  }
}
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.breadcrumb-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
}

.breadcrumb-separator {
  color: #6c757d;
  font-size: 0.8rem;
  margin: 0 0.25rem;
}

@media (max-width: 768px) {
  .breadcrumb {
    margin-bottom: 1rem;
  }
  
  .breadcrumb-link,
  .breadcrumb-current {
    font-size: 0.8rem;
  }
  
  .breadcrumb-separator {
    font-size: 0.7rem;
  }
}
</style>