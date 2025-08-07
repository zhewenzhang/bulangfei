import React, { useState } from 'react';
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
  Paper
} from '@mui/material';

// This is a placeholder for where you would eventually save the data.
// For now, it just logs to the console.
const saveRecord = (record) => {
  console.log("Record to be saved:", record);
  // Placeholder for SQL database interface call
  // e.g., await api.saveCalculation(record);
};


const Calculator = () => {
  const [formState, setFormState] = useState({
    name: '',
    purchasePrice: '',
    targetDailyCost: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Defaults to today
    status: 'In Use',
    soldPrice: '',
  });

  const [results, setResults] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCalculate = () => {
    const { name, purchasePrice, targetDailyCost, purchaseDate, status, soldPrice } = formState;

    const price = parseFloat(purchasePrice);
    const target = parseFloat(targetDailyCost);
    const sold = status === 'Sold' ? parseFloat(soldPrice) || 0 : 0;

    if (isNaN(price) || isNaN(target) || !purchaseDate) {
        alert("Please fill in all required fields with valid numbers.");
        return;
    }

    const pDate = new Date(purchaseDate);
    const today = new Date();
    const timeDiff = today.getTime() - pDate.getTime();
    const daysInService = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24))); // Ensure at least 1 day

    const totalCost = price - sold;
    const actualDailyCost = totalCost / daysInService;

    let daysToMeetTarget = 'N/A';
    if (actualDailyCost > target) {
        // How many more days of usage are needed to bring the average down to the target
        const requiredTotalDays = totalCost / target;
        daysToMeetTarget = Math.ceil(requiredTotalDays - daysInService);
    } else {
        daysToMeetTarget = 0; // Already met the target
    }

    const calculatedResults = {
      name,
      daysInService,
      actualDailyCost: actualDailyCost.toFixed(2),
      targetDailyCost: target.toFixed(2),
      overUnder: (actualDailyCost - target).toFixed(2),
      daysToMeetTarget,
    };

    setResults(calculatedResults);

    // Also prepare a record for saving
    const recordToSave = {
        name,
        target: target.toFixed(2),
        actual: actualDailyCost.toFixed(2),
        serviceDuration: daysInService,
    };
    saveRecord(recordToSave);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        残值计算器 (Residual Value Calculator)
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="名称 (Name)"
            name="name"
            value={formState.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="入手价格 (Purchase Price)"
            name="purchasePrice"
            value={formState.purchasePrice}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="目标日耗 (Target Daily Cost)"
            name="targetDailyCost"
            value={formState.targetDailyCost}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
           <TextField
            fullWidth
            label="入手日期 (Purchase Date)"
            type="date"
            name="purchaseDate"
            value={formState.purchaseDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>状态 (Status)</InputLabel>
            <Select
              name="status"
              value={formState.status}
              onChange={handleChange}
              label="状态 (Status)"
            >
              <MenuItem value="In Use">使用中 (In Use)</MenuItem>
              <MenuItem value="Discontinued">停用 (Discontinued)</MenuItem>
              <MenuItem value="Sold">二手回血 (Sold)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {formState.status === 'Sold' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="回血价格 (Sold Price)"
              name="soldPrice"
              value={formState.soldPrice}
              onChange={handleChange}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button fullWidth variant="contained" size="large" onClick={handleCalculate}>
            计算 (Calculate)
          </Button>
        </Grid>
      </Grid>

      {results && (
        <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
          <Typography variant="h5" gutterBottom>计算结果 (Results)</Typography>
          <Typography><b>{results.name}</b></Typography>
          <Typography>已服役 (Days in Service): {results.daysInService} 天 (days)</Typography>
          <Typography>实际日耗 (Actual Daily Cost): ¥{results.actualDailyCost}</Typography>
          <Typography>目标日耗 (Target Daily Cost): ¥{results.targetDailyCost}</Typography>
          <Typography>
            {results.overUnder > 0
              ? `超出目标 (Over Target): ¥${results.overUnder}`
              : `低于目标 (Under Target): ¥${Math.abs(results.overUnder)}`}
          </Typography>
          <Typography>
            {results.daysToMeetTarget > 0
              ? `还需要 (Days to meet target): ${results.daysToMeetTarget} 天 (days)`
              : "已达成目标 (Target Achieved)"}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Calculator;
