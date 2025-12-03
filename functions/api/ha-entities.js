/**
 * Home Assistant 实体列表 API
 * 用于获取可用的实体ID列表
 * 路由: /api/ha-entities
 */

import { getAllDevices, getDevicesByDomain } from '../utils/ha-status-api.js';

/**
 * GET /api/ha-entities?domain=light|fan - 获取指定域的实体列表
 * GET /api/ha-entities - 获取所有设备
 */
export async function onRequestGet(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const domain = searchParams.get('domain'); // 可选：指定设备域

    if (!domain) {
      // 如果没有指定域，返回所有设备
      const devices = await getAllDevices(context.env);
      return new Response(JSON.stringify({
        entities: devices
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 如果指定了域，返回该域的设备
    const entities = await getDevicesByDomain(context.env, domain);
    
    return new Response(JSON.stringify({
      entities: entities.map(e => ({ ...e, domain }))
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching HA entities:', error);
    return new Response(JSON.stringify({ 
      error: error.message || '获取实体列表失败' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


