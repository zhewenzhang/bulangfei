import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCart,
  Sell,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import logger from '../utils/logger';

const ShoppingTimeline = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timelineData, setTimelineData] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenditure: 0,
    totalRecovery: 0,
    netSpending: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTimelineData();
    }
  }, [user]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取所有计算记录
      const { data: calculations, error: calcError } = await supabase
        .from('calculations')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (calcError) throw calcError;

      // 处理时间轴数据
      const processedData = [];
      let totalExpenditure = 0;
      let totalRecovery = 0;

      calculations?.forEach(item => {
        // 添加购买记录
        processedData.push({
          id: `purchase-${item.id}`,
          type: 'purchase',
          date: item.purchase_date,
          itemName: item.name,
          amount: parseFloat(item.purchase_price || 0),
          category: item.categories,
          originalItem: item,
          description: `购买 ${item.name}`
        });

        totalExpenditure += parseFloat(item.purchase_price || 0);

        // 如果有真实的出售记录
        if (item.is_sold && item.sale_date && item.sale_price) {
          processedData.push({
            id: `sale-${item.id}`,
            type: 'sale',
            date: item.sale_date,
            itemName: item.name,
            amount: parseFloat(item.sale_price),
            category: item.categories,
            originalItem: item,
            description: `出售 ${item.name}`
          });

          totalRecovery += parseFloat(item.sale_price);
        }
      });

      // 按日期排序
      processedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTimelineData(processedData);
      setSummary({
        totalExpenditure,
        totalRecovery,
        netSpending: totalExpenditure - totalRecovery,
        itemCount: calculations?.length || 0
      });

    } catch (error) {
      logger.error('Error fetching timeline data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `¥${parseFloat(value || 0).toFixed(1)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimelineIcon = (type) => {
    const iconProps = { 
      fontSize: 'small',
      sx: { color: 'white' }
    };
    
    switch (type) {
      case 'purchase':
        return <ShoppingCart {...iconProps} />;
      case 'sale':
        return <Sell {...iconProps} />;
      default:
        return <ShoppingCart {...iconProps} />;
    }
  };

  const getTimelineColor = (type) => {
    switch (type) {
      case 'purchase':
        return theme.palette.error.main; // 红色表示支出
      case 'sale':
        return theme.palette.success.main; // 绿色表示收入
      default:
        return theme.palette.primary.main;
    }
  };

  // 简洁的时间轴项组件
  const TimelineItemSimple = ({ item, isLast }) => (
    <Box sx={{ display: 'flex', mb: 2 }}>
      {/* 左侧轴线和图标 */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mr: 2,
        minWidth: '40px'
      }}>
        {/* 图标 */}
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: getTimelineColor(item.type),
            mb: 1
          }}
        >
          {getTimelineIcon(item.type)}
        </Avatar>
        
        {/* 连接线 */}
        {!isLast && (
          <Box
            sx={{
              width: '2px',
              height: '60px',
              bgcolor: theme.palette.divider,
              opacity: 0.5
            }}
          />
        )}
      </Box>

      {/* 右侧内容 */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: item.type === 'purchase' 
              ? theme.palette.error.light + '10' 
              : theme.palette.success.light + '10',
            border: `1px solid ${item.type === 'purchase' 
              ? theme.palette.error.light 
              : theme.palette.success.light}`,
            borderRadius: 2
          }}
        >
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {item.description}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', ml: 1 }}
              >
                {formatDate(item.date)}
              </Typography>
            </Box>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: item.type === 'purchase' 
                  ? theme.palette.error.main 
                  : theme.palette.success.main,
                fontWeight: 600
              }}
            >
              {item.type === 'purchase' ? '-' : '+'}{formatCurrency(item.amount)}
            </Typography>
            
            {item.category && (
              <Chip
                label={`${item.category.icon} ${item.category.name}`}
                size="small"
                sx={{
                  backgroundColor: item.category.color,
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '24px',
                  alignSelf: 'flex-start'
                }}
              />
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>加载购物旅程...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        加载数据时出错: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* 汇总面板 - 移动端在上方，桌面端在右侧 */}
      <Grid container spacing={3}>
        {isMobile && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    {/* Avatar组件用于显示一个圆形的图标容器 */}
                    <Avatar sx={{ 
                      bgcolor: 'error.main', // 设置背景色为错误色(红色)
                      mx: 'auto', // 水平居中对齐
                      mb: theme.breakpoints.down('sm') ? 0.3 : 1, // 在小屏幕下底部外边距为0.5,否则为1
                      width: theme.breakpoints.down('sm') ? 28 : 40, // 在小屏幕下宽度为28px,否则为40px
                      height: theme.breakpoints.down('sm') ? 28 : 40 // 在小屏幕下高度为28px,否则为40px
                    }}>
                      {/* TrendingDown图标表示下降趋势,大小根据屏幕尺寸响应式变化 */}
                      <TrendingDown sx={{ fontSize: theme.breakpoints.down('sm') ? 20 : 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('totalExpenditure')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.error.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(summary.totalExpenditure)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1), rgba(63, 81, 181, 0.05))',
                  border: '1px solid rgba(63, 81, 181, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      mx: 'auto', 
                      mb: theme.breakpoints.down('sm') ? 0.5 : 1, 
                      width: theme.breakpoints.down('sm') ? 28 : 40, 
                      height: theme.breakpoints.down('sm') ? 28 : 40 
                    }}>
                      <ShoppingCart sx={{ fontSize: theme.breakpoints.down('sm') ? 16 : 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('totalRecovery')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(summary.totalRecovery || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05))',
                  border: '1px solid rgba(255, 152, 0, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'warning.main', 
                      mx: 'auto', 
                      mb: theme.breakpoints.down('sm') ? 0.5 : 1, 
                      width: theme.breakpoints.down('sm') ? 28 : 40, 
                      height: theme.breakpoints.down('sm') ? 28 : 40 
                    }}>
                      <TrendingUp sx={{ fontSize: theme.breakpoints.down('sm') ? 16 : 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('netSpending')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: summary.netSpending > 0 ? theme.palette.primary.main : theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(summary.netSpending || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* 时间轴内容 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                购物旅程时间轴
              </Typography>
              {timelineData.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {timelineData.map((item, index) => (
                    <TimelineItemSimple 
                      key={item.id} 
                      item={item} 
                      isLast={index === timelineData.length - 1}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                  暂无购物记录
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 桌面端右侧汇总面板 */}
        {!isMobile && (
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                        <TrendingDown />
                      </Avatar>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          总开销
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(summary.totalExpenditure)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <TrendingUp />
                      </Avatar>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          总回收
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(summary.totalRecovery)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ShoppingCart />
                      </Avatar>
                      <Box>
                        <Typography color="textSecondary" gutterBottom>
                          净支出
                        </Typography>
                        <Typography variant="h5" color={summary.netSpending > 0 ? 'error' : 'success'}>
                          {formatCurrency(summary.netSpending)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'flex-start'
                  }}>
                    <Typography color="textSecondary" gutterBottom>
                      购买物品数量
                    </Typography>
                    <Typography variant="h4">
                      購物清單
                    </Typography>
                    <Divider sx={{ my: 1, width: '100%' }} />
                    <Typography variant="body2" color="textSecondary">
                      回收率: {summary.totalExpenditure > 0 ? 
                        `${Math.round((summary.totalRecovery / summary.totalExpenditure) * 100)}%` : 
                        '0%'
                      }
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ShoppingTimeline;