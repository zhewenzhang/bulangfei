import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, CircularProgress, TextField, Typography, Alert } from '@mui/material';
import { fetchXianyuPrices, formatPriceComparison } from '../services/xianyuPriceService';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 閒魚價格查詢組件
 * 允許用戶搜索物品在閒魚平台上的二手價格
 */
const XianyuPriceChecker = ({ currentItemName = '', currentItemValue = 0 }) => {
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState(currentItemName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [comparison, setComparison] = useState(null);
  
  // 當組件掛載或currentItemName變化時自動搜索
  useEffect(() => {
    if (currentItemName && currentItemName.trim() !== '') {
      setKeyword(currentItemName);
      handleSearch(currentItemName);
    }
  }, [currentItemName]);

  // 處理搜索
  const handleSearch = async (searchKeyword) => {
    const keywordToSearch = searchKeyword || keyword;
    if (!keywordToSearch.trim()) {
      setError(t('pleaseEnterKeyword') || '請輸入搜索關鍵詞');
      return;
    }

    setLoading(true);
    setError(null);
    setPriceData(null);
    setComparison(null);

    try {
      const data = await fetchXianyuPrices(keywordToSearch);
      setPriceData(data);
      
      // 如果提供了當前物品價值，計算比較數據
      if (currentItemValue > 0) {
        const comparisonData = formatPriceComparison(data, currentItemValue);
        setComparison(comparisonData);
      }
    } catch (err) {
      setError(err.message || '獲取價格數據失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('xianyuPriceCheck') || '閒魚二手價格查詢'}
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label={t('searchKeyword') || '搜索關鍵詞'}
            variant="outlined"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={loading}
            size="small"
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('search') || '查詢'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {priceData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('searchResults') || '搜索結果'}: {priceData.keyword}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {t('averagePrice') || '平均價格'}: ¥{priceData.averagePrice.toFixed(1)}
              </Typography>
              <Typography variant="body2">
                {t('priceRange') || '價格範圍'}: ¥{priceData.priceRange.min.toFixed(1)} - ¥{priceData.priceRange.max.toFixed(1)}
              </Typography>
              <Typography variant="body2">
                {t('itemCount') || '商品數量'}: {priceData.count}
              </Typography>
            </Box>

            {comparison && (
              <Alert 
                severity={comparison.isCurrentValueHigher ? 'warning' : 'success'}
                sx={{ mt: 1 }}
              >
                {comparison.comparisonText}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              {t('xianyuItemList') || '閒魚商品列表'}
            </Typography>
            
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              {priceData.products.map((product) => (
                <Box 
                  key={product.id} 
                  sx={{ 
                    p: 1, 
                    mb: 1, 
                    border: '1px solid #eee',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {product.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.condition} · {product.location}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ¥{product.price.toFixed(1)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default XianyuPriceChecker;