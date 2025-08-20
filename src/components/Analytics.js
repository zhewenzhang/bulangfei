import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ShoppingCart,
  Assessment,
  TrendingUp,
  TrendingDown,
  Inventory
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ShoppingTimeline from './ShoppingTimeline';
import logger from '../utils/logger';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalItems: 0,
    totalPurchaseValue: 0,
    totalCurrentValue: 0,
    totalDepreciation: 0,
    avgDepreciationRate: 0,
    totalExpenditure: 0,
    totalRecovery: 0,
    netSpending: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [error, setError] = useState(null);



  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取用户分类统计
      const { data: categoryData, error: categoryError } = await supabase
        .from('user_category_statistics')
        .select('*')
        .eq('user_id', user.id);

      if (categoryError) throw categoryError;

      // 获取最近添加的物品
      const { data: recentData, error: recentError } = await supabase
        .from('calculations')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // 获取所有计算记录用于计算消耗值和使用率
      const { data: allCalculations, error: allCalcError } = await supabase
        .from('calculations')
        .select('category_id, target, service_duration, purchase_price')
        .eq('user_id', user.id);

      if (allCalcError) throw allCalcError;

      if (recentError) throw recentError;

      // 重新计算每个分类的总消耗值（目标消耗 × 使用天数）
      const categoryConsumption = {};
      if (allCalculations && allCalculations.length > 0) {
        allCalculations.forEach(calc => {
          if (calc.category_id) {
            if (!categoryConsumption[calc.category_id]) {
              categoryConsumption[calc.category_id] = 0;
            }
            const targetDailyCost = parseFloat(calc.target || 0);
            const serviceDuration = calc.service_duration || 0;
            categoryConsumption[calc.category_id] += targetDailyCost * serviceDuration;
          }
        });
      }

      // 更新分类统计数据，替换total_current_value为重新计算的消耗值，并重新计算贬值金额
      const updatedCategoryStats = (categoryData || []).map(category => {
        const totalConsumption = categoryConsumption[category.category_id] || 0;
        const purchaseValue = parseFloat(category.total_purchase_value || 0);
        const depreciation = purchaseValue - totalConsumption; // 购买价格 - 当前价值
        
        return {
          ...category,
          total_current_value: totalConsumption,
          total_depreciation: depreciation
        };
      });

      setCategoryStats(updatedCategoryStats);
      setRecentItems(recentData || []);

      // 计算总体统计
      const totalItems = updatedCategoryStats?.reduce((sum, cat) => sum + cat.item_count, 0) || 0;
      const totalPurchaseValue = updatedCategoryStats?.reduce((sum, cat) => sum + parseFloat(cat.total_purchase_value || 0), 0) || 0;
      
      // 计算总消耗值（使用更新后的分类数据）
      const totalTargetConsumption = updatedCategoryStats?.reduce((sum, cat) => sum + parseFloat(cat.total_current_value || 0), 0) || 0;
      
      // 计算总贬值金额（购买价格 - 当前价值）
      const totalDepreciationAmount = totalPurchaseValue - totalTargetConsumption;
      
      // 计算使用率（耗用值 / 总购买价值）
      const usageRate = totalPurchaseValue > 0 ? (totalTargetConsumption / totalPurchaseValue * 100) : 0;
      const avgDepreciationRate = categoryData?.reduce((sum, cat) => sum + parseFloat(cat.depreciation_rate || 0), 0) / (categoryData?.length || 1) || 0;

      // 計算總開銷（購買價值）、總回收（當前價值）、淨支出（購買價值 - 當前價值）
      const totalExpenditure = totalPurchaseValue;
      const totalRecovery = totalTargetConsumption;
      const netSpending = totalPurchaseValue - totalTargetConsumption;

      setTotalStats({
        totalItems,
        totalPurchaseValue,
        totalCurrentValue: totalTargetConsumption,
        totalDepreciation: usageRate,
        avgDepreciationRate,
        totalExpenditure,
        totalRecovery,
        netSpending
      });

    } catch (error) {
      logger.error('Error fetching analytics data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value) => {
    return `${Math.round(parseFloat(value || 0)).toLocaleString()}${t('yuan')}`;
  };

  const formatPercentage = (value) => {
    return `${Math.round(parseFloat(value || 0))}%`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>{t.loading}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t('error')}: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        {t('analyticsTitle')}
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
        <Tab label="購物旅程" />
        <Tab label={t('overview')} />
        <Tab label={t('categories')} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <ShoppingTimeline />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* 总览统计卡片 - 移动端显示总开销、总回收、净支出 */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {isMobile ? (
            <>
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
                    <Avatar sx={{ 
                      bgcolor: 'error.main',
                      mx: 'auto',
                      mb: theme.breakpoints.down('sm') ? 0.3 : 1,
                      width: theme.breakpoints.down('sm') ? 28 : 40,
                      height: theme.breakpoints.down('sm') ? 28 : 40
                    }}>
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
                      {formatCurrency(totalStats.totalExpenditure)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
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
                      bgcolor: 'success.main',
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
                      {t('totalRecovery')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(totalStats.totalRecovery)}
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
                      {t('netSpending')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: totalStats.netSpending > 0 ? theme.palette.primary.main : theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(totalStats.netSpending)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1), rgba(63, 81, 181, 0.05))',
                  border: '1px solid rgba(63, 81, 181, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1 
                  }}>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('totalItems')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {totalStats.totalItems}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1 
                  }}>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('totalPurchaseValue')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.error.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(totalStats.totalPurchaseValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ 
                    py: theme.breakpoints.down('sm') ? 0.8 : 1.5, 
                    px: theme.breakpoints.down('sm') ? 0.5 : 1 
                  }}>
                    <Typography variant="caption" color="textSecondary" sx={{ 
                      fontSize: '1rem' 
                    }}>
                      {t('totalCurrentValue')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}>
                      {formatCurrency(totalStats.totalCurrentValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* 最近添加的物品 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('recentItems')}
            </Typography>
            {recentItems.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('itemName')}</TableCell>
                      <TableCell>{t('categoryName')}</TableCell>
                      <TableCell align="right">{t('purchasePrice')}</TableCell>
                      <TableCell align="right">{t('currentPrice')}</TableCell>
                      <TableCell align="right">{t('serviceDuration')}</TableCell>
                      <TableCell align="right">{t('addedDate')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.categories && (
                            <Chip
                              label={`${item.categories.icon} ${item.categories.name}`}
                              size="small"
                              style={{ backgroundColor: item.categories.color, color: 'white' }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.purchase_price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.actual)}</TableCell>
                        <TableCell align="right">{item.service_duration} {t('days')}</TableCell>
                        <TableCell align="right">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary">{t('noData')}</Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {/* 分类饼图 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('categories')} - {t('itemCount')}
                </Typography>
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category_name, item_count }) => `${category_name}: ${item_count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="item_count"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="textSecondary">{t('noData')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 分类价值柱状图 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('categories')} - {t('purchaseValue')}
                </Typography>
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category_name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="total_purchase_value" fill="#8884d8" name={t('purchaseValue')} />
                      <Bar dataKey="total_current_value" fill="#82ca9d" name={t('currentValue')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="textSecondary">{t('noData')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 分类详细表格 */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('categories')} - 详细统计
                </Typography>
                {categoryStats.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('categoryName')}</TableCell>
                          <TableCell align="right">{t('itemCount')}</TableCell>
                          <TableCell align="right">{t('purchaseValue')}</TableCell>
                          <TableCell align="right">{t('currentValue')}</TableCell>
                          <TableCell align="right">{t('depreciation')}</TableCell>
                          <TableCell align="right">{t('depreciationRate')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoryStats.map((category) => (
                          <TableRow key={category.category_id}>
                            <TableCell>
                              <Chip
                                label={`${category.icon} ${category.category_name}`}
                                size="small"
                                style={{ backgroundColor: category.color, color: 'white' }}
                              />
                            </TableCell>
                            <TableCell align="right">{category.item_count}</TableCell>
                            <TableCell align="right">{formatCurrency(category.total_purchase_value)}</TableCell>
                            <TableCell align="right">{formatCurrency(category.total_current_value)}</TableCell>
                            <TableCell align="right">{formatCurrency(category.total_depreciation)}</TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center">
                                <Box width="100%" mr={1}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(category.depreciation_rate, 100)}
                                    color={category.depreciation_rate > 50 ? "error" : "primary"}
                                  />
                                </Box>
                                <Box minWidth={35}>
                                  <Typography variant="body2" color="textSecondary">
                                    {formatPercentage(category.depreciation_rate)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary">{t('noData')}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>


      
      {/* 公式说明备注 */}
      <Box sx={{ mt: 4, p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
          <strong>{t('calculationFormula')}</strong><br/>
          {t('totalConsumptionFormula')}<br/>
          {t('usageRateFormula')}<br/>
          {t('depreciationRateFormula')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Analytics;