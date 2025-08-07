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
} from '@mui/material';

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

  useEffect(() => {
    if (!user) return;
    
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

  const getPerformanceIcon = (actual, target) => {
    const ratio = actual / target;
    if (ratio <= 1) return '🎉';
    if (ratio <= 1.5) return '⚠️';
    return '❌';
  };

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
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                  py: 2,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  whiteSpace: 'nowrap'
                } 
              }}>
                {headCells.map((headCell, index) => {
                  const widths = ['30%', '18%', '18%', '18%'];
                  return (
                    <TableCell
                      key={headCell.id}
                      align={headCell.numeric ? 'right' : 'left'}
                      sortDirection={orderBy === headCell.id ? order : false}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.3) !important'
                        },
                        width: widths[index]
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            color: 'primary.main !important'
                          }
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  width: '16%'
                }}>
                  性能表现
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
                      sx={{
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
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        color: 'primary.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '30%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        color: 'warning.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '18%'
                      }}>
                        ¥{target.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        color: performanceColor,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '18%'
                      }}>
                        ¥{actual.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                        color: 'success.main',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        width: '18%'
                      }}>
                        {row.service_duration} 天
                      </TableCell>
                      <TableCell align="center" sx={{ width: '16%' }}>
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
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                          }}>
                            {((actual / target) * 100).toFixed(0)}%
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
    </Box>
  );
};

export default History;
