// Gemini API 服务
import { supabase } from '../supabaseClient';

/**
 * 通过后端代理获取可用的Gemini模型列表
 * @param {string} apiKey - Gemini API密钥
 * @returns {Promise<Array>} 模型列表
 */
export const fetchGeminiModels = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API密钥不能为空');
  }

  try {
    // 调用Supabase Edge Function来代理请求
    const { data, error } = await supabase.functions.invoke('gemini-models', {
      body: { apiKey: apiKey.trim() }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`获取模型失败: ${error.message}`);
    }

    if (!data || !data.models) {
      throw new Error('API响应格式异常');
    }

    // 过滤出支持generateContent的模型
    const supportedModels = data.models.filter(model => 
      model.supportedGenerationMethods && 
      model.supportedGenerationMethods.includes('generateContent')
    ).map(model => ({
      name: model.name.replace('models/', ''),
      displayName: model.displayName || model.name.replace('models/', ''),
      description: model.description || ''
    }));

    return supportedModels;
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    throw error;
  }
};

/**
 * 测试Gemini API连接
 * @param {string} apiKey - Gemini API密钥
 * @param {string} modelName - 模型名称
 * @returns {Promise<boolean>} 连接是否成功
 */
export const testGeminiConnection = async (apiKey, modelName = 'gemini-2.5-flash-lite') => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-test', {
      body: { 
        apiKey: apiKey.trim(),
        modelName: modelName
      }
    });

    if (error) {
      console.error('Connection test error:', error);
      return false;
    }

    return data && data.success;
  } catch (error) {
    console.error('Error testing Gemini connection:', error);
    return false;
  }
};