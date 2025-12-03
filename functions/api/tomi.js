// 处理天猫精灵发来的 POST 请求
// 路由: /api/tomi
// 文档参考: https://aligenie.com/doc/357834/dxzpdh

import { getIntentMapping } from '../utils/intent-cache.js';
import { turnOnLight, turnOffLight, toggleLight } from '../utils/ha-light-api.js';
import { turnOnFan, turnOffFan, toggleFan } from '../utils/ha-fan-api.js';
import { turnOnSwitch, turnOffSwitch, toggleSwitch } from '../utils/ha-switch-api.js';

// API 名称到执行函数的映射
const apiHandlerMap = new Map([
  ['turnOnLight', turnOnLight],
  ['turnOffLight', turnOffLight],
  ['toggleLight', toggleLight],
  ['turnOnFan', turnOnFan],
  ['turnOffFan', turnOffFan],
  ['toggleFan', toggleFan],
  ['turnOnSwitch', turnOnSwitch],
  ['turnOffSwitch', turnOffSwitch],
  ['toggleSwitch', toggleSwitch]
]);

/**
 * 根据映射信息调用对应的 Home Assistant API
 * @param {Object} env - 环境变量
 * @param {Object} mapping - 意图映射对象
 * @returns {Promise<Object>} API 调用结果
 */
async function executeMapping(env, mapping) {
  const { apiName, entityId } = mapping;
  
  const handler = apiHandlerMap.get(apiName);
  if (!handler) {
    throw new Error(`不支持的接口: ${apiName}`);
  }
  
  return await handler(env, entityId);
}

/**
 * 从天猫精灵请求中提取意图标识
 * @param {Object} body - 请求体
 * @returns {string|null} 意图标识
 */
function extractIntentName(body) {
  // 尝试多种可能的路径
  if (body.payload?.intent?.name) {
    return body.payload.intent.name;
  }
  if (body.intent?.name) {
    return body.intent.name;
  }
  if (body.payload?.intentName) {
    return body.payload.intentName;
  }
  if (body.intentName) {
    return body.intentName;
  }
  // 如果都没有，尝试从其他字段获取
  if (body.payload?.intent?.intentName) {
    return body.payload.intent.intentName;
  }
  return null;
}

/**
 * 构造天猫精灵响应
 * @param {string} text - 回复文本
 * @returns {Object} 响应数据
 */
function buildResponse(text) {
  return {
    returnCode: "0",
    returnErrorSolution: "",
    returnMessage: "",
    returnValue: {
      resultType: "RESULT",
      executeCode: "SUCCESS",
      msgInfo: "",
      gwCommands: [
        {
          commandDomain: "AliGenie.Speaker",
          commandName: "Speak",
          payload: {
            type: "text",
            text: text,
            expectSpeech: false,
            needLight: true,
            needVoice: true,
            wakeupType: "continuity"
          }
        }
      ]
    }
  };
}

export async function onRequestPost(context) {
  // 验证请求头中的密钥（如果配置了 TOMI_SECRET_KEY）
  const secretKey = context.env.TOMI_SECRET_KEY;
  if (secretKey) {
    // 只支持 X-Tomi-Secret 请求头
    const requestKey = context.request.headers.get('X-Tomi-Secret');
    
    if (requestKey !== secretKey) {
      // 返回天猫精灵格式的错误响应
      return new Response(JSON.stringify({
        returnCode: "0",
        returnValue: {
          resultType: "RESULT",
          executeCode: "SUCCESS",
          msgInfo: "",
          gwCommands: [{
            commandDomain: "AliGenie.Speaker",
            commandName: "Speak",
            payload: {
              type: "text",
              text: "抱歉，请求验证失败",
              expectSpeech: false,
              needLight: true,
              needVoice: true,
              wakeupType: "continuity"
            }
          }]
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json;charset=UTF-8" }
      });
    }
  }

  try {
    // 读取请求体
    const body = await context.request.json();
    console.log('收到天猫精灵请求 (at /api/tomi):', JSON.stringify(body, null, 2));

    // 提取意图标识
    const intentName = extractIntentName(body);
    
    if (!intentName) {
      console.warn('无法从请求中提取意图标识:', body);
      const responseData = buildResponse('抱歉，我无法识别您的指令，请重新说一遍');
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        }
      });
    }

    console.log(`提取到意图标识: ${intentName}`);

    // 从内存缓存中获取映射
    const mapping = await getIntentMapping(context, intentName);
    
    if (!mapping) {
      console.log(`未找到意图映射: ${intentName}`);
      const responseData = buildResponse('抱歉，我暂时无法处理这个指令，请稍后再试或联系管理员配置');
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        }
      });
    }

    console.log(`找到映射:`, mapping);

    // 调用对应的 Home Assistant API
    try {
      await executeMapping(context.env, mapping);
      console.log(`成功执行接口: ${mapping.apiName} for ${mapping.entityId}`);
      
      // 返回映射中配置的回复内容，如果没有则使用默认回复
      const replyText = mapping.replyContent || 
        (mapping.apiLabel || `已执行${mapping.apiName}操作`);
      
      const responseData = buildResponse(replyText);
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        }
      });
    } catch (apiError) {
      console.error(`执行接口失败: ${mapping.apiName}`, apiError);
      const responseData = buildResponse('抱歉，设备操作失败，请检查设备状态或稍后再试');
      return new Response(JSON.stringify(responseData), {
        headers: {
          "Content-Type": "application/json;charset=UTF-8"
        }
      });
    }

  } catch (err) {
    console.error('处理天猫精灵请求失败:', err);
    const responseData = buildResponse('抱歉，系统出现错误，请稍后再试');
    return new Response(JSON.stringify(responseData), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      }
    });
  }
}
