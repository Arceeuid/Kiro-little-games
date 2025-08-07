<template>
  <div id="app">
    <header class="app-header">
      <nav class="nav">
        <router-link to="/" class="nav-brand">
          <h1>🎮 小游戏网站</h1>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact-active-class="active">
            首页
          </router-link>
          <router-link to="/chinese-chess" class="nav-link" active-class="active">
            中国象棋
          </router-link>
          <router-link to="/international-chess" class="nav-link" active-class="active">
            国际象棋
          </router-link>
        </div>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: showMobileMenu }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
      
      <div class="mobile-menu" :class="{ show: showMobileMenu }">
        <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
          首页
        </router-link>
        <router-link to="/chinese-chess" class="mobile-nav-link" @click="closeMobileMenu">
          中国象棋
        </router-link>
        <router-link to="/international-chess" class="mobile-nav-link" @click="closeMobileMenu">
          国际象棋
        </router-link>
      </div>
    </header>
    
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2024 Vue 小游戏网站</p>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const showMobileMenu = ref(false)
    
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }
    
    const closeMobileMenu = () => {
      showMobileMenu.value = false
    }
    
    return {
      showMobileMenu,
      toggleMobileMenu,
      closeMobileMenu
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-brand {
  text-decoration: none;
  color: white;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  width: 30px;
  height: 30px;
  justify-content: space-around;
}

.mobile-menu-btn span {
  display: block;
  height: 3px;
  width: 100%;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-10px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.mobile-menu.show {
  display: block;
  transform: translateY(0);
  opacity: 1;
}

.mobile-nav-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-link:last-child {
  border-bottom: none;
}

.mobile-nav-link:hover {
  padding-left: 1rem;
  color: #f0f0f0;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  background: #f8f9fa;
  text-align: center;
  padding: 1rem;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@media (max-width: 768px) {
  .nav {
    padding: 0 1rem;
  }
  
  .nav-brand h1 {
    font-size: 1.5rem;
  }
  
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .app-main {
    padding: 1rem;
  }
}
</style>