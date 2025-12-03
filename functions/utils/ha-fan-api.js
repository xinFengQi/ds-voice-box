/**
 * Home Assistant 风扇控制 API
 * 用于控制风扇设备
 */

/**
 * 获取 Home Assistant API 配置
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Object} 包含 URL 和 headers 的配置对象
 */
function getHAConfig(env) {
  const haUrl = env.HA_URL;
  const token = env.HA_TOKEN;
  
  if (!haUrl) {
    throw new Error('HA_URL 环境变量未设置');
  }
  
  if (!token) {
    throw new Error('HA_TOKEN 环境变量未设置');
  }

  return {
    url: haUrl.replace(/\/$/, ''), // 移除末尾的斜杠
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}

/**
 * 调用 Home Assistant 服务
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} domain - 服务域（如 'fan'）
 * @param {string} service - 服务名称（如 'turn_on', 'turn_off'）
 * @param {Object} data - 请求数据
 * @returns {Promise<Object>} API 响应
 */
async function callHAService(env, domain, service, data) {
  const config = getHAConfig(env);
  const url = `${config.url}/api/services/${domain}/${service}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Home Assistant API 错误: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * 打开风扇
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} entityId - 风扇实体ID（如 'fan.xiaomi_p51_14a2_fan'）
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

