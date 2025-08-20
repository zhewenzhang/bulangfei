import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import aiClassificationService from '../services/aiClassificationService';
import CategoryDurationService from '../services/categoryDurationService';
import AuthComponent from './Auth';
import XianyuPriceChecker from './XianyuPriceChecker';
import logger from '../utils/logger';

import { Dialog, DialogContent } from '@mui/material';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const Calculator = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    purchasePrice: '',
    targetDailyCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'In Use',
    soldPrice: '',
    categoryId: null,
  });

  const [categories, setCategories] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [classifying, setClassifying] = useState(false);
  const [autoCalculateEnabled, setAutoCalculateEnabled] = useState(true);
  const [manualTargetEdit, setManualTargetEdit] = useState(false);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // 加载分类数据
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      logger.error('Error fetching categories:', error);
    }
  };

  // 物品分类函数（使用AI分类服务）
  const classifyItem = async (itemName, userId) => {
    if (!itemName.trim() || !userId) return null;
    
    try {
      setClassifying(true);
      const result = await aiClassificationService.classifyItem(itemName, userId);
      
      if (result.success) {
        return {
          success: true,
          suggestedCategory: result.suggestedCategory,
          confidence: result.confidence,
          method: result.method,
          matchedKeyword: result.matchedKeyword,
          reasoning: result.reasoning
        };
      }
      
      return result;
    } catch (error) {
      logger.error('Error in item classification:', error);
      return {
        success: false,
        confidence: 0,
        suggestedCategory: null,
        error: error.message
      };
    } finally {
      setClassifying(false);
    }
  };

  // AI分类函数（仅在用户完成输入时调用）
  const performClassification = useCallback(async (itemName, userId) => {
    if (!itemName.trim() || itemName.trim().length < 2 || !userId) {
      setSuggestedCategories([]);
      return;
    }
    
    logger.debug('开始执行AI分类，物品名称:', itemName);
    const result = await classifyItem(itemName, userId);
    logger.debug('分类结果:', result);
    
    if (result && result.success && result.suggestedCategory) {
      logger.debug('设置分类建议:', result.suggestedCategory);
      setSuggestedCategories([result]);
      
      // 如果置信度高于0.7，自动选择分类
      if (result.confidence > 0.7) {
        setFormState(prev => ({ ...prev, categoryId: result.suggestedCategory.id }));
        // useEffect会自动处理目标日耗计算，无需手动调用
      }
    } else {
      logger.debug('分类失败或无结果:', result);
      setSuggestedCategories([]);
    }
  }, []);

  // 处理物品名称变化（仅更新状态，不触发分类）
  const handleNameChange = (event) => {
    const { value } = event.target;
    setFormState(prev => ({ ...prev, name: value }));
    
    // 如果输入内容太短，清除建议
    if (value.trim().length < 2) {
      setSuggestedCategories([]);
    }
  };
  
  // 处理输入框失去焦点时的AI分析
  const handleNameBlur = (event) => {
    const { value } = event.target;
    logger.debug('handleNameBlur 触发，输入值:', value, '用户:', user);
    if (value.trim().length >= 2 && user) {
      logger.debug('满足条件，开始AI分析');
      performClassification(value, user.id);
    } else {
      logger.debug('不满足条件：输入长度:', value.trim().length, '用户存在:', !!user);
    }
  };
  
  // 处理回车键触发AI分析
  const handleNameKeyPress = (event) => {
    logger.debug('handleNameKeyPress 触发，按键:', event.key);
    if (event.key === 'Enter') {
      const { value } = event.target;
      logger.debug('回车键触发，输入值:', value, '用户:', user);
      if (value.trim().length >= 2 && user) {
        logger.debug('满足条件，开始AI分析');
        performClassification(value, user.id);
      } else {
        logger.debug('不满足条件：输入长度:', value.trim().length, '用户存在:', !!user);
      }
    }
  };




  // 自动计算目标日耗
  const autoCalculateTarget = useCallback((purchasePrice, categoryId) => {
    logger.debug('autoCalculateTarget called:', { purchasePrice, categoryId, autoCalculateEnabled, manualTargetEdit });
    
    if (!autoCalculateEnabled || manualTargetEdit || !purchasePrice || !categoryId) {
      logger.debug('autoCalculateTarget early return:', { autoCalculateEnabled, manualTargetEdit, purchasePrice, categoryId });
      return;
    }

    const price = parseFloat(purchasePrice);
    if (isNaN(price) || price <= 0) {
      logger.debug('Invalid price:', price);
      return;
    }

    // 找到对应的分类
    const category = categories.find(cat => cat.id === categoryId);
    logger.debug('Found category:', category);
    if (!category) {
      logger.debug('Category not found for id:', categoryId);
      return;
    }

    // 使用CategoryDurationService计算目标日耗
    const result = CategoryDurationService.autoCalculateTarget(price, category.name);
    logger.debug('Calculation result:', result);
    
    setFormState(prevState => ({
      ...prevState,
      targetDailyCost: result.dailyTarget.toString()
    }));

    // 显示计算信息
    setNotification({
      open: true,
      message: t('autoCalculateNotification', {
        categoryName: category.name,
        dailyTarget: result.dailyTarget,
        duration: result.duration
      }),
      severity: 'info'
    });
  }, [autoCalculateEnabled, manualTargetEdit, categories]);

  // 监听购买价格和分类变化，自动计算目标日耗
  useEffect(() => {
    if (formState.purchasePrice && formState.categoryId && !manualTargetEdit) {
      logger.debug('useEffect triggered auto calculation:', { purchasePrice: formState.purchasePrice, categoryId: formState.categoryId });
      autoCalculateTarget(formState.purchasePrice, formState.categoryId);
    }
  }, [formState.purchasePrice, formState.categoryId, manualTargetEdit, autoCalculateTarget]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    setFormState(prevState => {
      const newState = { ...prevState, [name]: value };
      
      // 如果是目标日耗的手动修改，标记为手动编辑
      if (name === 'targetDailyCost') {
        setManualTargetEdit(true);
      }
      
      // useEffect会自动处理目标日耗计算，无需手动调用
      
      return newState;
    });
  };

  // 处理分类选择变化
  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setFormState(prevState => ({ ...prevState, categoryId: value }));
    // useEffect会自动处理目标日耗计算，无需手动调用
  };

  // 重置自动计算状态
  const resetAutoCalculate = () => {
    setManualTargetEdit(false);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleCalculate = () => {
    setLoading(true);
    const { name, purchasePrice, targetDailyCost, purchaseDate, status, soldPrice } = formState;
    const price = parseFloat(purchasePrice);
    const target = parseFloat(targetDailyCost);
    const sold = status === 'Sold' ? parseFloat(soldPrice) || 0 : 0;

    if (isNaN(price) || isNaN(target) || !purchaseDate) {
      setNotification({ open: true, message: '请填写所有必填字段并确保数字有效。', severity: 'error' });
      setLoading(false);
      return;
    }

    const pDate = new Date(purchaseDate);
    const today = new Date();
    const timeDiff = today.getTime() - pDate.getTime();
    const daysInService = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const totalCost = price - sold;
    const actualDailyCost = totalCost / daysInService;

    let daysToMeetTarget = 'N/A';
    if (actualDailyCost > target) {
      const requiredTotalDays = totalCost / target;
      daysToMeetTarget = Math.ceil(requiredTotalDays - daysInService);
    } else {
      daysToMeetTarget = 0;
    }

    const calculatedResults = { name, daysInService, actualDailyCost: actualDailyCost.toFixed(1), targetDailyCost: target.toFixed(1), overUnder: (actualDailyCost - target).toFixed(1), daysToMeetTarget };
    setResults(calculatedResults);
    setLoading(false);
    
    // 滚动到结果区域
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    

  };

  const handleSaveAndAnalyze = async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (!results) {
      setNotification({ open: true, message: '请先进行计算再保存。', severity: 'warning' });
      return;
    }

    setSaving(true);
    
    // 确定分类方法
    let classificationMethod = 'manual';
    let confidenceScore = null;
    
    if (formState.categoryId) {
      const suggestion = suggestedCategories.find(s => s.suggestedCategory && s.suggestedCategory.id === formState.categoryId);
      if (suggestion) {
        classificationMethod = suggestion.method;
        confidenceScore = suggestion.confidence; // 使用原始置信度值
      }
    }
    
    const recordToSave = { 
      name: results.name, 
      target: results.targetDailyCost, 
      actual: results.actualDailyCost, 
      service_duration: results.daysInService,
      purchase_price: formState.purchasePrice ? parseFloat(formState.purchasePrice) : null,
      purchase_date: formState.purchaseDate, // 保存购买日期
      category_id: formState.categoryId,
      classification_method: classificationMethod,
      confidence_score: confidenceScore,
      suggested_categories: suggestedCategories.length > 0 ? JSON.stringify(suggestedCategories) : null,
      user_id: user.id
    };

    const { error } = await supabase.from('calculations').insert([recordToSave]);

    if (error) {
      logger.error('Error inserting data:', error);
      setNotification({ open: true, message: `保存数据时出错: ${error.message}`, severity: 'error' });
    } else {
      setNotification({ open: true, message: '计算结果保存成功！', severity: 'success' });
      // 清空表单
      setFormState({
        name: '',
        purchasePrice: '',
        targetDailyCost: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'In Use',
        soldPrice: '',
        categoryId: null,
      });
      setResults(null);
      setSuggestedCategories([]);
      setManualTargetEdit(false);
    }
    setSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 4, px: 2 }}>
        <Typography 
          variant="h1" 
          component="h1"
          sx={{ 
            fontSize: { xs: '3rem', sm: '4.5rem', md: '5.5rem' },
            fontFamily: '"Dancing Script", "Brush Script MT", cursive',
            fontWeight: 700,
            mb: 3,
            mt: 2,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease-in-out infinite',
            '@keyframes gradientShift': {
              '0%, 100%': {
                backgroundPosition: '0% 50%'
              },
              '50%': {
                backgroundPosition: '100% 50%'
              }
            },
            letterSpacing: '0.02em',
            textShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
            filter: 'drop-shadow(0 4px 8px rgba(118, 75, 162, 0.2))',
            width: '100%',
            overflow: 'visible',
            whiteSpace: 'nowrap'
          }}
        >
          Usefull
        </Typography>
      </Box>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          subheader={
            <Typography variant="subtitle1" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              fontSize: '1.1rem'
            }}>
              {t('itemResidualValueManagement')}
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                variant="filled" 
                label={t('itemName')} 
                name="name" 
                value={formState.name} 
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyPress={handleNameKeyPress}
                sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
              />
            </Grid>
            
            {/* 分类选择器 */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="filled">
                <InputLabel sx={{ fontSize: '1.1rem' }}>{t('itemCategory')}</InputLabel>
                <Select
                  name="categoryId"
                  value={formState.categoryId || ''}
                  onChange={handleCategoryChange}
                  label={t('itemCategory')}
                >
                  <MenuItem value="">{t('selectCategory')}</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* 显示分类建议 */}
              {suggestedCategories.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    {t('suggestedCategories')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {suggestedCategories.map((suggestion, index) => {
                      // 安全检查：确保suggestion和suggestion.suggestedCategory存在
                      if (!suggestion || !suggestion.suggestedCategory) {
                        logger.warn('Invalid suggestion data:', suggestion);
                        return null;
                      }
                      
                      const category = suggestion.suggestedCategory;
                      return (
                        <Chip
                          key={index}
                          label={`${category.icon || '📦'} ${category.name || '未知分类'}`}
                          size="small"
                          variant={formState.categoryId === category.id ? "filled" : "outlined"}
                          style={{ 
                            backgroundColor: formState.categoryId === category.id ? (category.color || '#6b7280') : 'transparent',
                            borderColor: category.color || '#6b7280',
                            color: formState.categoryId === category.id ? 'white' : (category.color || '#6b7280')
                          }}
                          onClick={() => {
                            setFormState(prev => ({ ...prev, categoryId: category.id }));
                            // useEffect会自动处理目标日耗计算，无需手动调用
                          }}
                          clickable
                        />
                      );
                    }).filter(Boolean)}
                  </Box>
                </Box>
              )}
              
              {classifying && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="textSecondary">
                    {t('analyzingCategory')}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="number" 
                variant="filled" 
                label={t('purchasePrice')} 
                name="purchasePrice" 
                value={formState.purchasePrice} 
                onChange={handleChange}
                sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ position: 'relative' }}>
                <TextField 
                  fullWidth 
                  type="number" 
                  variant="filled" 
                  label={t('targetDailyCost')} 
                  name="targetDailyCost" 
                  value={formState.targetDailyCost} 
                  onChange={handleChange}
                  sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
                  helperText={manualTargetEdit ? t('manuallyModified') : (autoCalculateEnabled ? t('autoCalculateBasedOnCategory') : '')}
                />
                {manualTargetEdit && (
                  <Button
                    size="small"
                    onClick={() => {
                      resetAutoCalculate();
                      if (formState.purchasePrice && formState.categoryId) {
                        autoCalculateTarget(formState.purchasePrice, formState.categoryId);
                      }
                    }}
                    sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: 8, 
                      minWidth: 'auto',
                      fontSize: '0.75rem'
                    }}
                  >
                    {t('recalculate')}
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label={t('purchaseDate')} 
                type="date" 
                name="purchaseDate" 
                variant="filled" 
                value={formState.purchaseDate} 
                onChange={handleChange} 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="filled">
                <InputLabel sx={{ fontSize: '1.1rem' }}>{t('itemStatus')}</InputLabel>
                <Select name="status" value={formState.status} onChange={handleChange} label={t('itemStatus')}>
                  <MenuItem value="In Use">{t('inUse')}</MenuItem>
                  <MenuItem value="Discontinued">{t('discontinued')}</MenuItem>
                  <MenuItem value="Sold">{t('sold')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formState.status === 'Sold' && (
              <Grid item xs={12}>
                <TextField 
                fullWidth 
                type="number" 
                variant="filled" 
                label={t('salePrice')} 
                name="soldPrice" 
                value={formState.soldPrice} 
                onChange={handleChange}
              />
              </Grid>
            )}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                fullWidth
                variant="contained" 
                color="primary" 
                size="large" 
                onClick={handleCalculate} 
                disabled={loading}
                sx={{ 
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',

                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} color="inherit" />
                    <Typography>{t('calculating')}</Typography>
                  </Box>
                ) : (
                  t('calculate')
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

        <Card 
          ref={resultsRef}
          sx={{ 
            mt: 4,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
            border: '2px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <CardHeader 
            title={
              <Typography variant="h5" sx={{ 
                textAlign: 'center',
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                {t('calculationResults')}
              </Typography>
            }
          />
          <CardContent>
            {results && (
              <Box>
                <Typography variant="h4" component="div" sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  color: 'primary.main',
                  fontWeight: 700
                }}>
                  {results.name}
                </Typography>
                
                <Grid container spacing={3}>
                  {/* 服役天数卡片 */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ 
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>{t('daysInService')}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {results.daysInService}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{t('days')}</Typography>
                    </Card>
                  </Grid>
                  
                  {/* 实际日耗卡片 */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ 
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>{t('actualDailyCost')}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {results.actualDailyCost}元
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{t('dailyCost')}</Typography>
                    </Card>
                  </Grid>
                  
                  {/* 目标日耗卡片 */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ 
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>{t('targetDailyCost')}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {results.targetDailyCost}元
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{t('targetCost')}</Typography>
                    </Card>
                  </Grid>
                  
                  {/* 差额卡片 */}
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ 
                      background: results.overUnder > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      border: results.overUnder > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Typography variant="h6" color={results.overUnder > 0 ? 'error.main' : 'success.main'} sx={{ mb: 1 }}>
                        {results.overUnder > 0 ? t('exceedsTarget') : t('belowTarget')}
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 700, 
                        color: results.overUnder > 0 ? 'error.main' : 'success.main'
                      }}>
                        {results.overUnder > 0 ? '+' : ''}{results.overUnder}元
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{t('differenceFromTarget')}</Typography>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* 结论卡片 */}
                <Card sx={{ 
                  mt: 3,
                  background: results.daysToMeetTarget > 0 ? 
                    'linear-gradient(45deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))' :
                    'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1))',
                  border: results.daysToMeetTarget > 0 ? 
                    '2px solid rgba(239, 68, 68, 0.3)' :
                    '2px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'center',
                  p: 3
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    color: results.daysToMeetTarget > 0 ? 'warning.main' : 'success.main',
                    mb: 1
                  }}>
                    {results.daysToMeetTarget > 0 ? 
                      t('daysToMeetTarget').replace('{days}', results.daysToMeetTarget) : 
                      t('targetAchieved')
                    }
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {results.daysToMeetTarget > 0 ? 
                      t('continueUsing') : 
                      t('congratulations')
                    }
                  </Typography>
                </Card>
                
                {/* 保存并分析按钮 */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={handleSaveAndAnalyze}
                    disabled={saving || !results}
                    sx={{ 
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',

                    }}
                  >
                    {saving ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} color="inherit" />
                        <Typography>{t('saving')}</Typography>
                      </Box>
                    ) : (
                      t('saveAndAnalyze')
                    )}
                  </Button>
                </Box>
                
                {/* 閒魚價格查詢組件 */}
                {results && (
                  <Box sx={{ mt: 3 }}>
                    <XianyuPriceChecker 
                      currentItemName={results.name} 
                      currentItemValue={results.currentValue || parseFloat(formState.purchasePrice) || 0} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>



      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

        {/* 登录对话框 */}
        <Dialog 
          open={showLoginDialog} 
          onClose={() => setShowLoginDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ p: 0 }}>
             <AuthComponent onClose={() => setShowLoginDialog(false)} isDialog={true} />
           </DialogContent>
        </Dialog>
      </Box>
    );
  };

  export default Calculator;
