/**
 * 检查认证状态 API
 * GET /api/check-auth
 */

import { isAuthenticated } from '../utils/auth.js';

export async function onRequestGet(context) {
  const authenticated = isAuthenticated(context.request);
  
  return new Response(JSON.stringify({ 
    authenticated,
    message: authenticated ? '已登录' : '未登录'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

