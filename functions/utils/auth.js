/**
 * 认证工具函数
 * 用于验证用户登录状态和管理会话
 */

/**
 * 生成简单的认证 token（使用时间戳 + 随机数）
 * 在实际生产环境中，应该使用更安全的加密方式
 * @returns {string} 认证 token
 */
function generateToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * 验证 token 是否有效（简单实现：检查格式和时效性）
 * 这里设置 token 有效期为 24 小时
 * @param {string} token - 要验证的 token
 * @returns {boolean} token 是否有效
 */
function isValidToken(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('-');
  if (parts.length < 2) {
    return false;
  }
  
  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) {
    return false;
  }
  
  // 检查 token 是否在 24 小时内
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 小时
  return (now - timestamp) < maxAge;
}

/**
 * 从请求中获取认证 token
 * @param {Request} request - 请求对象
 * @returns {string|null} 认证 token 或 null
 */
export function getAuthToken(request) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies['auth_token'] || null;
}

/**
 * 检查用户是否已登录
 * @param {Request} request - 请求对象
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated(request) {
  const token = getAuthToken(request);
  return token && isValidToken(token);
}

/**
 * 创建认证 cookie
 * @returns {string} Set-Cookie 头部值
 */
export function createAuthCookie() {
  const token = generateToken();
  // 设置 cookie 为 HttpOnly 和 Secure（生产环境建议使用 Secure）
  // SameSite=Lax 防止 CSRF 攻击
  return `auth_token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`;
}

/**
 * 创建清除认证的 cookie
 * @returns {string} Set-Cookie 头部值
 */
export function clearAuthCookie() {
  return `auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

/**
 * 验证登录密码
 * @param {Object} env - 环境变量
 * @param {string} password - 用户输入的密码
 * @returns {boolean} 密码是否正确
 */
export function verifyPassword(env, password) {
  const adminPassword = env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD 环境变量未设置');
  }
  
  return password === adminPassword;
}

/**
 * 认证中间件 - 检查请求是否需要认证
 * 如果未认证，返回 401 或重定向响应
 * @param {Request} request - 请求对象
 * @param {Object} options - 选项
 * @param {boolean} options.redirect - 是否重定向到登录页（用于 HTML 页面）
 * @returns {Response|null} 如果未认证返回响应，否则返回 null
 */
export function requireAuth(request, options = {}) {
  const { redirect = false } = options;
  
  if (!isAuthenticated(request)) {
    if (redirect) {
      // 对于 HTML 页面，重定向到登录页（根路径）
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/'
        }
      });
    } else {
      // 对于 API 请求，返回 401
      return new Response(JSON.stringify({ 
        error: '未授权访问，请先登录',
        code: 'UNAUTHORIZED'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  
  return null;
}

