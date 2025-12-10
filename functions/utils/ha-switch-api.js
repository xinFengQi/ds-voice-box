/**
 * Home Assistant 开关控制 API
 * 用于控制开关设备
 */

import { callHAService } from './ha-common.js';

/**
 * 打开开关
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 开关实体ID（如 'switch.kitchen'）
 * @returns {Promise<Object>} API 响应
 */
export async function turnOnSwitch(env, entityId) {
  const res = await callHAService(env, 'switch', 'turn_on', {
    entity_id: entityId
  });
  console.log('turnOnSwitch', res);
  return res;
}

/**
 * 关闭开关
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 开关实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function turnOffSwitch(env, entityId) {
  return await callHAService(env, 'switch', 'turn_off', {
    entity_id: entityId
  });
}

/**
 * 切换开关状态
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 开关实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function toggleSwitch(env, entityId) {
  return await callHAService(env, 'switch', 'toggle', {
    entity_id: entityId
  });
}

