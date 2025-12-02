// 动态处理天猫精灵校验文件
// 路由: /aligenie/[filename]

export async function onRequest(context) {
  // 1. 获取 URL 参数
  const { filename } = context.params;

  // 2. 获取环境变量
  const envName = context.env.ALIGENIE_NAME;
  const envContent = context.env.ALIGENIE_CONTENT;

  // 3. 验证
  // 如果没有配置环境变量，或者请求的文件名不匹配，返回 404
  if (!envName || !envContent || filename !== envName) {
    return new Response("Not Found", { status: 404 });
  }

  // 4. 返回校验内容
  return new Response(envContent, {
    headers: {
      "Content-Type": "text/plain;charset=UTF-8"
    }
  });
}

