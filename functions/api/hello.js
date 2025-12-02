// 简单的测试接口
// 对应旧版 server/index.js 的 app.get('/api/hello')

export async function onRequest(context) {
  // 演示读取环境变量 (如果有的话)
  // const secret = context.env.MY_SECRET || 'No Secret';

  return new Response(JSON.stringify({ 
    message: "Hello from Cloudflare Functions!",
    timestamp: new Date().toISOString()
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

