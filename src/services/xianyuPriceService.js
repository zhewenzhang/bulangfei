// 閒魚價格查詢服務
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

/**
 * 查詢閒魚平台上商品的二手價格
 * @param {string} keyword - 搜索關鍵詞
 * @returns {Promise<Object>} 價格數據
 */
export const fetchXianyuPrices = async (keyword) => {
  if (!keyword || !keyword.trim()) {
    throw new Error('搜索關鍵詞不能為空');
  }

  try {
    // 調用Supabase Edge Function來獲取閒魚價格數據
    const { data, error } = await supabase.functions.invoke('xianyu-price-crawler', {
      body: { keyword: keyword.trim() }
    });

    if (error) {
      logger.error('Supabase function error:', error);
      throw new Error(`獲取閒魚價格失敗: ${error.message}`);
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'API響應格式異常');
    }

    return data.data;
  } catch (error) {
    logger.error('Error fetching Xianyu prices:', error);
    throw error;
  }
};

/**
 * 格式化閒魚價格數據，計算與當前物品價值的比較
 * @param {Object} xianyuData - 閒魚價格數據
 * @param {number} currentValue - 當前物品估算價值
 * @returns {Object} 格式化後的比較數據
 */
export const formatPriceComparison = (xianyuData, currentValue) => {
  if (!xianyuData || !xianyuData.products || xianyuData.products.length === 0) {
    return {
      comparisonText: '無法獲取閒魚價格數據進行比較',
      priceDifference: 0,
      percentageDifference: 0,
      isCurrentValueHigher: false,
      xianyuData: null
    };
  }

  const averagePrice = xianyuData.averagePrice;
  const priceDifference = currentValue - averagePrice;
  const percentageDifference = (priceDifference / averagePrice) * 100;
  const isCurrentValueHigher = priceDifference > 0;

  let comparisonText = '';
  if (Math.abs(percentageDifference) < 5) {
    comparisonText = `您的估值與閒魚平均價格相近（差異 ${Math.abs(percentageDifference).toFixed(1)}%）`;
  } else if (isCurrentValueHigher) {
    comparisonText = `您的估值比閒魚平均價格高 ${Math.abs(percentageDifference).toFixed(1)}%`;
  } else {
    comparisonText = `您的估值比閒魚平均價格低 ${Math.abs(percentageDifference).toFixed(1)}%`;
  }

  return {
    comparisonText,
    priceDifference,
    percentageDifference,
    isCurrentValueHigher,
    xianyuData
  };
};