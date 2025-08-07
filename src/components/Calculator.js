import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import AuthComponent from './Auth';
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
  Grow,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const Calculator = () => {
  const { user } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    purchasePrice: '',
    targetDailyCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'In Use',
    soldPrice: '',
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const resultsRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
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

    const calculatedResults = { name, daysInService, actualDailyCost: actualDailyCost.toFixed(2), targetDailyCost: target.toFixed(2), overUnder: (actualDailyCost - target).toFixed(2), daysToMeetTarget };
    setResults(calculatedResults);
    setLoading(false);
    
    // 自动滚动到结果区域
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
    const recordToSave = { 
      name: results.name, 
      target: results.targetDailyCost, 
      actual: results.actualDailyCost, 
      service_duration: results.daysInService,
      user_id: user.id
    };

    const { error } = await supabase.from('calculations').insert([recordToSave]);

    if (error) {
      console.error('Error inserting data:', error);
      setNotification({ open: true, message: `保存数据时出错: ${error.message}`, severity: 'error' });
    } else {
      setNotification({ open: true, message: '计算结果保存成功！', severity: 'success' });
    }
    setSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Typography variant="h4" component="h1" sx={{ 
              textAlign: 'center',
              background: 'linear-gradient(45deg, #6366f1, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1
            }}>
              用的明明白白
            </Typography>
          }
          subheader={
            <Typography variant="subtitle1" sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              fontSize: '1.1rem'
            }}>
              物品残值管理
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
                label="物品名称" 
                name="name" 
                value={formState.name} 
                onChange={handleChange}
                sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="number" 
                variant="filled" 
                label="¥入手价格" 
                name="purchasePrice" 
                value={formState.purchasePrice} 
                onChange={handleChange}
                sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                type="number" 
                variant="filled" 
                label="¥目标日耗" 
                name="targetDailyCost" 
                value={formState.targetDailyCost} 
                onChange={handleChange}
                sx={{ '& .MuiInputLabel-root': { fontSize: '1.1rem' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="入手日期" 
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
                <InputLabel sx={{ fontSize: '1.1rem' }}>物品状态</InputLabel>
                <Select name="status" value={formState.status} onChange={handleChange} label="物品状态">
                  <MenuItem value="In Use">使用中</MenuItem>
                  <MenuItem value="Discontinued">已停用</MenuItem>
                  <MenuItem value="Sold">已出售</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formState.status === 'Sold' && (
              <Grid item xs={12}>
                <Grow in={formState.status === 'Sold'}>
                  <TextField 
                    fullWidth 
                    type="number" 
                    variant="filled" 
                    label="¥出售价格" 
                    name="soldPrice" 
                    value={formState.soldPrice} 
                    onChange={handleChange}
                  />
                </Grow>
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
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} color="inherit" />
                    <Typography>计算中...</Typography>
                  </Box>
                ) : (
                  '计算'
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grow in={results !== null}>
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
                计算结果
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
                      <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>已服役</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {results.daysInService}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">天</Typography>
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
                      <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>实际日耗</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ¥{results.actualDailyCost}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">每日成本</Typography>
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
                      <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>目标日耗</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        ¥{results.targetDailyCost}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">目标成本</Typography>
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
                        {results.overUnder > 0 ? '超出目标' : '低于目标'}
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 700, 
                        color: results.overUnder > 0 ? 'error.main' : 'success.main'
                      }}>
                        {results.overUnder > 0 ? '+' : ''}¥{results.overUnder}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">与目标差额</Typography>
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
                      `还需要 ${results.daysToMeetTarget} 天可达成目标` : 
                      "已达成目标!"
                    }
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {results.daysToMeetTarget > 0 ? 
                      '继续使用以降低日均成本' : 
                      '恭喜！您的使用效率很高'
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
                      '&:hover': {
                        background: 'linear-gradient(45deg, #db2777, #7c3aed)',
                      }
                    }}
                  >
                    {saving ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={24} color="inherit" />
                        <Typography>保存中...</Typography>
                      </Box>
                    ) : (
                      '保存并分析'
                    )}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grow>

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
