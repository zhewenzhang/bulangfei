/**
 * 分類持有時間配置服務
 * 根據不同分類提供預設的持有時間（天數）
 */

class CategoryDurationService {
  // 預設的分類持有時間配置（天數）
  static DEFAULT_DURATIONS = {
    // 耐用品類（長期持有）
    '電子產品': 1095,      // 3年
    '厨房用品': 1825,      // 5年
    '汽车用品': 1095,      // 3年
    '园艺用品': 730,       // 2年
    
    // 日常用品類（中期持有）
    '服装配饰': 365,       // 1年
    '书籍文具': 730,       // 2年
    '宠物用品': 180,       // 6個月
    '清洁用品': 90,        // 3個月
    '母婴用品': 365,       // 1年
    
    // 消耗品類（短期持有）
    '食品饮料': 30,        // 1個月
    
    // 特殊類別
    '交通出行': 365,       // 1年
    '住房相关': 365,       // 1年
    
    // 默認值
    'default': 365         // 1年
  };

  /**
   * 根據分類名稱獲取預設持有時間
   * @param {string} categoryName - 分類名稱
   * @returns {number} 持有時間（天數）
   */
  static getDurationByCategory(categoryName) {
    if (!categoryName) {
      return this.DEFAULT_DURATIONS.default;
    }

    // 直接匹配
    if (this.DEFAULT_DURATIONS[categoryName]) {
      return this.DEFAULT_DURATIONS[categoryName];
    }

    // 模糊匹配
    const categoryLower = categoryName.toLowerCase();
    for (const [key, duration] of Object.entries(this.DEFAULT_DURATIONS)) {
      if (key === 'default') continue;
      
      if (categoryLower.includes(key.toLowerCase()) || 
          key.toLowerCase().includes(categoryLower)) {
        return duration;
      }
    }

    // 關鍵詞匹配
    if (categoryLower.includes('电子') || categoryLower.includes('手机') || 
        categoryLower.includes('电脑') || categoryLower.includes('数码')) {
      return this.DEFAULT_DURATIONS['電子產品'];
    }
    
    if (categoryLower.includes('衣') || categoryLower.includes('服装') || 
        categoryLower.includes('鞋') || categoryLower.includes('包')) {
      return this.DEFAULT_DURATIONS['服装配饰'];
    }
    
    if (categoryLower.includes('书') || categoryLower.includes('文具') || 
        categoryLower.includes('笔') || categoryLower.includes('本')) {
      return this.DEFAULT_DURATIONS['书籍文具'];
    }
    
    if (categoryLower.includes('食') || categoryLower.includes('吃') || 
        categoryLower.includes('饮料') || categoryLower.includes('零食')) {
      return this.DEFAULT_DURATIONS['食品饮料'];
    }
    
    if (categoryLower.includes('车') || categoryLower.includes('交通') || 
        categoryLower.includes('出行') || categoryLower.includes('票')) {
      return this.DEFAULT_DURATIONS['交通出行'];
    }
    
    if (categoryLower.includes('房') || categoryLower.includes('租') || 
        categoryLower.includes('装修') || categoryLower.includes('家具')) {
      return this.DEFAULT_DURATIONS['住房相关'];
    }
    
    if (categoryLower.includes('宠物') || categoryLower.includes('猫') || 
        categoryLower.includes('狗') || categoryLower.includes('鱼')) {
      return this.DEFAULT_DURATIONS['宠物用品'];
    }
    
    if (categoryLower.includes('厨房') || categoryLower.includes('锅') || 
        categoryLower.includes('刀') || categoryLower.includes('碗')) {
      return this.DEFAULT_DURATIONS['厨房用品'];
    }
    
    if (categoryLower.includes('清洁') || categoryLower.includes('洗') || 
        categoryLower.includes('拖把') || categoryLower.includes('纸巾')) {
      return this.DEFAULT_DURATIONS['清洁用品'];
    }
    
    if (categoryLower.includes('婴儿') || categoryLower.includes('儿童') || 
        categoryLower.includes('母婴') || categoryLower.includes('玩具')) {
      return this.DEFAULT_DURATIONS['母婴用品'];
    }
    
    if (categoryLower.includes('园艺') || categoryLower.includes('花') || 
        categoryLower.includes('种植') || categoryLower.includes('肥料')) {
      return this.DEFAULT_DURATIONS['园艺用品'];
    }
    
    if (categoryLower.includes('汽车') || categoryLower.includes('机油') || 
        categoryLower.includes('轮胎') || categoryLower.includes('车载')) {
      return this.DEFAULT_DURATIONS['汽车用品'];
    }

    // 如果都沒有匹配，返回默認值
    return this.DEFAULT_DURATIONS.default;
  }

  /**
   * 計算目標日耗
   * @param {number} purchasePrice - 購買價格
   * @param {number} duration - 持有時間（天數）
   * @returns {number} 目標日耗
   */
  static calculateDailyTarget(purchasePrice, duration) {
    if (!purchasePrice || !duration || duration <= 0) {
      return 0;
    }
    return purchasePrice / duration;
  }

  /**
   * 根據分類自動計算目標日耗
   * @param {number} purchasePrice - 購買價格
   * @param {string} categoryName - 分類名稱
   * @returns {Object} 包含目標日耗和持有時間的對象
   */
  static autoCalculateTarget(purchasePrice, categoryName) {
    const duration = this.getDurationByCategory(categoryName);
    const dailyTarget = this.calculateDailyTarget(purchasePrice, duration);
    
    return {
      dailyTarget: Math.round(dailyTarget * 100) / 100, // 保留兩位小數
      duration,
      categoryName
    };
  }

  /**
   * 獲取所有預設分類和持有時間
   * @returns {Object} 分類持有時間配置
   */
  static getAllDurations() {
    return { ...this.DEFAULT_DURATIONS };
  }
}

export default CategoryDurationService;