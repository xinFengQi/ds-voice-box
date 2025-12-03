/**
 * Cloudflare Pages 中间件
 * 用于保护 HTML 页面，未登录用户将被重定向到登录页
 * 同时初始化意图映射缓存
 */

import { requireAuth } from './utils/auth.js';
import { getCache } from './utils/intent-cache.js';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const loginPath = context.env.LOGIN_PATH;
  
  // 检查是否是登录路径（由 functions/[path].js 处理）
  const isLoginPath = loginPath && pathname === `/${loginPath}`;
  
  // 排除文档页面（首页）、登录路径、登录相关 API 和天猫精灵接口
  if (
    pathname === '/' ||
    pathname === '/index.html' ||
    pathname === '/docs.html' ||
    isLoginPath ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/api/check-auth') ||
    pathname.startsWith('/aligenie/') ||
    pathname.startsWith('/api/tomi') // 天猫精灵回调接口，不需要认证
  ) {
    return context.next();
  }
  
  // 排除静态资源（非 HTML 文件）
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json'];
  const isStaticResource = staticExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
  if (isStaticResource) {
    return context.next();
  }
  
  // 初始化意图映射缓存（异步，不阻塞请求）
  // 对于需要快速查询的接口（如 /api/intent-mapping），确保缓存已初始化
  if (pathname.startsWith('/api/intent-mapping') || pathname.startsWith('/api/tomi')) {
    try {
      await getCache(context);
    } catch (error) {
      console.error('[Middleware] 初始化缓存失败:', error);
    }
  }
  
  // 对于 HTML 页面，检查认证（排除首页和登录路径）
  if (pathname.endsWith('.html') && pathname !== '/index.html') {
    const authResponse = requireAuth(context.request, { redirect: true, env: context.env });
    if (authResponse) {
      return authResponse;
    }
  }
  
  return context.next();
}

