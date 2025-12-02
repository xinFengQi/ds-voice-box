// 处理天猫精灵发来的 POST 请求
// 路由: /api/tomi

export async function onRequestPost(context) {
  try {
    // 读取请求体
    const body = await context.request.json();
    console.log('收到天猫精灵请求 (at /api/tomi):', JSON.stringify(body, null, 2));

    // 构造响应
    const responseData = {
      returnCode: "0",
      returnErrorSolution: "",
      returnMessage: "",
      returnValue: {
        reply: "你好，Cloudflare Pages 后端服务已成功接收到指令",
        resultType: "RESULT",
        properties: {},
        executeCode: "SUCCESS",
        msgInfo: ""
      }
    };

    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    });

  } catch (err) {
    console.error('Error processing request:', err);
    return new Response(JSON.stringify({ error: "Invalid Request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}

