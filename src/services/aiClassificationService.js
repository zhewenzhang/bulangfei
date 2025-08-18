import { supabase } from '../supabaseClient';

/**
 * AI分类服务
 * 使用Google Gemini API进行物品智能分类
 */
class AIClassificationService {
  constructor() {
    // 默认模型，如果数据库中没有指定模型则使用此默认值
    this.defaultModel = 'gemini-2.5-flash-lite';
  }

  /**
   * 获取用户的活跃API配置
   * @param {string} userId - 用户ID
   * @param {string} apiName - API名称
   * @returns {Promise<Object|null>} API配置信息
   */
  async getActiveApiConfig(userId, apiName = 'gemini') {
    try {
      const { data, error } = await supabase
        .rpc('get_active_api_config', {
          user_id_param: userId,
          api_name_param: apiName
        });

      if (error) {
        console.error('Error fetching API config:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getActiveApiConfig:', error);
      return null;
    }
  }

  /**
   * 更新API使用统计
   * @param {string} configId - API配置ID
   */
  async updateApiUsage(configId) {
    try {
      await supabase.rpc('update_api_usage', {
        config_id_param: configId
      });
    } catch (error) {
      console.error('Error updating API usage:', error);
    }
  }

  /**
   * 获取所有分类信息
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * 使用Gemini API进行物品分类
   * @param {string} itemName - 物品名称
   * @param {string} userId - 用户ID
   * @param {Array} categories - 可选的分类列表
   * @returns {Promise<Object>} 分类结果
   */
  async classifyWithAI(itemName, userId, categories = null) {
    try {
      // 获取API配置
      const apiConfig = await this.getActiveApiConfig(userId);
      if (!apiConfig || !apiConfig.decrypted_key) {
        return {
          success: false,
          error: 'API配置未找到或API密钥无效',
          confidence: 0,
          suggestedCategory: null
        };
      }

      // 获取分类列表
      if (!categories) {
        categories = await this.getCategories();
      }

      if (categories.length === 0) {
        return {
          success: false,
          error: '分类列表为空',
          confidence: 0,
          suggestedCategory: null
        };
      }

      // 构建分类选项字符串
      const categoryOptions = categories.map(cat => 
        `${cat.id}: ${cat.name} (${cat.description})`
      ).join('\n');

      // 构建提示词
      const prompt = `请根据物品名称"${itemName}"，从以下分类中选择最合适的一个：

${categoryOptions}

请返回JSON格式的结果，包含以下字段：
- category_id: 选择的分类ID（数字）
- confidence: 置信度（0-1之间的小数）
- reasoning: 选择理由（简短说明）

只返回JSON，不要其他文字。`;

      // 构建API端点URL，使用配置中的模型名称
      const modelName = apiConfig.model_name || this.defaultModel;
      const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      
      // 调用Gemini API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiConfig.decrypted_key,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        return {
          success: false,
          error: `API调用失败: ${response.status}`,
          confidence: 0,
          suggestedCategory: null
        };
      }

      const result = await response.json();
      
      // 解析API响应
      if (result.candidates && result.candidates.length > 0) {
        const content = result.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
          const text = content.parts[0].text;
          
          try {
            // 尝试解析JSON响应
            const jsonMatch = text.match(/\{[^}]+\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              
              // 验证分类ID是否有效
              const selectedCategory = categories.find(cat => cat.id === parsed.category_id);
              if (selectedCategory) {
                // 更新API使用统计（静默失败，不影响主要功能）
                try {
                  await this.updateApiUsage(apiConfig.id);
                } catch (usageError) {
                  console.warn('更新API使用统计失败，但不影响分类功能:', usageError);
                }
                
                return {
                  success: true,
                  confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
                  suggestedCategory: selectedCategory,
                  reasoning: parsed.reasoning || '无说明',
                  method: 'ai'
                };
              }
            }
          } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
          }
        }
      }

      return {
        success: false,
        error: 'AI响应格式无效',
        confidence: 0,
        suggestedCategory: null
      };

    } catch (error) {
      console.error('Error in AI classification:', error);
      return {
        success: false,
        error: error.message || '分类失败',
        confidence: 0,
        suggestedCategory: null
      };
    }
  }

  /**
   * 关键词匹配分类
   * @param {string} itemName - 物品名称
   * @param {string} userId - 用户ID（可选）
   * @returns {Promise<Object>} 分类结果
   */
  async classifyByKeywords(itemName, userId = null) {
    try {
      let keywords = [];
      
      // 如果提供了用户ID，先尝试查询该用户的分类
      if (userId) {
        const { data: userKeywords, error: userError } = await supabase
          .from('category_keywords')
          .select(`
            *,
            categories!inner(*)
          `)
          .eq('categories.user_id', userId);
          
        if (!userError && userKeywords && userKeywords.length > 0) {
          keywords = userKeywords;
        }
      }
      
      // 如果没有找到用户专属数据，回退到查询所有关键词数据
      if (keywords.length === 0) {
        const { data: allKeywords, error: allError } = await supabase
          .from('category_keywords')
          .select(`
            *,
            categories!inner(*)
          `);
          
        if (allError) {
          console.error('Error fetching keywords:', allError);
          return {
            success: false,
            confidence: 0,
            suggestedCategory: null
          };
        }
        
        keywords = allKeywords || [];
      }

      if (keywords.length === 0) {
        return {
          success: false,
          confidence: 0,
          suggestedCategory: null
        };
      }

      const itemNameLower = itemName.toLowerCase();
      let bestMatch = null;
      let bestScore = 0;

      // 遍历所有关键词规则
      for (const keywordRule of keywords) {
        const keywordLower = keywordRule.keyword.toLowerCase();
        let score = 0;

        // 完全匹配
        if (itemNameLower === keywordLower) {
          score = 1.0;
        }
        // 包含匹配
        else if (itemNameLower.includes(keywordLower)) {
          score = 0.8;
        }
        // 部分匹配（关键词包含在物品名称中）
        else if (keywordLower.includes(itemNameLower)) {
          score = 0.6;
        }

        // 应用权重
        score *= keywordRule.weight;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            category: keywordRule.categories,
            score: score,
            matchedKeyword: keywordRule.keyword
          };
        }
      }

      if (bestMatch && bestScore > 0.3) { // 最低置信度阈值
        return {
          success: true,
          confidence: Math.min(bestScore, 1.0),
          suggestedCategory: bestMatch.category,
          matchedKeyword: bestMatch.matchedKeyword,
          method: 'keyword'
        };
      }

      return {
        success: false,
        confidence: 0,
        suggestedCategory: null
      };

    } catch (error) {
      console.error('Error in keyword classification:', error);
      return {
        success: false,
        confidence: 0,
        suggestedCategory: null
      };
    }
  }

  /**
   * 混合分类方法
   * 先尝试关键词匹配，如果置信度不够高则使用AI分类
   * @param {string} itemName - 物品名称
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 分类结果
   */
  async classifyItem(itemName, userId) {
    try {
      // 首先尝试关键词匹配
      const keywordResult = await this.classifyByKeywords(itemName, userId);
      
      // 如果关键词匹配置信度足够高，直接返回
      if (keywordResult.success && keywordResult.confidence >= 0.7) {
        return keywordResult;
      }

      // 否则尝试AI分类
      const aiResult = await this.classifyWithAI(itemName, userId);
      
      // 如果AI分类成功，返回AI结果
      if (aiResult.success) {
        return aiResult;
      }

      // 如果AI分类失败，但关键词有结果，返回关键词结果
      if (keywordResult.success) {
        return keywordResult;
      }

      // 都失败了，返回失败结果
      return {
        success: false,
        confidence: 0,
        suggestedCategory: null,
        error: '无法分类此物品'
      };

    } catch (error) {
      console.error('Error in hybrid classification:', error);
      return {
        success: false,
        confidence: 0,
        suggestedCategory: null,
        error: error.message || '分类过程出错'
      };
    }
  }
}

// 创建单例实例
const aiClassificationService = new AIClassificationService();

export default aiClassificationService;