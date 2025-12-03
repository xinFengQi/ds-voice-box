/**
 * 动态路径处理
 * 用于处理登录路径 /LOGIN_PATH
 */

// 登录页 HTML 内容
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - Home Voice Box</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md" x-data="loginApp()">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">系统登录</h1>
        
        <!-- 错误提示 -->
        <div 
            x-show="errorMessage" 
            x-cloak
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <span x-text="errorMessage"></span>
        </div>
        
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input 
                    type="password" 
                    x-model="password"
                    @input="errorMessage = ''"
                    placeholder="请输入登录密码"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autofocus>
            </div>
            
            <button 
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
                :disabled="loading">
                <span x-show="!loading">登录</span>
                <span x-show="loading">登录中...</span>
            </button>
        </form>
    </div>

    <script>
        function loginApp() {
            return {
                password: '',
                errorMessage: '',
                loading: false,
                
                async handleLogin() {
                    if (!this.password) {
                        this.errorMessage = '请输入密码';
                        return;
                    }
                    
                    this.loading = true;
                    this.errorMessage = '';
                    
                    try {
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ password: this.password })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok && data.success) {
                            // 登录成功，跳转到管理页面
                            window.location.href = '/manage.html';
                        } else {
                            // 登录失败
                            this.errorMessage = data.error || '登录失败，请重试';
                            this.password = '';
                        }
                    } catch (error) {
                        console.error('登录错误:', error);
                        this.errorMessage = '网络错误，请重试';
                        this.password = '';
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>`;

export async function onRequestGet(context) {
  const { path } = context.params;
  const loginPath = context.env.LOGIN_PATH;
  
  // 检查路径是否匹配环境变量中的 LOGIN_PATH
  if (!loginPath) {
    // 如果没有配置 LOGIN_PATH，让请求继续（可能是静态文件）
    return context.next();
  }
  
  if (path !== loginPath) {
    // 路径不匹配，让请求继续（可能是静态文件或其他路由）
    return context.next();
  }
  
  // 路径匹配，返回登录页
  return new Response(LOGIN_HTML, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    }
  });
}

