// 工具函数集合

/**
 * 延迟执行函数
 * @param {number} ms 延迟毫秒数
 * @returns {Promise}
 */
export const delay = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms)
  })
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export const deepClone = function(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(function(item) { return deepClone(item) })
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @returns {Function} 防抖后的函数
 */
export const debounce = function(func, wait) {
  let timeout
  return function() {
    const context = this
    const args = arguments
    const later = function() {
      clearTimeout(timeout)
      func.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间限制
 * @returns {Function} 节流后的函数
 */
export const throttle = function(func, limit) {
  let inThrottle
  return function() {
    const context = this
    const args = arguments
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(function() { inThrottle = false }, limit)
    }
  }
}