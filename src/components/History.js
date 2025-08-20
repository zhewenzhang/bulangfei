import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import logger from '../utils/logger';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SellIcon from '@mui/icons-material/Sell';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Auth from './Auth';
import XianyuPriceChecker from './XianyuPriceChecker';

async function fetchRecords(userId) {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching data:', error);
    throw error;
  }
  return data;
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

// 将headCells移到组件内部，以便使用翻译函数

const History = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const headCells = [
    { id: 'name', numeric: false, label: t('itemNameCol') },
    { id: 'target', numeric: true, label: t('targetDailyCostCol') },
    { id: 'actual', numeric: true, label: t('actualDailyCostCol') },
    { id: 'service_duration', numeric: true, label: t('serviceDurationCol') },
  ];
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('service_duration');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellFormData, setSellFormData] = useState({ sale_date: '', sale_price: '' });
  const [selectedItemForSale, setSelectedItemForSale] = useState(null);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDetailDialogOpen(true);
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedRow(null);
  };

  const handleEditClick = () => {
    setEditFormData({
         name: selectedRow.name || '',
         purchase_price: selectedRow.purchase_price || '',
         target: selectedRow.target || '',
         purchase_date: selectedRow.purchase_date || ''
       });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditFormData({});
  };

  const handleEditSave = async () => {
    try {
      setSaving(true);
      
      // 计算服役天数
      const purchaseDate = new Date(editFormData.purchase_date);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - purchaseDate.getTime();
      const serviceDuration = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      const { error } = await supabase
        .from('calculations')
        .update({
          name: editFormData.name,
          purchase_price: parseFloat(editFormData.purchase_price),
          target: parseFloat(editFormData.target),
          purchase_date: editFormData.purchase_date,
          service_duration: serviceDuration
        })
        .eq('id', selectedRow.id);

      if (error) throw error;

      // 重新获取数据
      const updatedData = await fetchRecords(user.id);
      setRows(updatedData);
      
      // 更新选中的行数据
      const updatedRow = updatedData.find(row => row.id === selectedRow.id);
      setSelectedRow(updatedRow);

      setNotification({
        open: true,
        message: '记录更新成功！',
        severity: 'success'
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      logger.error('Error updating record:', error);
      setNotification({
        open: true,
        message: '更新失败：' + error.message,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSellClick = (row, event) => {
    event.stopPropagation(); // 防止触发行点击事件
    setSelectedItemForSale(row);
    setSellFormData({ 
      sale_date: new Date().toISOString().split('T')[0], // 默认今天
      sale_price: '' 
    });
    setSellDialogOpen(true);
  };

  const handleSellClose = () => {
    setSellDialogOpen(false);
    setSelectedItemForSale(null);
    setSellFormData({ sale_date: '', sale_price: '' });
  };

  const handleSellSave = async () => {
    if (!selectedItemForSale || !sellFormData.sale_date || !sellFormData.sale_price) {
      setNotification({
        open: true,
        message: '请填写完整的出售信息',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('calculations')
        .update({
          is_sold: true,
          sale_date: sellFormData.sale_date,
          sale_price: parseFloat(sellFormData.sale_price)
        })
        .eq('id', selectedItemForSale.id);

      if (error) throw error;

      // 更新本地数据
      setRows(prevRows => 
        prevRows.map(row => 
          row.id === selectedItemForSale.id 
            ? { 
                ...row, 
                is_sold: true, 
                sale_date: sellFormData.sale_date, 
                sale_price: parseFloat(sellFormData.sale_price) 
              }
            : row
        )
      );

      setNotification({
        open: true,
        message: '出售记录保存成功！',
        severity: 'success'
      });

      handleSellClose();
    } catch (error) {
      logger.error('Error saving sale record:', error);
      setNotification({
        open: true,
        message: '保存失败：' + error.message,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSellFormChange = (field, value) => {
    setSellFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setRows([]);
      setError(null);
      return;
    }
    
    setLoading(true);
    fetchRecords(user.id)
      .then(data => {
        setRows(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setRows([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = useMemo(() =>
    stableSort(rows, getComparator(order, orderBy)),
    [rows, order, orderBy]
  );

  const getPerformanceColor = (actual, target) => {
    const ratio = actual / target;
    if (ratio <= 1) return 'success.main';
    if (ratio <= 1.5) return 'warning.main';
    return 'error.main';
  };

  // const getPerformanceIcon = (actual, target) => {
  //   const ratio = actual / target;
  //   if (ratio <= 1) return '🎉';
  //   if (ratio <= 1.5) return '⚠️';
  //   return '❌';
  // };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.05))',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <CardHeader 
          title={
            <Typography variant="h4" sx={{ 
              textAlign: 'center',
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {t('calculationHistory')}
            </Typography>
          }

        />
        
        {/* 统计指标卡片 */}
        {rows.length > 0 && (
          // 外层容器,设置内边距
          <Box sx={{ p: 0.5, pt: 0 }}>
            {/* 网格容器,设置子元素间距 */}
            <Grid container spacing={3}>
              {/* 第一个统计卡片 - 总消费 */}
              <Grid item xs={4} sm={4}>
                {/* 卡片容器,设置渐变背景和边框 */}
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 2
                }}>
                  {/* 卡片标题 */}
                  <Typography  sx={{ 
                    color: 'success.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {t('totalConsumption')}
                  </Typography>
                  {/* 卡片数值 - 计算总消费金额 */}
                  <Typography  sx={{
                    color: 'success.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: { xs: '0.6rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {/* 遍历所有记录,计算目标日耗与使用天数的乘积之和 */}
                    {rows.reduce((sum, row) => sum + (Number(row.target || 0) * Number(row.service_duration || 0)), 0).toFixed(1)}元
                  </Typography>
                </Paper>
              </Grid>
              
              {/* 第二个统计卡片 - 达标数量 */}
              <Grid item xs={4} sm={4}>
                {/* 卡片容器,设置渐变背景和边框 */}
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 2
                }}>
                  {/* 卡片标题 */}
                  <Typography  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {t('achievedCount')}
                  </Typography>
                  {/* 卡片数值 - 显示达标数量与总数量的比值 */}
                  <Typography  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: { xs: '0.6rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {/* 过滤实际日耗小于等于目标日耗的记录数量 */}
                    {rows.filter(row => Number(row.actual) <= Number(row.target)).length} / {rows.length}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={4} sm={4}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 2
                }}>
                  <Typography  sx={{ 
                    color: 'warning.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1,
                    fontSize: { xs: '0.8rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {t('estimatedAchievement')}
                  </Typography>
                  <Typography  sx={{
                    color: 'warning.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: { xs: '0.6rem', sm: '1.1rem', md: '1.2rem' }
                  }}>
                    {(() => {
                      const unachievedItems = rows.filter(row => Number(row.actual) > Number(row.target));
                      if (unachievedItems.length === 0) return t('allAchieved');
                      const avgDaysNeeded = unachievedItems.reduce((sum, row) => {
                        const purchasePrice = Number(row.purchase_price || 0);
                        const targetDaily = Number(row.target || 0);
                        const currentDaily = Number(row.actual || 0);
                        const serviceDays = Number(row.service_duration || 0);
                        
                        if (targetDaily <= 0) return sum;
                        
                        // 计算达到目标需要的总天数
                        const totalDaysNeeded = Math.ceil(purchasePrice / targetDaily);
                        // 还需要的天数 = 总需要天数 - 已服役天数
                        const remainingDays = Math.max(0, totalDaysNeeded - serviceDays);
                        return sum + remainingDays;
                      }, 0) / unachievedItems.length;
                      return `${Math.ceil(avgDaysNeeded)}天`;
                    })()} 
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
        <TableContainer sx={{ 
          background: 'rgba(30, 30, 46, 0.3)',
          backdropFilter: 'blur(10px)',
          width: '100%'
        }}>
          <Table sx={{ 
              tableLayout: 'fixed',
              width: '100%'
            }}>
            <TableHead>
              <TableRow sx={{ 
                '& .MuiTableCell-root': { 
                  background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  py: { xs: 1, sm: 1.5, md: 2 },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  whiteSpace: 'nowrap'
                } 
              }}>
                {headCells.map((headCell, index) => {
                  const widths = ['16.67%', '16.67%', '16.67%', '16.67%'];
                  return (
                    <TableCell
                      key={headCell.id}
                      align="center"
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.3) !important'
                        },
                        width: widths[index],
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                        whiteSpace: 'normal'
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            color: 'primary.main !important'
                          },
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          whiteSpace: 'normal'
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '0.5rem', sm: '0.875rem', md: '1rem' },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  width: '16.67%',
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                  whiteSpace: 'normal'
                }}>

                  {t('achievementStatus')}
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  width: '16.66%',
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                  whiteSpace: 'normal'
                }}>

                  出售状态
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{t('loading')}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="error.main" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{t('loadFailed')}</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{error}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : !user ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif', mb: 2 }}>{t('pleaseLoginFirst')}</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif', mb: 3 }}>{t('loginToViewAnalysis')}</Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setLoginDialogOpen(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                          }
                        }}
                      >
                        {t('loginNow')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 2} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>暂无数据</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>开始计算以查看历史记录</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, index) => {
                  const actual = Number(row.actual);
                  const target = Number(row.target);
                  const performanceColor = getPerformanceColor(actual, target);
                  
                  return (
                    <TableRow 
                      hover 
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.1)'
                        },
                        '&:nth-of-type(even)': {
                          background: 'rgba(99, 102, 241, 0.02)'
                        }
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: 'primary.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '16.67%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                        maxWidth: 0
                      }}>

                        {row.name}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: 'warning.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '16.67%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                        whiteSpace: 'normal'
                      }}>

                        {target.toFixed(1)}元
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: performanceColor,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '16.67%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                        whiteSpace: 'normal'
                      }}>

                        {actual.toFixed(1)}元
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: 'success.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '16.67%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' },
                        whiteSpace: 'normal'
                      }}>

                        {row.service_duration}{t('days')}
                      </TableCell>
                      <TableCell align="center" sx={{ 
                  width: '16.67%',
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 1,
                    borderRadius: 2,
                    background: `${performanceColor}20`,
                    border: `1px solid ${performanceColor}40`
                  }}>
                    <Typography sx={{ 
                      fontWeight: 600,
                      color: performanceColor,
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      {(() => {
                        const ratio = actual / target;
                        if (ratio <= 1) {
                          return t('achieved');
                        } else {
                          // 计算还需要多少天才能達成目标
                          const purchasePrice = Number(row.purchase_price || 0);
                          const serviceDays = Number(row.service_duration || 0);
                          if (target <= 0) return '无法计算';
                          
                          // 总需要天数 = 购买价格 / 目标日耗
                          const totalDaysNeeded = Math.ceil(purchasePrice / target);
                          // 还需要天数 = 总需要天数 - 已服役天数
                          const remainingDays = Math.max(0, totalDaysNeeded - serviceDays);
                          return (
                            <>
                              {remainingDays}天<br />
                              後達成
                            </>
                          );
                        }
                      })()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ 
                  width: '16.66%',
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                }}>
                  {row.is_sold ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="已出售"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    <IconButton
                      onClick={(event) => handleSellClick(row, event)}
                      color="primary"
                      size="small"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      <SellIcon />
                    </IconButton>
                  )}
                </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      <Dialog 
         open={loginDialogOpen} 
         onClose={() => setLoginDialogOpen(false)}
         maxWidth="sm"
         fullWidth
         sx={{
           '& .MuiDialog-container': {
             alignItems: 'flex-end',
           },
           '& .MuiDialog-paper': {
             margin: 0,
             borderRadius: '20px 20px 0 0',
             maxHeight: '85vh',
             width: '100%',
             background: 'rgba(255, 255, 255, 0.98)',
             backdropFilter: 'blur(20px)',
             boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',

           },
         }}
         TransitionProps={{
           timeout: 300,
         }}
       >
         <DialogContent 
           sx={{ 
             p: 0,
             '&::-webkit-scrollbar': {
               width: '6px',
             },
             '&::-webkit-scrollbar-track': {
               background: 'transparent',
             },
             '&::-webkit-scrollbar-thumb': {
               background: 'rgba(0, 0, 0, 0.2)',
               borderRadius: '3px',
             },
           }}
         >
           <Auth onClose={() => setLoginDialogOpen(false)} isDialog={true} />
         </DialogContent>
       </Dialog>

       {/* 出售对话框 */}
       <Dialog 
         open={sellDialogOpen} 
         onClose={handleSellClose}
         maxWidth="md"
         fullWidth
       >
         <DialogTitle>出售物品</DialogTitle>
         <DialogContent>
           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
             <Typography variant="body1" sx={{ mb: 2 }}>
               物品名称: {selectedItemForSale?.name}
             </Typography>
             
             <Grid container spacing={2}>
               <Grid item xs={12} md={6}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                   <TextField
                     fullWidth
                     label="出售日期"
                     type="date"
                     value={sellFormData.sale_date}
                     onChange={(e) => handleSellFormChange('sale_date', e.target.value)}
                     InputLabelProps={{
                       shrink: true,
                     }}
                     required
                   />

                   <TextField
                     fullWidth
                     label="出售价格"
                     type="number"
                     value={sellFormData.sale_price}
                     onChange={(e) => handleSellFormChange('sale_price', e.target.value)}
                     InputProps={{
                       startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                     }}
                     required
                   />
                 </Box>
               </Grid>
               <Grid item xs={12} md={6}>
                 {/* 閒魚價格查詢組件 */}
                 <XianyuPriceChecker 
                   currentItemName={selectedItemForSale?.name || ''} 
                   currentItemValue={selectedItemForSale?.purchase_price || 0} 
                 />
               </Grid>
             </Grid>
           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleSellClose}>取消</Button>
           <Button 
             onClick={handleSellSave} 
             variant="contained"
             disabled={!sellFormData.sale_date || !sellFormData.sale_price}
           >
             保存
           </Button>
         </DialogActions>
       </Dialog>
       
       {/* 详情弹窗 */}
       <Dialog 
         open={detailDialogOpen} 
         onClose={handleDetailClose}
         maxWidth="sm"
         fullWidth
         sx={{
           '& .MuiDialog-container': {
             alignItems: 'flex-end',
           },
           '& .MuiDialog-paper': {
             margin: 0,
             borderRadius: '20px 20px 0 0',
             maxHeight: '70vh',
             width: '100%',
             background: (theme) => theme.palette.mode === 'dark' 
               ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.05))'
               : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.98))',
             backdropFilter: 'blur(20px)',
             boxShadow: (theme) => theme.palette.mode === 'dark'
               ? '0 -10px 40px rgba(0, 0, 0, 0.2)'
               : '0 -10px 40px rgba(0, 0, 0, 0.1), 0 -4px 20px rgba(0, 0, 0, 0.05)',
             border: (theme) => theme.palette.mode === 'dark'
               ? '1px solid rgba(99, 102, 241, 0.2)'
               : '1px solid rgba(203, 213, 225, 0.4)',

           },
         }}
         TransitionProps={{
           timeout: 300,
         }}
       >
         <DialogContent sx={{ p: 0 }}>
           {selectedRow && (
             <Box sx={{ p: 4 }}>
               {/* 标题区域 */}
               <Box sx={{ 
                 textAlign: 'center', 
                 mb: 4,
                 pb: 3,
                 borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
               }}>
                 <Typography variant="h4" sx={{
                   background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                   WebkitBackgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   fontWeight: 700,
                   fontFamily: 'system-ui, -apple-system, sans-serif',
                   mb: 1
                 }}>
                   {selectedRow.name}
                 </Typography>
                 <Typography variant="subtitle1" sx={{
                   color: 'text.secondary',
                   fontFamily: 'system-ui, -apple-system, sans-serif'
                 }}>
                   {t('itemDetailInfo')}
                 </Typography>
               </Box>
               
               {/* 详情信息网格 */}
               <Grid container spacing={3}>
                 {/* 目标日耗 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
                       : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))',
                     border: (theme) => theme.palette.mode === 'dark'
                       ? '1px solid rgba(34, 197, 94, 0.2)'
                       : '1px solid rgba(34, 197, 94, 0.3)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: 'success.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('targetDailyCost')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: 'success.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {Number(selectedRow.target).toFixed(1)}元
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 实际日耗 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
                       : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))',
                     border: (theme) => theme.palette.mode === 'dark'
                       ? '1px solid rgba(59, 130, 246, 0.2)'
                       : '1px solid rgba(59, 130, 246, 0.3)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: 'primary.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('actualDailyCost')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: 'primary.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {Number(selectedRow.actual).toFixed(1)}元
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 购买价格 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
                       : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))',
                     border: (theme) => theme.palette.mode === 'dark'
                       ? '1px solid rgba(245, 158, 11, 0.2)'
                       : '1px solid rgba(245, 158, 11, 0.3)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: 'warning.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('purchasePrice')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: 'warning.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {selectedRow.purchase_price ? Number(selectedRow.purchase_price).toFixed(1) + '元' : t('notRecorded')}
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 已消耗金额 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))'
                       : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))',
                     border: (theme) => theme.palette.mode === 'dark'
                       ? '1px solid rgba(239, 68, 68, 0.2)'
                       : '1px solid rgba(239, 68, 68, 0.3)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: 'error.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('consumedAmount')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: 'error.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {(Number(selectedRow.target) * Number(selectedRow.service_duration)).toFixed(1)}元
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 服役天数 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => theme.palette.mode === 'dark'
                       ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))'
                       : 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08))',
                     border: (theme) => theme.palette.mode === 'dark'
                       ? '1px solid rgba(168, 85, 247, 0.2)'
                       : '1px solid rgba(168, 85, 247, 0.3)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: '#a855f7',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('serviceDays')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: '#a855f7',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {selectedRow.service_duration} 天
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 使用率 */}
                 <Grid item xs={12} sm={4}>
                   <Paper sx={{
                     p: 2,
                     background: (theme) => {
                       const usageRate = selectedRow.purchase_price ? 
                         (Number(selectedRow.target) * Number(selectedRow.service_duration)) / Number(selectedRow.purchase_price) * 100 : 0;
                       const isDark = theme.palette.mode === 'dark';
                       if (usageRate >= 80) {
                         return isDark 
                           ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
                           : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))';
                       } else if (usageRate >= 50) {
                         return isDark 
                           ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
                           : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))';
                       } else {
                         return isDark 
                           ? 'linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(156, 163, 175, 0.05))'
                           : 'linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(156, 163, 175, 0.08))';
                       }
                     },
                     border: (theme) => {
                       const usageRate = selectedRow.purchase_price ? 
                         (Number(selectedRow.target) * Number(selectedRow.service_duration)) / Number(selectedRow.purchase_price) * 100 : 0;
                       const isDark = theme.palette.mode === 'dark';
                       if (usageRate >= 80) {
                         return isDark ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(34, 197, 94, 0.3)';
                       } else if (usageRate >= 50) {
                         return isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.3)';
                       } else {
                         return isDark ? '1px solid rgba(156, 163, 175, 0.2)' : '1px solid rgba(156, 163, 175, 0.3)';
                       }
                     },
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="subtitle2" sx={{
                       color: (theme) => {
                         const usageRate = selectedRow.purchase_price ? 
                           (Number(selectedRow.target) * Number(selectedRow.service_duration)) / Number(selectedRow.purchase_price) * 100 : 0;
                         if (usageRate >= 80) return 'success.main';
                         if (usageRate >= 50) return 'warning.main';
                         return 'text.secondary';
                       },
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 0.5
                     }}>
                       {t('usageRate')}
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: (theme) => {
                         const usageRate = selectedRow.purchase_price ? 
                           (Number(selectedRow.target) * Number(selectedRow.service_duration)) / Number(selectedRow.purchase_price) * 100 : 0;
                         if (usageRate >= 80) return 'success.main';
                         if (usageRate >= 50) return 'warning.main';
                         return 'text.secondary';
                       },
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {selectedRow.purchase_price ? 
                         ((Number(selectedRow.target) * Number(selectedRow.service_duration)) / Number(selectedRow.purchase_price) * 100).toFixed(1) + '%' 
                         : t('unknown')}
                     </Typography>
                   </Paper>
                 </Grid>

               </Grid>
               
               {/* 操作按钮 */}
               <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                 <Button 
                   variant="outlined"
                   startIcon={<EditIcon />}
                   onClick={handleEditClick}
                   sx={{
                     borderColor: '#667eea',
                     color: '#667eea',
                     '&:hover': {
                       borderColor: '#5a6fd8',
                       backgroundColor: 'rgba(102, 126, 234, 0.1)'
                     },
                     px: 3,
                     py: 1.5,
                     borderRadius: 3,
                     fontWeight: 600,
                     fontFamily: 'system-ui, -apple-system, sans-serif'
                   }}
                 >
                   {t('editContent')}
                 </Button>
                 <Button 
                   variant="contained" 
                   onClick={handleDetailClose}
                   sx={{
                     background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                     '&:hover': {
                       background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                     },
                     px: 4,
                     py: 1.5,
                     borderRadius: 3,
                     fontWeight: 600,
                     fontFamily: 'system-ui, -apple-system, sans-serif'
                   }}
                 >
                   {t('closeDetail')}
                 </Button>
               </Box>
             </Box>
           )}
         </DialogContent>
       </Dialog>

       {/* 编辑对话框 */}
       <Dialog 
         open={editDialogOpen} 
         onClose={handleEditClose} 
         maxWidth="sm" 
         fullWidth
         sx={{
           '& .MuiDialog-paper': {
             position: 'fixed',
             bottom: 0,
             margin: 0,
             borderRadius: '16px 16px 0 0',
             maxHeight: '80vh',
             animation: editDialogOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in',
           },
           '& .MuiBackdrop-root': {
             backgroundColor: 'rgba(0, 0, 0, 0.5)',
           },
           '@keyframes slideUp': {
             from: {
               transform: 'translateY(100%)',
             },
             to: {
               transform: 'translateY(0)',
             },
           },
           '@keyframes slideDown': {
             from: {
               transform: 'translateY(0)',
             },
             to: {
               transform: 'translateY(100%)',
             },
           },
         }}
       >
         <DialogTitle sx={{ 
           background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
           color: 'white',
           fontWeight: 600,
           textAlign: 'center'
         }}>
           {t('editRecord')}
         </DialogTitle>
         <DialogContent>
           <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <TextField
               fullWidth
               label={t('itemName')}
               value={editFormData.name || ''}
               onChange={(e) => handleFormChange('name', e.target.value)}
             />
             <TextField
               fullWidth
               label={t('purchasePrice')}
               type="number"
               value={editFormData.purchase_price || ''}
               onChange={(e) => handleFormChange('purchase_price', e.target.value)}
             />
             <TextField
               fullWidth
               label={t('targetDailyCost')}
               type="number"
               value={editFormData.target || ''}
               onChange={(e) => handleFormChange('target', e.target.value)}
             />
             <TextField
                fullWidth
                label={t('purchaseDate')}
                type="date"
                value={editFormData.purchase_date || ''}
                onChange={(e) => handleFormChange('purchase_date', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />

           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleEditClose}>{t('cancel')}</Button>
           <Button 
             onClick={handleEditSave} 
             variant="contained"
             disabled={saving}
           >
             {saving ? t('saving') : t('save')}
           </Button>
         </DialogActions>
       </Dialog>

       {/* 通知 */}
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
    </Box>
  );
};

export default History;
