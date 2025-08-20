import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

class CategoryOptimizationService {
  // 分析用户的分类使用情况
  async analyzeUserCategories(userId) {
    try {
      logger.debug('分析用户分类，用户ID:', userId);
      // 获取用户的所有分类
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      logger.debug('获取分类结果:', { categories, categoriesError });
      if (categoriesError) throw categoriesError;

      // 获取用户的计算记录，统计每个分类的使用频率
      const { data: calculations, error: calculationsError } = await supabase
        .from('calculations')
        .select('category_id, name, target, actual')
        .eq('user_id', userId)
        .not('category_id', 'is', null);

      logger.debug('获取计算记录结果:', { calculations, calculationsError });
      if (calculationsError) throw calculationsError;

      // 统计分类使用情况
      const categoryUsage = {};
      const categoryItems = {};
      const categoryValues = {};

      calculations.forEach(calc => {
        const categoryId = calc.category_id;
        if (!categoryUsage[categoryId]) {
          categoryUsage[categoryId] = 0;
          categoryItems[categoryId] = [];
          categoryValues[categoryId] = { total: 0, count: 0 };
        }
        categoryUsage[categoryId]++;
        categoryItems[categoryId].push(calc.name);
        if (calc.target) {
          categoryValues[categoryId].total += parseFloat(calc.target);
          categoryValues[categoryId].count++;
        }
      });

      return {
        categories,
        categoryUsage,
        categoryItems,
        categoryValues,
        totalCalculations: calculations.length
      };
    } catch (error) {
      logger.error('Error analyzing categories:', error);
      throw error;
    }
  }

  // 生成优化建议
  async generateOptimizationSuggestions(userId) {
    try {
      logger.debug('开始AI优化分析，用户ID:', userId);
      const analysis = await this.analyzeUserCategories(userId);
      logger.debug('分析结果:', analysis);
      const suggestions = [];

      // 1. 检查未使用的分类
      const unusedCategories = analysis.categories.filter(cat => 
        !analysis.categoryUsage[cat.id] || analysis.categoryUsage[cat.id] === 0
      );

      if (unusedCategories.length > 0) {
        suggestions.push({
          type: 'cleanup',
          priority: 'medium',
          title: '清理未使用的分类',
          description: `发现 ${unusedCategories.length} 个未使用的分类，建议删除以简化分类结构`,
          categories: unusedCategories.map(cat => cat.name),
          action: 'delete',
          categoryIds: unusedCategories.map(cat => cat.id)
        });
      }

      // 2. 检查使用频率很低的分类
      const lowUsageCategories = analysis.categories.filter(cat => {
        const usage = analysis.categoryUsage[cat.id] || 0;
        return usage > 0 && usage < 3 && analysis.totalCalculations > 10;
      });

      if (lowUsageCategories.length > 0) {
        suggestions.push({
          type: 'merge',
          priority: 'low',
          title: '合并低频分类',
          description: `发现 ${lowUsageCategories.length} 个使用频率较低的分类，建议合并到其他分类`,
          categories: lowUsageCategories.map(cat => cat.name),
          action: 'merge'
        });
      }

      // 3. 基于物品名称建议新分类
      const itemAnalysis = this.analyzeItemNames(analysis.categoryItems);
      if (itemAnalysis.suggestedCategories.length > 0) {
        suggestions.push({
          type: 'add',
          priority: 'high',
          title: '建议新增分类',
          description: '基于您的物品分析，建议添加以下分类以更好地组织物品',
          categories: itemAnalysis.suggestedCategories,
          action: 'add',
          reasoning: itemAnalysis.reasoning
        });
      }

      // 4. 检查分类命名建议
      const namingSuggestions = this.analyzeNaming(analysis.categories, analysis.categoryItems);
      if (namingSuggestions.length > 0) {
        suggestions.push({
          type: 'rename',
          priority: 'medium',
          title: '优化分类命名',
          description: '建议重命名以下分类以更好地反映其内容',
          suggestions: namingSuggestions,
          action: 'rename'
        });
      }

      // 5. 价值分析建议
      const valueAnalysis = this.analyzeValueDistribution(analysis.categories, analysis.categoryValues);
      if (valueAnalysis.suggestions.length > 0) {
        suggestions.push({
          type: 'value',
          priority: 'medium',
          title: '价值分布优化',
          description: '基于物品价值分析的分类建议',
          suggestions: valueAnalysis.suggestions,
          action: 'optimize'
        });
      }

      return {
        totalSuggestions: suggestions.length,
        suggestions: suggestions.sort((a, b) => {
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
        analysis
      };
    } catch (error) {
      logger.error('Error generating suggestions:', error);
      throw error;
    }
  }

  // 分析物品名称，建议新分类
  analyzeItemNames(categoryItems) {
    const allItems = [];
    Object.values(categoryItems).forEach(items => {
      allItems.push(...items);
    });

    const keywords = {
      '宠物用品': ['猫', '狗', '宠物', '猫粮', '狗粮', '猫砂', '宠物玩具'],
      '厨房用品': ['锅', '刀', '碗', '盘子', '筷子', '勺子', '厨具', '烤箱', '微波炉'],
      '清洁用品': ['洗衣液', '洗洁精', '拖把', '扫把', '清洁剂', '纸巾'],
      '母婴用品': ['奶粉', '尿布', '婴儿', '儿童', '玩具车', '积木'],
      '园艺用品': ['花盆', '种子', '肥料', '园艺工具', '浇水壶'],
      '汽车用品': ['机油', '轮胎', '车载', '汽车香水', '车垫']
    };

    const suggestedCategories = [];
    const reasoning = [];

    Object.entries(keywords).forEach(([category, words]) => {
      const matchedItems = allItems.filter(item => 
        words.some(word => item.toLowerCase().includes(word.toLowerCase()))
      );
      
      if (matchedItems.length >= 2) {
        suggestedCategories.push(category);
        reasoning.push(`发现 ${matchedItems.length} 个${category}相关物品: ${matchedItems.slice(0, 3).join(', ')}${matchedItems.length > 3 ? '等' : ''}`);
      }
    });

    return { suggestedCategories, reasoning };
  }

  // 分析分类命名
  analyzeNaming(categories, categoryItems) {
    const suggestions = [];

    categories.forEach(category => {
      const items = categoryItems[category.id] || [];
      
      // 检查"其他"分类是否有更好的命名
      if (category.name === '其他' && items.length > 0) {
        const commonThemes = this.findCommonThemes(items);
        if (commonThemes.length > 0) {
          suggestions.push({
            categoryId: category.id,
            currentName: category.name,
            suggestedName: commonThemes[0],
            reason: `基于物品内容，建议重命名为"${commonThemes[0]}"`
          });
        }
      }

      // 检查分类名称是否过于宽泛
      if (items.length > 10 && ['用品', '物品', '东西'].some(word => category.name.includes(word))) {
        suggestions.push({
          categoryId: category.id,
          currentName: category.name,
          suggestedName: `${category.name.replace(/用品|物品|东西/, '')}专区`,
          reason: '分类名称过于宽泛，建议更具体化'
        });
      }
    });

    return suggestions;
  }

  // 寻找物品的共同主题
  findCommonThemes(items) {
    const themes = {
      '数码配件': ['充电器', '数据线', '耳机', '手机壳', '保护膜'],
      '日用百货': ['毛巾', '牙刷', '洗发水', '沐浴露', '纸巾'],
      '零食饮料': ['饼干', '薯片', '饮料', '咖啡', '茶叶'],
      '文具用品': ['笔', '本子', '橡皮', '尺子', '文件夹']
    };

    const matchedThemes = [];
    Object.entries(themes).forEach(([theme, keywords]) => {
      const matchCount = items.filter(item => 
        keywords.some(keyword => item.includes(keyword))
      ).length;
      
      if (matchCount >= Math.min(3, items.length * 0.5)) {
        matchedThemes.push(theme);
      }
    });

    return matchedThemes;
  }

  // 分析价值分布
  analyzeValueDistribution(categories, categoryValues) {
    const suggestions = [];

    Object.entries(categoryValues).forEach(([categoryId, valueData]) => {
      if (valueData.count === 0) return;
      
      const avgValue = valueData.total / valueData.count;
      const category = categories.find(cat => cat.id == categoryId);
      
      if (!category) return;

      // 高价值分类建议
      if (avgValue > 1000) {
        suggestions.push({
          categoryName: category.name,
          suggestion: '高价值分类',
          description: `${category.name}的平均价值较高(${avgValue.toFixed(0)}元)，建议细分为多个子分类`,
          priority: 'medium'
        });
      }

      // 低价值分类建议
      if (avgValue < 50 && valueData.count > 5) {
        suggestions.push({
          categoryName: category.name,
          suggestion: '低价值分类',
          description: `${category.name}的平均价值较低(${avgValue.toFixed(0)}元)，可考虑合并到其他分类`,
          priority: 'low'
        });
      }
    });

    return { suggestions };
  }

  // 应用优化建议
  async applySuggestion(suggestion, userId) {
    try {
      switch (suggestion.action) {
        case 'delete':
          return await this.deleteCategories(suggestion.categoryIds);
        case 'add':
          return await this.addSuggestedCategories(suggestion.categories, userId);
        case 'merge':
          return await this.mergeCategories(suggestion.categoryIds, userId);
        case 'rename':
          return await this.renameCategories(suggestion.suggestions);
        default:
          throw new Error('Unknown suggestion action');
      }
    } catch (error) {
      logger.error('Error applying suggestion:', error);
      throw error;
    }
  }

  async deleteCategories(categoryIds) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', categoryIds);
    
    if (error) throw error;
    return { success: true, message: `已删除 ${categoryIds.length} 个分类` };
  }

  async addSuggestedCategories(categoryNames, userId) {
    const defaultIcons = ['📦', '🏷️', '📋', '🗂️', '📁'];
    const defaultColors = ['#6b7280', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    
    const categoriesToAdd = categoryNames.map((name, index) => ({
      name,
      icon: defaultIcons[index % defaultIcons.length],
      color: defaultColors[index % defaultColors.length],
      description: `AI建议的${name}分类`,
      user_id: userId
    }));

    const { error } = await supabase
      .from('categories')
      .insert(categoriesToAdd);
    
    if (error) throw error;
    return { success: true, message: `已添加 ${categoryNames.length} 个新分类` };
  }

  async renameCategories(renameSuggestions) {
    const promises = renameSuggestions.map(suggestion => 
      supabase
        .from('categories')
        .update({ name: suggestion.suggestedName })
        .eq('id', suggestion.categoryId)
    );

    await Promise.all(promises);
    return { success: true, message: `已重命名 ${renameSuggestions.length} 个分类` };
  }
}

export default new CategoryOptimizationService();