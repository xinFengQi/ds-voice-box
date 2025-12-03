/**
 * 快速查询意图映射 API
 * 根据意图标识快速获取映射内容（从内存缓存中读取）
 * 路由: /api/intent-mapping?intentName=xxx
 */

import { getIntentMapping } from '../utils/intent-cache.js';

export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const intentName = searchParams.get('intentName');
    
    if (!intentName) {
      return new Response(JSON.stringify({ 
        error: '缺少参数: intentName' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const mapping = await getIntentMapping(context, intentName);
    
    if (!mapping) {
      return new Response(JSON.stringify({ 
        error: '未找到对应的映射',
        intentName 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(mapping), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('查询意图映射失败:', error);
    return new Response(JSON.stringify({ 
      error: error.message || '查询失败' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

