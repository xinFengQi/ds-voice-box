/**
 * Home Assistant 状态查询 API
 * 用于获取设备状态和实体列表
 */

import { getHAConfig } from './ha-common.js';

/**
 * 获取所有设备状态
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Promise<Array>} 所有设备状态列表
 */
export async function getAllStates(env) {
  const config = getHAConfig(env);
  const url = `${config.url}/api/states`;

  const response = await fetch(url, {
    method: 'GET',
    headers: config.headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`获取设备列表失败: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * 获取指定域的设备列表（如 light, fan）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} domain - 设备域（如 'light', 'fan'）
 * @returns {Promise<Array>} 设备列表，包含 entity_id 和 friendly_name
 */
export async function getDevicesByDomain(env, domain) {
  const states = await getAllStates(env);
  
  return states
    .filter(state => {
      const entityDomain = state.entity_id.split('.')[0];
      return entityDomain === domain;
    })
    .map(state => ({
      entity_id: state.entity_id,
      friendly_name: state.attributes?.friendly_name || state.entity_id,
      state: state.state
    }));
}

/**
 * 获取所有可控制的设备列表（light、fan 和 switch）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Promise<Object>} 按域分类的设备列表
 */
export async function getAllControllableDevices(env) {
  const [lights, fans, switches] = await Promise.all([
    getDevicesByDomain(env, 'light'),
    getDevicesByDomain(env, 'fan'),
    getDevicesByDomain(env, 'switch')
  ]);

  return {
    light: lights,
    fan: fans,
    switch: switches
  };
}

/**
 * 获取所有设备（不限制类型）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Promise<Array>} 所有设备列表，包含 entity_id, friendly_name, domain
 */
export async function getAllDevices(env) {
  const states = await getAllStates(env);
  
  return states.map(state => {
    const entityDomain = state.entity_id.split('.')[0];
    return {
      entity_id: state.entity_id,
      friendly_name: state.attributes?.friendly_name || state.entity_id,
      state: state.state,
      domain: entityDomain
    };
  });
}

