// 处理天猫精灵发来的 POST 请求
// 路由: /api/tomi
// 文档参考: https://aligenie.com/doc/357834/dxzpdh

export async function onRequestPost(context) {
  try {
    // 读取请求体
    const body = await context.request.json();
    console.log('收到天猫精灵请求 (at /api/tomi):', JSON.stringify(body, null, 2));

    // 构造响应 (符合 V3.0 SDK 标准)
    const responseData = {
      returnCode: "0",
      returnErrorSolution: "",
      returnMessage: "",
      returnValue: {
        resultType: "RESULT",
        executeCode: "SUCCESS",
        msgInfo: "",
        // V3.0 推荐使用 gwCommands 替代 reply
        gwCommands: [
          {
            commandDomain: "AliGenie.Speaker",
            commandName: "Speak",
            payload: {
              type: "text",
              text: "你好，Cloudflare Pages 后端服务已成功接收到指令",
              expectSpeech: false, // 是否开麦等待用户回复
              needLight: true,     // 是否需要灯光提示
              needVoice: true,     // 是否需要语音播报
              wakeupType: "continuity"
            }
          }
        ]
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
