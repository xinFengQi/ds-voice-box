/**
 * 登录 API
 * POST /api/login
 * 请求体: { password: string }
 */

import { verifyPassword, createAuthCookie } from '../utils/auth.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { password } = body;
    
    if (!password) {
      return new Response(JSON.stringify({ 
        error: '密码不能为空',
        code: 'MISSING_PASSWORD'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证密码
    try {
      const isValid = verifyPassword(context.env, password);
      
      if (!isValid) {
        return new Response(JSON.stringify({ 
          error: '密码错误',
          code: 'INVALID_PASSWORD'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 密码正确，创建认证 cookie
      const cookie = createAuthCookie();
      
      return new Response(JSON.stringify({ 
        success: true,
        message: '登录成功'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message || '服务器配置错误',
        code: 'SERVER_ERROR'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: '请求格式错误',
      code: 'INVALID_REQUEST'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

