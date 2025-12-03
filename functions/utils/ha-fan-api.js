/**
 * Home Assistant 风扇控制 API
 * 用于控制风扇设备
 */

import { callHAService } from './ha-common.js';

/**
 * 打开风扇
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID（如 'fan.xiaomi_fan'）
 * @param {Object} options - 可选参数
 * @param {number} options.percentage - 风速百分比 (0-100)
 * @param {string} options.presetMode - 预设模式（如 '自然风', '直吹风'）
 * @returns {Promise<Object>} API 响应
 */
export async function turnOnFan(env, entityId, options = {}) {
  const data = { entity_id: entityId };
  
  if (options.percentage !== undefined) {
    data.percentage = options.percentage;
  }
  if (options.presetMode) {
    data.preset_mode = options.presetMode;
  }

  return await callHAService(env, 'fan', 'turn_on', data);
}

/**
 * 关闭风扇
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function turnOffFan(env, entityId) {
  return await callHAService(env, 'fan', 'turn_off', {
    entity_id: entityId
  });
}

/**
 * 切换风扇开关状态
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function toggleFan(env, entityId) {
  return await callHAService(env, 'fan', 'toggle', {
    entity_id: entityId
  });
}

/**
 * 设置风扇风速百分比
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID
 * @param {number} percentage - 风速百分比 (0-100)
 * @returns {Promise<Object>} API 响应
 */
export async function setFanPercentage(env, entityId, percentage) {
  return await callHAService(env, 'fan', 'set_percentage', {
    entity_id: entityId,
    percentage
  });
}

/**
 * 设置风扇预设模式
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID
 * @param {string} presetMode - 预设模式（如 '自然风', '直吹风'）
 * @returns {Promise<Object>} API 响应
 */
export async function setFanPresetMode(env, entityId, presetMode) {
  return await callHAService(env, 'fan', 'set_preset_mode', {
    entity_id: entityId,
    preset_mode: presetMode
  });
}

/**
 * 控制风扇摆风
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID
 * @param {boolean} oscillating - 是否开启摆风
 * @returns {Promise<Object>} API 响应
 */
export async function setFanOscillate(env, entityId, oscillating) {
  return await callHAService(env, 'fan', 'oscillate', {
    entity_id: entityId,
    oscillating
  });
}

