import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
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
  Grid,
  Paper,
} from '@mui/material';
import Auth from './Auth';

async function fetchRecords(userId) {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching data:', error);
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

const headCells = [
  { id: 'name', numeric: false, label: '物品名称' },
  { id: 'target', numeric: true, label: '目标日耗' },
  { id: 'actual', numeric: true, label: '实际日耗' },
  { id: 'service_duration', numeric: true, label: '服役天数' },
];

const History = () => {
  const { user } = useAuth();
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('service_duration');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDetailDialogOpen(true);
  };

  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedRow(null);
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
              计算历史
            </Typography>
          }
          subheader={
            <Typography variant="subtitle1" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              fontSize: '1rem',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              历史计算记录 ({rows.length} 条记录)
            </Typography>
          }
        />
        
        {/* 统计指标卡片 */}
        {rows.length > 0 && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'success.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1
                  }}>
                    累计消费
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: 'success.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    ¥{rows.reduce((sum, row) => sum + (Number(row.actual) * Number(row.service_duration)), 0).toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1
                  }}>
                    已达成数量
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {rows.filter(row => Number(row.actual) <= Number(row.target)).length} / {rows.length}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 2
                }}>
                  <Typography variant="h6" sx={{ 
                    color: 'warning.main',
                    fontWeight: 600,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    mb: 1
                  }}>
                    预计达成
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: 'warning.main',
                    fontWeight: 700,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {(() => {
                      const unachievedItems = rows.filter(row => Number(row.actual) > Number(row.target));
                      if (unachievedItems.length === 0) return '全部达成';
                      const avgDaysNeeded = unachievedItems.reduce((sum, row) => {
                        const ratio = Number(row.actual) / Number(row.target);
                        return sum + Math.ceil((ratio - 1) * Number(row.service_duration));
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
                  const widths = ['20%', '22%', '22%', '20%'];
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
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
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
                          alignItems: 'center'
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  width: '16%',
                  padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                }}>
                  是否达成
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>加载中...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="error.main" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>加载失败</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{error}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : !user ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" color="primary.main" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif', mb: 2 }}>请先登录账户</Typography>
                      <Typography color="text.secondary" sx={{ fontFamily: 'system-ui, -apple-system, sans-serif', mb: 3 }}>登录后即可查看购物分析记录</Typography>
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
                        立即登录
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 6 }}>
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
                          background: 'rgba(99, 102, 241, 0.1)',
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease'
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
                        width: '20%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
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
                        width: '22%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                      }}>
                        ¥{target.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: performanceColor,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '22%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                      }}>
                        ¥{actual.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        color: 'success.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '20%',
                        padding: { xs: '8px 4px', sm: '12px 8px', md: '16px 12px' }
                      }}>
                        {row.service_duration} 天
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        width: '16%',
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
                                return '已达成';
                              } else {
                                // 计算还需要多少天才能达成目标
                                const daysNeeded = Math.ceil((actual - target) / target * row.service_duration);
                                return `${daysNeeded}天后达成`;
                              }
                            })()}
                          </Typography>
                        </Box>
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
             animation: 'slideUp 0.3s ease-out',
             '@keyframes slideUp': {
               from: {
                 transform: 'translateY(100%)',
                 opacity: 0,
               },
               to: {
                 transform: 'translateY(0)',
                 opacity: 1,
               },
             },
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
             background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.05))',
             backdropFilter: 'blur(20px)',
             boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
             border: '1px solid rgba(99, 102, 241, 0.2)',
             animation: 'slideUp 0.3s ease-out',
             '@keyframes slideUp': {
               from: {
                 transform: 'translateY(100%)',
                 opacity: 0,
               },
               to: {
                 transform: 'translateY(0)',
                 opacity: 1,
               },
             },
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
                   物品详情信息
                 </Typography>
               </Box>
               
               {/* 详情信息网格 */}
               <Grid container spacing={3}>
                 <Grid item xs={12} sm={6}>
                   <Paper sx={{
                     p: 3,
                     background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                     border: '1px solid rgba(34, 197, 94, 0.2)',
                     borderRadius: 2
                   }}>
                     <Typography variant="h6" sx={{
                       color: 'success.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       目标日耗
                     </Typography>
                     <Typography variant="h4" sx={{
                       color: 'success.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       ¥{Number(selectedRow.target).toFixed(2)}
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 <Grid item xs={12} sm={6}>
                   <Paper sx={{
                     p: 3,
                     background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
                     border: '1px solid rgba(59, 130, 246, 0.2)',
                     borderRadius: 2
                   }}>
                     <Typography variant="h6" sx={{
                       color: 'primary.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       实际日耗
                     </Typography>
                     <Typography variant="h4" sx={{
                       color: 'primary.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       ¥{Number(selectedRow.actual).toFixed(2)}
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 <Grid item xs={12} sm={6}>
                   <Paper sx={{
                     p: 3,
                     background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                     border: '1px solid rgba(245, 158, 11, 0.2)',
                     borderRadius: 2
                   }}>
                     <Typography variant="h6" sx={{
                       color: 'warning.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       购买时间
                     </Typography>
                     <Typography variant="h5" sx={{
                       color: 'warning.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {new Date(selectedRow.created_at).toLocaleDateString('zh-CN', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric'
                       })}
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 <Grid item xs={12} sm={6}>
                   <Paper sx={{
                     p: 3,
                     background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))',
                     border: '1px solid rgba(168, 85, 247, 0.2)',
                     borderRadius: 2
                   }}>
                     <Typography variant="h6" sx={{
                       color: '#a855f7',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       服役天数
                     </Typography>
                     <Typography variant="h4" sx={{
                       color: '#a855f7',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {selectedRow.service_duration} 天
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 累计消费 */}
                 <Grid item xs={12}>
                   <Paper sx={{
                     p: 3,
                     background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                     border: '1px solid rgba(239, 68, 68, 0.2)',
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="h6" sx={{
                       color: 'error.main',
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       累计消费金额
                     </Typography>
                     <Typography variant="h3" sx={{
                       color: 'error.main',
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       ¥{(Number(selectedRow.actual) * Number(selectedRow.service_duration)).toFixed(2)}
                     </Typography>
                   </Paper>
                 </Grid>
                 
                 {/* 达成状态 */}
                 <Grid item xs={12}>
                   <Paper sx={{
                     p: 3,
                     background: (() => {
                       const ratio = Number(selectedRow.actual) / Number(selectedRow.target);
                       if (ratio <= 1) return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))';
                       if (ratio <= 1.5) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))';
                       return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
                     })(),
                     border: (() => {
                       const ratio = Number(selectedRow.actual) / Number(selectedRow.target);
                       if (ratio <= 1) return '1px solid rgba(34, 197, 94, 0.2)';
                       if (ratio <= 1.5) return '1px solid rgba(245, 158, 11, 0.2)';
                       return '1px solid rgba(239, 68, 68, 0.2)';
                     })(),
                     borderRadius: 2,
                     textAlign: 'center'
                   }}>
                     <Typography variant="h6" sx={{
                       color: (() => {
                         const ratio = Number(selectedRow.actual) / Number(selectedRow.target);
                         if (ratio <= 1) return 'success.main';
                         if (ratio <= 1.5) return 'warning.main';
                         return 'error.main';
                       })(),
                       fontWeight: 600,
                       fontFamily: 'system-ui, -apple-system, sans-serif',
                       mb: 1
                     }}>
                       目标达成状态
                     </Typography>
                     <Typography variant="h4" sx={{
                       color: (() => {
                         const ratio = Number(selectedRow.actual) / Number(selectedRow.target);
                         if (ratio <= 1) return 'success.main';
                         if (ratio <= 1.5) return 'warning.main';
                         return 'error.main';
                       })(),
                       fontWeight: 700,
                       fontFamily: 'system-ui, -apple-system, sans-serif'
                     }}>
                       {(() => {
                         const ratio = Number(selectedRow.actual) / Number(selectedRow.target);
                         if (ratio <= 1) {
                           return '已达成';
                         } else {
                           const daysNeeded = Math.ceil((ratio - 1) * Number(selectedRow.service_duration));
                           return `${daysNeeded}天后达成`;
                         }
                       })()}
                     </Typography>
                   </Paper>
                 </Grid>
               </Grid>
               
               {/* 关闭按钮 */}
               <Box sx={{ textAlign: 'center', mt: 4 }}>
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
                   关闭详情
                 </Button>
               </Box>
             </Box>
           )}
         </DialogContent>
       </Dialog>
    </Box>
  );
};

export default History;
