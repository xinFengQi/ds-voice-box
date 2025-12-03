/**
 * Home Assistant 灯光控制 API
 * 用于控制灯光设备
 */

import { callHAService } from './ha-common.js';

/**
 * 打开灯光
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 灯光实体ID（如 'light.kitchen'）
 * @param {Object} options - 可选参数
 * @param {number} options.brightness - 亮度 (0-255)
 * @param {Array<number>} options.rgbColor - RGB颜色 [r, g, b]
 * @param {number} options.colorTemp - 色温
 * @returns {Promise<Object>} API 响应
 */
export async function turnOnLight(env, entityId, options = {}) {
  const data = { entity_id: entityId };
  
  if (options.brightness !== undefined) {
    data.brightness = options.brightness;
  }
  if (options.rgbColor) {
    data.rgb_color = options.rgbColor;
  }
  if (options.colorTemp !== undefined) {
    data.color_temp = options.colorTemp;
  }

  return await callHAService(env, 'light', 'turn_on', data);
}

/**
 * 关闭灯光
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 灯光实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function turnOffLight(env, entityId) {
  return await callHAService(env, 'light', 'turn_off', {
    entity_id: entityId
  });
}

/**
 * 切换灯光开关状态
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 灯光实体ID
 * @returns {Promise<Object>} API 响应
 */
export async function toggleLight(env, entityId) {
  return await callHAService(env, 'light', 'toggle', {
    entity_id: entityId
  });
}

/**
 * 设置灯光亮度
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 灯光实体ID
 * @param {number} brightness - 亮度 (0-255)
 * @returns {Promise<Object>} API 响应
 */
export async function setLightBrightness(env, entityId, brightness) {
  return await turnOnLight(env, entityId, { brightness });
}

/**
 * 设置灯光颜色
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 灯光实体ID
 * @param {number} r - 红色 (0-255)
 * @param {number} g - 绿色 (0-255)
 * @param {number} b - 蓝色 (0-255)
 * @param {number} brightness - 亮度 (0-255)，默认255
 * @returns {Promise<Object>} API 响应
 */
export async function setLightColor(env, entityId, r, g, b, brightness = 255) {
  return await turnOnLight(env, entityId, {
    rgb_color: [r, g, b],
    brightness
  });
}

