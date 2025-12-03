/**
 * 意图管理 API
 * 提供意图的增删查改功能
 * 路由: /api/intents
 */

import { requireAuth } from '../utils/auth.js';
import { updateCacheItem, deleteCacheItem, initializeCache } from '../utils/intent-cache.js';

/**
 * 使用 Cloudflare KV 进行持久化存储
 * KV Namespace 绑定名称通过环境变量 KV_BINDING_NAME 配置
 * 如果没有设置，默认使用 INTENTS_KV
 * 
 * 配置方式：
 * 1. 在 Cloudflare Dashboard: Workers & Pages > 你的项目 > Settings > Variables
 * 2. 添加 KV Namespace 绑定，变量名可以是任意名称（如 INTENTS_KV）
 * 3. 设置环境变量 KV_BINDING_NAME 为你在 Dashboard 中配置的绑定名称
 */

const KV_KEY = 'intents'; // KV 中存储数据的 key

/**
 * 获取 KV 绑定对象
 */
function getKVBinding(context) {
  // 从环境变量获取 KV binding 名称，必须设置
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
 * 从 KV 读取数据
 */
async function getStore(context) {
  const kvInfo = getKVBinding(context);
  
  // 检查 KV 是否已配置
  if (!kvInfo) {
    if (!context.env.KV_BINDING_NAME) {
      console.error('KV_BINDING_NAME 环境变量未设置。请设置 KV_BINDING_NAME 环境变量。');
      console.error('本地开发：在 .dev.vars 文件中设置 KV_BINDING_NAME');
      console.error('生产环境：在 Cloudflare Dashboard > Settings > Variables and Secrets 中设置');
    } else {
      const bindingName = context.env.KV_BINDING_NAME;
      console.error(`KV Binding "${bindingName}" 未配置。`);
      console.error('本地开发：在 wrangler.local.toml 中添加以下配置：');
      console.error(`  [[kv_namespaces]]`);
      console.error(`  binding = "${bindingName}"`);
      console.error(`  preview_id = "your_preview_kv_namespace_id"`);
      console.error('生产环境：在 Cloudflare Dashboard > Settings > Variables > KV Namespace Bindings 中绑定');
    }
    return {
      store: [],
      nextId: 1,
      usingKV: false
    };
  }

  try {
    const kvData = await kvInfo.binding.get(KV_KEY, 'json');
    if (kvData) {
      return {
        store: kvData.store || [],
        nextId: kvData.nextId || 1,
        usingKV: true
      };
    }
    // KV 中没有数据，返回空存储
    return {
      store: [],
      nextId: 1,
      usingKV: true
    };
  } catch (error) {
    console.error('从 KV 读取数据失败:', error);
    throw new Error(`读取存储失败: ${error.message}`);
  }
}

/**
 * 保存数据到 KV
 */
async function saveStore(context, store, nextId) {
  const kvInfo = getKVBinding(context);
  
  // 检查 KV 是否已配置
  if (!kvInfo) {
    if (!context.env.KV_BINDING_NAME) {
      throw new Error('KV_BINDING_NAME 环境变量未设置。请设置 KV_BINDING_NAME 环境变量（本地开发在 .dev.vars 中，生产环境在 Dashboard 中）。');
    } else {
      const bindingName = context.env.KV_BINDING_NAME;
      throw new Error(`KV Binding "${bindingName}" 未配置。本地开发请在 wrangler.local.toml 中配置，生产环境请在 Cloudflare Dashboard 中绑定。`);
    }
  }

  try {
    await kvInfo.binding.put(KV_KEY, JSON.stringify({
      store,
      nextId
    }));
  } catch (error) {
    console.error('保存数据到 KV 失败:', error);
    throw new Error(`保存数据失败: ${error.message}`);
  }
}

/**
 * GET /api/intents - 获取所有意图
 */
export async function onRequestGet(context) {
  // 检查认证
  const authResponse = requireAuth(context.request);
  if (authResponse) return authResponse;
  try {
    const { store } = await getStore(context);
    return new Response(JSON.stringify(store), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/intents - 创建新意图
 */
export async function onRequestPost(context) {
  // 检查认证
  const authResponse = requireAuth(context.request);
  if (authResponse) return authResponse;
  try {
    const body = await context.request.json();
    
    // 验证必填字段
    if (!body.intentName || !body.apiName || !body.entityId) {
      return new Response(JSON.stringify({ 
        error: '缺少必填字段: intentName, apiName, entityId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { store, nextId } = await getStore(context);

    // 检查意图标识是否已存在
    const exists = store.some(item => item.intentName === body.intentName);
    if (exists) {
      return new Response(JSON.stringify({ 
        error: '意图标识已存在' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newItem = {
      id: nextId,
      intentName: body.intentName,
      apiName: body.apiName,
      apiLabel: body.apiLabel || '',
      entityId: body.entityId,
      replyContent: body.replyContent || ''
    };

    store.push(newItem);
    await saveStore(context, store, nextId + 1);

    // 更新内存缓存
    updateCacheItem(body.intentName, newItem);

    return new Response(JSON.stringify(newItem), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


