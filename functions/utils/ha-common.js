/**
 * Home Assistant 公共工具函数
 * 提供所有设备 API 共享的配置和服务调用方法
 */

/**
 * 获取 Home Assistant API 配置
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Object} 包含 URL 和 headers 的配置对象
 */
export function getHAConfig(env) {
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
 * @param {string} domain - 服务域（如 'light', 'fan', 'switch'）
 * @param {string} service - 服务名称（如 'turn_on', 'turn_off', 'toggle'）
 * @param {Object} data - 请求数据
 * @returns {Promise<Object>} API 响应
 */
export async function callHAService(env, domain, service, data) {
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

