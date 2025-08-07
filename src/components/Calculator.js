import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
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
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

const Calculator = () => {
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
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleCalculate = async () => {
    setLoading(true);
    const { name, purchasePrice, targetDailyCost, purchaseDate, status, soldPrice } = formState;
    const price = parseFloat(purchasePrice);
    const target = parseFloat(targetDailyCost);
    const sold = status === 'Sold' ? parseFloat(soldPrice) || 0 : 0;

    if (isNaN(price) || isNaN(target) || !purchaseDate) {
      setNotification({ open: true, message: 'Please fill in all required fields with valid numbers.', severity: 'error' });
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

    const recordToSave = { name, target: target.toFixed(2), actual: actualDailyCost.toFixed(2), service_duration: daysInService };

    const { error } = await supabase.from('calculations').insert([recordToSave]);

    if (error) {
      console.error('Error inserting data:', error);
      setNotification({ open: true, message: `Error saving data: ${error.message}`, severity: 'error' });
    } else {
      setNotification({ open: true, message: 'Calculation saved successfully!', severity: 'success' });
    }
    setLoading(false);
  };

  return (
    <Box>
      <Card>
        <CardHeader title="残值计算器" subheader="Residual Value Calculator" />
        <CardContent>
          <Grid container spacing={3}>
            {/* Form fields remain the same */}
            <Grid item xs={12}><TextField fullWidth variant="filled" label="名称 (Name)" name="name" value={formState.name} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth type="number" variant="filled" label="入手价格 (Purchase Price)" name="purchasePrice" value={formState.purchasePrice} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth type="number" variant="filled" label="目标日耗 (Target Daily Cost)" name="targetDailyCost" value={formState.targetDailyCost} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="入手日期 (Purchase Date)" type="date" name="purchaseDate" variant="filled" value={formState.purchaseDate} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="filled">
                <InputLabel>状态 (Status)</InputLabel>
                <Select name="status" value={formState.status} onChange={handleChange} label="状态 (Status)">
                  <MenuItem value="In Use">使用中 (In Use)</MenuItem>
                  <MenuItem value="Discontinued">停用 (Discontinued)</MenuItem>
                  <MenuItem value="Sold">二手回血 (Sold)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formState.status === 'Sold' && <Grid item xs={12}><TextField fullWidth type="number" variant="filled" label="回血价格 (Sold Price)" name="soldPrice" value={formState.soldPrice} onChange={handleChange} /></Grid>}
            <Grid item xs={12}>
              <Button fullWidth variant="contained" color="primary" size="large" onClick={handleCalculate} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : '计算并保存 (Calculate & Save)'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grow in={results !== null}><Card sx={{ mt: 3 }}>
        <CardHeader title="计算结果 (Results)" />
        <CardContent>
          {results && (
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography variant="h5" component="div">{results.name}</Typography></Grid>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={6}><Typography>已服役 (Days in Service):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">{results.daysInService} 天</Typography></Grid>
              <Grid item xs={6}><Typography>实际日耗 (Actual Daily):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">¥{results.actualDailyCost}</Typography></Grid>
              <Grid item xs={6}><Typography>目标日耗 (Target Daily):</Typography></Grid>
              <Grid item xs={6}><Typography align="right">¥{results.targetDailyCost}</Typography></Grid>
              <Grid item xs={6}><Typography>超出目标 (Over Target):</Typography></Grid>
              <Grid item xs={6}><Typography align="right" color={results.overUnder > 0 ? 'error' : 'success.main'}>¥{results.overUnder}</Typography></Grid>
              <Grid item xs={12}><Divider /></Grid>
              <Grid item xs={12}><Typography align="center" variant="subtitle1">{results.daysToMeetTarget > 0 ? `还需要 ${results.daysToMeetTarget} 天可达成目标` : "已达成目标!"}</Typography></Grid>
            </Grid>
          )}
        </CardContent>
      </Card></Grow>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calculator;
