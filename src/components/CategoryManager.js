import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import categoryOptimizationService from '../services/categoryOptimizationService';
import logger from '../utils/logger';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AIIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const CategoryManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 添加用户登录检查
  useEffect(() => {
    logger.debug('CategoryManager mounted, user:', user);
  }, [user]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const [autoClassifying, setAutoClassifying] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#6b7280',
    description: ''
  });

  // 预设的图标选项
  const iconOptions = [
    '🚗', '📱', '👕', '🏠', '⚽', '📚', '💄', '🎮', '📦',
    '🍔', '✈️', '🎵', '📷', '💻', '👟', '⌚', '🎯', '🔧',
    '🎨', '📖', '🏃', '🎪', '🌟', '💡', '🔥', '⭐'
  ];

  // 预设的颜色选项
  const colorOptions = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#6b7280', '#374151', '#1f2937'
  ];

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  // 如果用户未登录，显示提示
  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          请先登录以使用分类管理功能
        </Typography>
        <Typography variant="body2" color="text.secondary">
          分类管理功能需要用户登录后才能使用
        </Typography>
      </Box>
    );
  }

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      logger.error('Error fetching categories:', error);
      setNotification({ open: true, message: '获取分类失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setNotification({ open: true, message: '请输入分类名称', severity: 'warning' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name,
          icon: newCategory.icon,
          color: newCategory.color,
          description: newCategory.description,
          user_id: user?.id
        }])
        .select();

      if (error) throw error;

      setCategories(prev => [...prev, ...data]);
      setNewCategory({ name: '', icon: '📦', color: '#6b7280', description: '' });
      setShowAddDialog(false);
      setNotification({ open: true, message: '分类添加成功', severity: 'success' });
    } catch (error) {
      logger.error('Error adding category:', error);
      setNotification({ open: true, message: '添加分类失败', severity: 'error' });
    }
  };

  const handleUpdateCategory = async (categoryId, updates) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ));
      setEditingCategory(null);
      setNotification({ open: true, message: '分类更新成功', severity: 'success' });
    } catch (error) {
      logger.error('Error updating category:', error);
      setNotification({ open: true, message: '更新分类失败', severity: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('确定要删除这个分类吗？')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setNotification({ open: true, message: '分类删除成功', severity: 'success' });
    } catch (error) {
      logger.error('Error deleting category:', error);
      setNotification({ open: true, message: '删除分类失败', severity: 'error' });
    }
  };

  const handleAIOptimize = async () => {
    logger.debug('AI优化按钮被点击，用户信息:', user);
    if (!user?.id) {
      logger.warn('用户未登录或用户ID不存在');
      setNotification({ open: true, message: '请先登录', severity: 'warning' });
      return;
    }

    logger.debug('开始AI优化，用户ID:', user.id);
    setOptimizing(true);
    try {
      const result = await categoryOptimizationService.generateOptimizationSuggestions(user.id);
      setOptimizationSuggestions(result.suggestions);
      setShowOptimizationDialog(true);
      
      if (result.suggestions.length === 0) {
        setNotification({ open: true, message: '您的分类结构已经很优化了！', severity: 'success' });
      } else {
        setNotification({ open: true, message: `AI分析完成，发现 ${result.suggestions.length} 条优化建议`, severity: 'info' });
      }
    } catch (error) {
      logger.error('AI优化失败:', error);
      setNotification({ open: true, message: 'AI优化失败，请稍后重试', severity: 'error' });
    } finally {
      setOptimizing(false);
    }
  };

  const handleAutoClassify = async () => {
    logger.debug('开始AI自动分类，用户ID:', user?.id);
    
    if (!user?.id) {
      logger.warn('用户未登录');
      setNotification({
        open: true,
        message: '请先登录后再使用AI自动分类功能',
        severity: 'warning'
      });
      return;
    }

    setAutoClassifying(true);
    try {
      // 获取未分类的计算记录
      logger.debug('正在获取未分类的计算记录...');
      const { data: unclassifiedCalculations, error: calcError } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .is('category_id', null);

      if (calcError) {
        logger.error('获取未分类记录失败:', calcError);
        throw calcError;
      }

      logger.debug('找到未分类记录数量:', unclassifiedCalculations?.length || 0);
      
      if (!unclassifiedCalculations || unclassifiedCalculations.length === 0) {
        logger.debug('没有未分类记录');
        setNotification({
          open: true,
          message: '没有找到需要分类的记录',
          severity: 'info'
        });
        return;
      }

      // 获取现有分类
      logger.debug('正在获取现有分类...');
      const { data: existingCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (catError) {
        logger.error('获取现有分类失败:', catError);
        throw catError;
      }

      logger.debug('现有分类数量:', existingCategories?.length || 0);
      
      let processedCount = 0;
      let createdCategories = [];

      // 为每个未分类的记录进行AI分类
      logger.debug('开始处理未分类记录...');
      for (const calculation of unclassifiedCalculations) {
        try {
          logger.debug('处理记录:', calculation.name);
          // 基于物品名称智能匹配或创建分类
          const itemName = calculation.name.toLowerCase();
          let targetCategory = null;

          // 首先尝试匹配现有分类
          if (existingCategories && existingCategories.length > 0) {
            targetCategory = existingCategories.find(cat => 
              itemName.includes(cat.name.toLowerCase()) || 
              cat.name.toLowerCase().includes(itemName)
            );
          }

          // 如果没有匹配的分类，创建新分类
          if (!targetCategory) {
            // 智能生成分类名称
            let categoryName = '';
            if (itemName.includes('手机') || itemName.includes('phone')) {
              categoryName = '电子产品';
            } else if (itemName.includes('衣') || itemName.includes('服装') || itemName.includes('裤') || itemName.includes('鞋')) {
              categoryName = '服装配饰';
            } else if (itemName.includes('书') || itemName.includes('本')) {
              categoryName = '书籍文具';
            } else if (itemName.includes('食') || itemName.includes('吃') || itemName.includes('餐')) {
              categoryName = '食品饮料';
            } else if (itemName.includes('车') || itemName.includes('交通')) {
              categoryName = '交通出行';
            } else if (itemName.includes('房') || itemName.includes('租')) {
              categoryName = '住房相关';
            } else {
              // 默认使用物品名称的前几个字符作为分类名
              categoryName = calculation.name.length > 4 ? calculation.name.substring(0, 4) : calculation.name;
            }

            // 检查是否已经创建了相同名称的分类
            const existingNewCategory = createdCategories.find(cat => cat.name === categoryName);
            if (existingNewCategory) {
              targetCategory = existingNewCategory;
            } else {
              // 创建新分类
              const { data: newCategory, error: createError } = await supabase
                .from('categories')
                .insert({
                  name: categoryName,
                  color: '#' + Math.floor(Math.random()*16777215).toString(16), // 随机颜色
                  user_id: user.id,
                  description: `AI自动创建的分类，基于物品：${calculation.name}`
                })
                .select()
                .single();

              if (createError) {
                logger.error('创建分类失败:', createError);
                continue;
              }

              targetCategory = newCategory;
              createdCategories.push(newCategory);
            }
          }

          // 更新计算记录的分类
          if (targetCategory) {
            const { error: updateError } = await supabase
                .from('calculations')
                .update({ 
                  category_id: targetCategory.id,
                  classification_method: 'ai',
                  confidence_score: 0.8
                })
                .eq('id', calculation.id);

            if (!updateError) {
              processedCount++;
            }
          }
        } catch (error) {
          logger.error('处理记录失败:', calculation.name, error);
        }
      }

      // 刷新分类列表
      await fetchCategories();

      setNotification({
        open: true,
        message: `AI自动分类完成！处理了 ${processedCount} 条记录，创建了 ${createdCategories.length} 个新分类`,
        severity: 'success'
      });

    } catch (error) {
      logger.error('AI自动分类失败:', error);
      setNotification({
        open: true,
        message: 'AI自动分类失败，请稍后重试',
        severity: 'error'
      });
    } finally {
      setAutoClassifying(false);
    }
  };

  const handleApplySuggestion = async (suggestion) => {
    try {
      const result = await categoryOptimizationService.applySuggestion(suggestion, user.id);
      setNotification({ open: true, message: result.message, severity: 'success' });
      await fetchCategories(); // 刷新分类列表
      
      // 移除已应用的建议
      setOptimizationSuggestions(prev => prev.filter(s => s !== suggestion));
    } catch (error) {
      logger.error('应用建议失败:', error);
      setNotification({ open: true, message: '应用建议失败', severity: 'error' });
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'cleanup': return '🧹';
      case 'merge': return '🔗';
      case 'add': return '➕';
      case 'rename': return '✏️';
      case 'value': return '💰';
      default: return '💡';
    }
  };

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const CategoryCard = ({ category }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description || ''
    });

    const handleSave = () => {
      handleUpdateCategory(category.id, editData);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description || ''
      });
      setIsEditing(false);
    };

    return (
      <Card sx={{ 
        height: '100%',
        border: `2px solid ${category.color}`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${category.color}40`
        }
      }}>
        <CardContent sx={{ p: 2 }}>
          {isEditing ? (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="分类名称"
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>图标:</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {iconOptions.map(icon => (
                    <IconButton
                      key={icon}
                      size="small"
                      onClick={() => setEditData(prev => ({ ...prev, icon }))}
                      sx={{ 
                        border: editData.icon === icon ? '2px solid #1976d2' : '1px solid #ddd',
                        borderRadius: 1
                      }}
                    >
                      {icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>颜色:</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {colorOptions.map(color => (
                    <Box
                      key={color}
                      onClick={() => setEditData(prev => ({ ...prev, color }))}
                      sx={{
                        width: 24,
                        height: 24,
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: editData.color === color ? '3px solid #1976d2' : '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <TextField
                size="small"
                fullWidth
                multiline
                rows={2}
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <IconButton size="small" onClick={handleCancel} color="default">
                  <CancelIcon />
                </IconButton>
                <IconButton size="small" onClick={handleSave} color="primary">
                  <SaveIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">{category.icon}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                </Box>
                <Box>
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteCategory(category.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {category.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {category.description}
                </Typography>
              )}
              
              <Chip
                size="small"
                label={`颜色: ${category.color}`}
                sx={{ 
                  backgroundColor: category.color,
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              分类管理
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="AI优化建议">
                <Button
                  variant="outlined"
                  startIcon={optimizing ? <CircularProgress size={16} /> : <AIIcon />}
                  onClick={handleAIOptimize}
                  disabled={optimizing}
                  size="small"
                >
                  {optimizing ? '分析中...' : 'AI优化'}
                </Button>
              </Tooltip>
              <Tooltip title="为未分类的记录自动分类">
                <Button
                  variant="outlined"
                  startIcon={autoClassifying ? <CircularProgress size={16} /> : <AIIcon />}
                  onClick={handleAutoClassify}
                  disabled={autoClassifying}
                  size="small"
                  color="secondary"
                >
                  {autoClassifying ? '分类中...' : 'AI自动分类'}
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddDialog(true)}
                size="small"
              >
                添加分类
              </Button>
            </Box>
          </Box>
        }
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <CategoryCard category={category} />
              </Grid>
            ))}
            {categories.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    暂无分类，点击"添加分类"开始创建
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </CardContent>

      {/* 添加分类对话框 */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加新分类</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="分类名称"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>选择图标:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {iconOptions.map(icon => (
                  <IconButton
                    key={icon}
                    onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                    sx={{ 
                      border: newCategory.icon === icon ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: 1
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>选择颜色:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {colorOptions.map(color => (
                  <Box
                    key={color}
                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: newCategory.color === color ? '3px solid #1976d2' : '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="描述（可选）"
              multiline
              rows={3}
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>取消</Button>
          <Button onClick={handleAddCategory} variant="contained">添加</Button>
        </DialogActions>
      </Dialog>

      {/* AI优化建议对话框 */}
      <Dialog 
        open={showOptimizationDialog} 
        onClose={() => setShowOptimizationDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            <Typography variant="h6">AI分类优化建议</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {optimizationSuggestions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                暂无优化建议，您的分类结构很不错！
              </Typography>
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              {optimizationSuggestions.map((suggestion, index) => (
                <Card key={index} sx={{ mb: 2, border: `2px solid ${getSuggestionColor(suggestion.priority)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{getSuggestionIcon(suggestion.type)}</Typography>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {suggestion.title}
                          </Typography>
                          <Chip 
                            label={suggestion.priority} 
                            size="small" 
                            sx={{ 
                              backgroundColor: getSuggestionColor(suggestion.priority),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleApplySuggestion(suggestion)}
                        sx={{ 
                          backgroundColor: getSuggestionColor(suggestion.priority),
                          '&:hover': {
                            backgroundColor: getSuggestionColor(suggestion.priority),
                            opacity: 0.8
                          }
                        }}
                      >
                        应用建议
                      </Button>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {suggestion.description}
                    </Typography>
                    
                    {suggestion.categories && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>相关分类:</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {suggestion.categories.map((cat, idx) => (
                            <Chip key={idx} label={cat} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {suggestion.reasoning && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>分析依据:</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {suggestion.reasoning.map((reason, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              • {reason}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {suggestion.suggestions && (
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>具体建议:</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {suggestion.suggestions.map((sug, idx) => (
                            <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                              • {sug.description || sug.reason || sug.suggestion}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOptimizationDialog(false)}>关闭</Button>
          <Button 
            onClick={() => {
              setShowOptimizationDialog(false);
              handleAIOptimize();
            }}
            variant="outlined"
            startIcon={<AIIcon />}
          >
            重新分析
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CategoryManager;