/**
 * 登出 API
 * POST /api/logout
 */

import { clearAuthCookie } from '../utils/auth.js';

export async function onRequestPost(context) {
  const cookie = clearAuthCookie();
  
  return new Response(JSON.stringify({ 
    success: true,
    message: '已退出登录'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
}

