/**
 * 意图映射内存缓存
 * 用于快速查询意图映射，key 为意图标识，value 为映射内容
 */

// 全局内存缓存
let intentCache = null;
let cacheInitialized = false;
let cachePromise = null; // 用于防止并发初始化

/**
 * 初始化缓存
 * @param {Object} context - Cloudflare Pages context
 * @param {Array} store - 映射数据数组（可选，如果不提供则从 KV 读取）
 * @returns {Promise<void>}
 */
export async function initializeCache(context, store = null) {
  // 如果正在初始化，等待初始化完成
  if (cachePromise) {
    return cachePromise;
  }

  // 如果已经初始化，直接返回
  if (cacheInitialized && intentCache !== null) {
    return;
  }

  // 开始初始化
  cachePromise = (async () => {
    try {
      let data = store;
      
      // 如果没有提供数据，从 KV 读取
      if (!data) {
        const kvInfo = getKVBinding(context);
        if (kvInfo) {
          const KV_KEY = 'intents';
          const kvData = await kvInfo.binding.get(KV_KEY, 'json');
          data = kvData?.store || [];
        } else {
          data = [];
        }
      }
      
      // 创建 Map，key 为意图标识，value 为映射内容
      intentCache = new Map();
      data.forEach(item => {
        intentCache.set(item.intentName, item);
      });
      
      cacheInitialized = true;
      console.log(`[Intent Cache] 初始化完成，加载了 ${intentCache.size} 条映射`);
    } catch (error) {
      console.error('[Intent Cache] 初始化失败:', error);
      // 初始化失败时，创建一个空的 Map
      intentCache = new Map();
      cacheInitialized = true;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

/**
 * 获取 KV 绑定对象（从 intents.js 复制）
 */
function getKVBinding(context) {
  if (!context.env.KV_BINDING_NAME) {
    return null;
  }
  const bindingName = context.env.KV_BINDING_NAME;
  const kvBinding = context.env[bindingName];
  if (!kvBinding) {
    return null;
  }
  return { binding: kvBinding, bindingName };
}

/**
 * 获取缓存（如果未初始化则先初始化）
 * @param {Object} context - Cloudflare Pages context
 * @returns {Promise<Map>} 意图映射 Map
 */
export async function getCache(context) {
  if (!cacheInitialized || intentCache === null) {
    await initializeCache(context);
  }
  return intentCache;
}

/**
 * 根据意图标识获取映射
 * @param {Object} context - Cloudflare Pages context
 * @param {string} intentName - 意图标识
 * @returns {Promise<Object|null>} 映射内容，如果不存在返回 null
 */
export async function getIntentMapping(context, intentName) {
  const cache = await getCache(context);
  return cache.get(intentName) || null;
}

/**
 * 更新缓存中的单个映射
 * @param {string} intentName - 意图标识
 * @param {Object} mapping - 映射内容
 */
export function updateCacheItem(intentName, mapping) {
  if (intentCache) {
    intentCache.set(intentName, mapping);
    console.log(`[Intent Cache] 更新映射: ${intentName}`);
  }
}

/**
 * 从缓存中删除映射
 * @param {string} intentName - 意图标识
 */
export function deleteCacheItem(intentName) {
  if (intentCache) {
    intentCache.delete(intentName);
    console.log(`[Intent Cache] 删除映射: ${intentName}`);
  }
}

/**
 * 重新加载缓存（从 KV 重新加载所有数据）
 * @param {Object} context - Cloudflare Pages context
 * @returns {Promise<void>}
 */
export async function reloadCache(context) {
  cacheInitialized = false;
  intentCache = null;
  await initializeCache(context);
}

/**
 * 获取所有映射（用于调试）
 * @param {Object} context - Cloudflare Pages context
 * @returns {Promise<Array>} 所有映射的数组
 */
export async function getAllMappings(context) {
  const cache = await getCache(context);
  return Array.from(cache.values());
}

