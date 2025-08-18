import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Settings as SettingsIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon
} from '@mui/icons-material';
import aiClassificationService from '../services/aiClassificationService';
import { fetchGeminiModels } from '../services/geminiApiService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const ModelSpeedTest = () => {
  const { user } = useAuth();
  const [itemName, setItemName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState(['gemini-2.5-flash-lite']);
  const [apiKey, setApiKey] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const abortControllerRef = useRef(null);

  // 测试项目示例
  const sampleItems = [
    '苹果', '笔记本电脑', '牛奶', '洗发水', '手机充电器',
    '面包', '运动鞋', '咖啡', '书籍', '耳机'
  ];

  // 获取API密钥和模型列表
  useEffect(() => {
    const loadApiConfig = async () => {
      if (!user?.id) return;
      
      try {
        // 获取用户的API配置
        const { data, error } = await supabase
          .from('api_configs')
          .select('*')
          .eq('user_id', user.id)
          .eq('api_name', 'gemini')
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading API config:', error);
          return;
        }

        if (data && data.api_key) {
          // 解密API密钥
          const { data: decryptedData, error: decryptError } = await supabase
            .rpc('decrypt_api_key', { encrypted_key: data.api_key });
          
          if (decryptError) {
            console.error('Error decrypting API key:', decryptError);
            return;
          }
          
          setApiKey(decryptedData);
          setTempApiKey(decryptedData);
          await loadModels(decryptedData);
          console.log('API配置加载成功');
        }
      } catch (error) {
        console.error('加载API配置失败:', error);
      }
    };

    loadApiConfig();
  }, [user?.id]);

  // 保存API配置到Supabase
  const saveApiConfig = async () => {
    if (!user || !tempApiKey.trim()) {
      setNotification({ open: true, message: 'API密钥不能为空', severity: 'error' });
      return;
    }

    try {
      setSavingConfig(true);
      
      // 加密API密钥
      const { data: encryptedData, error: encryptError } = await supabase
        .rpc('encrypt_api_key', { api_key: tempApiKey });
      
      if (encryptError) {
        console.error('Error encrypting API key:', encryptError);
        setNotification({ open: true, message: '加密API密钥失败', severity: 'error' });
        return;
      }

      // 检查是否已存在配置
      const { data: existingConfig } = await supabase
        .from('api_configs')
        .select('id')
        .eq('user_id', user.id)
        .eq('api_name', 'gemini')
        .single();

      let result;
      if (existingConfig) {
        // 更新现有配置
        result = await supabase
          .from('api_configs')
          .update({
            api_key: encryptedData,
            model_name: 'gemini-2.0-flash-exp',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);
      } else {
        // 创建新配置
        result = await supabase
          .from('api_configs')
          .insert({
            user_id: user.id,
            api_name: 'gemini',
            api_key: encryptedData,
            model_name: 'gemini-2.0-flash-exp',
            is_active: true
          });
      }

      if (result.error) {
        console.error('Error saving API config:', result.error);
        setNotification({ open: true, message: '保存API配置失败', severity: 'error' });
        return;
      }

      setApiKey(tempApiKey);
      setConfigDialogOpen(false);
      setNotification({ open: true, message: 'API配置保存成功', severity: 'success' });
      
      // 重新加载模型
      await loadModels(tempApiKey);
    } catch (error) {
      console.error('Error in saveApiConfig:', error);
      setNotification({ open: true, message: '保存API配置时发生错误', severity: 'error' });
    } finally {
      setSavingConfig(false);
    }
  };

  // 加载可用模型
  const loadModels = async (key) => {
    console.log('开始加载模型，API密钥长度:', key ? key.length : 0);
    setLoadingModels(true);
    try {
      const models = await fetchGeminiModels(key);
      console.log('成功获取模型列表:', models);
      setAvailableModels(models);
      // 默认选择前3个模型进行对比
      if (models.length > 0) {
        const defaultSelected = models.slice(0, Math.min(3, models.length)).map(m => m.name);
        console.log('默认选择的模型:', defaultSelected);
        setSelectedModels(defaultSelected);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      // 使用默认模型
      const defaultModels = [
        { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash (实验版)' },
        { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
        { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' }
      ];
      console.log('使用默认模型列表:', defaultModels);
      setAvailableModels(defaultModels);
      setSelectedModels([defaultModels[0].name]); // 默认选择第一个模型
    } finally {
      setLoadingModels(false);
    }
  };

  // 使用指定模型进行AI分类
  const classifyWithSpecificModel = async (itemName, modelName) => {
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 获取分类列表
    const categories = await aiClassificationService.getCategories();
    if (categories.length === 0) {
      throw new Error('分类列表为空');
    }

    // 构建分类选项字符串
    const categoryOptions = categories.map(cat => 
      `${cat.id}: ${cat.name} (${cat.description})`
    ).join('\n');

    // 构建提示词
    const prompt = `请根据物品名称"${itemName}"，从以下分类中选择最合适的一个：

${categoryOptions}

请返回JSON格式的结果，包含以下字段：
- category_id: 选择的分类ID（数字）
- confidence: 置信度（0-1之间的小数）
- reasoning: 选择理由（简短说明）

只返回JSON，不要其他文字。`;

    // 调用Gemini API
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('API响应格式异常');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = responseText.match(/\{[^}]*\}/);
      if (!jsonMatch) {
        throw new Error('响应中未找到JSON格式数据');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      // 验证分类ID
      const selectedCategory = categories.find(cat => cat.id === result.category_id);
      if (!selectedCategory) {
        throw new Error(`无效的分类ID: ${result.category_id}`);
      }

      return {
        success: true,
        confidence: result.confidence || 0,
        suggestedCategory: selectedCategory,
        reasoning: result.reasoning,
        model: modelName
      };
    } catch (parseError) {
      throw new Error(`解析AI响应失败: ${parseError.message}`);
    }
  };

  // 开始单个测试
  const startSingleTest = async (testItemName) => {
    if (!user?.id) {
      alert('请先登录');
      return;
    }

    if (selectedModels.length === 0) {
      alert('请至少选择一个模型进行测试');
      return;
    }

    const startTime = Date.now();
    setCurrentTest({
      itemName: testItemName,
      startTime,
      status: 'running'
    });

    try {
      const modelResults = {};
      
      // 测试每个选中的模型
      for (const modelName of selectedModels) {
        const modelStartTime = Date.now();
        try {
          const result = await classifyWithSpecificModel(testItemName, modelName);
          const modelEndTime = Date.now();
          modelResults[modelName] = {
            duration: modelEndTime - modelStartTime,
            success: result.success,
            confidence: result.confidence,
            category: result.suggestedCategory,
            reasoning: result.reasoning
          };
        } catch (error) {
          const modelEndTime = Date.now();
          modelResults[modelName] = {
            duration: modelEndTime - modelStartTime,
            success: false,
            confidence: 0,
            category: null,
            error: error.message
          };
        }
      }

      // 测试关键词分类
      const keywordStartTime = Date.now();
      const keywordResult = await aiClassificationService.classifyByKeywords(testItemName, user.id);
      const keywordEndTime = Date.now();
      const keywordDuration = keywordEndTime - keywordStartTime;

      const result = {
        id: Date.now(),
        itemName: testItemName,
        timestamp: new Date().toLocaleString(),
        modelResults,
        keywordMethod: {
          duration: keywordDuration,
          success: keywordResult.success,
          confidence: keywordResult.confidence || 0,
          category: keywordResult.suggestedCategory,
          matchedKeyword: keywordResult.matchedKeyword
        }
      };

      setTestResults(prev => [result, ...prev]);
      setCurrentTest(null);

    } catch (error) {
      console.error('测试出错:', error);
      setCurrentTest({
        itemName: testItemName,
        status: 'error',
        error: error.message
      });
    }
  };

  // 批量测试
  const startBatchTest = async () => {
    if (!user?.id) {
      alert('请先登录');
      return;
    }

    if (selectedModels.length === 0) {
      alert('请至少选择一个模型进行测试');
      return;
    }

    setIsRunning(true);
    abortControllerRef.current = new AbortController();
    
    try {
      for (const item of sampleItems) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        await startSingleTest(item);
        // 添加小延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('批量测试出错:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  // 停止测试
  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setCurrentTest(null);
  };

  // 清除结果
  const clearResults = () => {
    setTestResults([]);
  };

  // 处理模型选择
  const handleModelSelection = (modelName) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(m => m !== modelName);
      } else {
        return [...prev, modelName];
      }
    });
  };

  // 选择所有模型
  const selectAllModels = () => {
    setSelectedModels(availableModels.map(m => m.name));
  };

  // 清除所有模型选择
  const clearAllModels = () => {
    setSelectedModels([]);
  };

  // 获取方法状态颜色
  const getMethodStatusColor = (method) => {
    if (!method.success) return 'error';
    if (method.confidence >= 0.8) return 'success';
    if (method.confidence >= 0.5) return 'warning';
    return 'default';
  };

  // 格式化持续时间
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SpeedIcon />
        AI模型速度测试
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        测试不同分类方法对物品分类的响应速度和准确性
      </Typography>

      {/* 控制面板 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* 物品输入 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="物品名称"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="输入要测试的物品名称"
                disabled={isRunning}
              />
            </Grid>
            
            {/* 操作按钮 */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={() => startSingleTest(itemName)}
                  disabled={!itemName.trim() || isRunning || currentTest || selectedModels.length === 0}
                >
                  单项测试
                </Button>
                <Button
                  variant="outlined"
                  startIcon={isRunning ? <StopIcon /> : <PlayIcon />}
                  onClick={isRunning ? stopTest : startBatchTest}
                  color={isRunning ? 'error' : 'primary'}
                  disabled={selectedModels.length === 0}
                >
                  {isRunning ? '停止' : '批量测试'}
                </Button>
                <Button
                  variant="text"
                  startIcon={<RefreshIcon />}
                  onClick={clearResults}
                  disabled={isRunning}
                >
                  清除结果
                </Button>
              </Box>
            </Grid>
            
            {/* 模型选择 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  选择要测试的AI模型 ({selectedModels.length} 个已选择):
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SettingsIcon />}
                  onClick={() => {
                    setTempApiKey(apiKey || '');
                    setConfigDialogOpen(true);
                  }}
                >
                  API配置
                </Button>
              </Box>
              
              {!apiKey ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  请点击右上角的"API配置"按钮设置Gemini API密钥以加载可用模型。
                </Alert>
              ) : loadingModels ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">正在加载模型列表...</Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={selectAllModels} disabled={isRunning}>
                      全选
                    </Button>
                    <Button size="small" onClick={clearAllModels} disabled={isRunning}>
                      清除
                    </Button>
                  </Box>
                  
                  <FormGroup row>
                    {availableModels.map((model) => (
                      <FormControlLabel
                        key={model.name}
                        control={
                          <Checkbox
                            checked={selectedModels.includes(model.name)}
                            onChange={() => handleModelSelection(model.name)}
                            disabled={isRunning}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {model.displayName || model.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {model.name}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                  
                  {selectedModels.length === 0 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      请至少选择一个模型进行测试
                    </Alert>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>

          {/* 示例物品 */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              示例物品（点击快速测试）：
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {sampleItems.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onClick={() => setItemName(item)}
                  variant="outlined"
                  size="small"
                  disabled={isRunning}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 当前测试状态 */}
      {currentTest && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>
              正在测试: {currentTest.itemName}
              {currentTest.status === 'running' && (
                <span> - 已运行 {Math.round((Date.now() - currentTest.startTime) / 1000)}s</span>
              )}
            </Typography>
            {currentTest.status === 'running' && <LinearProgress sx={{ width: 100 }} />}
          </Box>
          {currentTest.error && (
            <Typography color="error" variant="body2">
              错误: {currentTest.error}
            </Typography>
          )}
        </Alert>
      )}

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              测试结果 ({testResults.length} 项)
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>物品</TableCell>
                    <TableCell>关键词分类</TableCell>
                    {/* 动态生成AI模型列 */}
                    {availableModels
                      .filter(model => selectedModels.includes(model.name))
                      .map(model => (
                        <TableCell key={model.name} align="center">
                          {model.displayName || model.name}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {result.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.timestamp}
                        </Typography>
                      </TableCell>
                      
                      {/* 关键词分类结果 */}
                      <TableCell align="center">
                        <Box>
                          <Chip
                            size="small"
                            label={result.keywordMethod.success ? `${(result.keywordMethod.confidence * 100).toFixed(0)}%` : '失败'}
                            color={getMethodStatusColor(result.keywordMethod)}
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {formatDuration(result.keywordMethod.duration)}
                          </Typography>
                          {result.keywordMethod.matchedKeyword && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              匹配: {result.keywordMethod.matchedKeyword}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      {/* AI模型结果 */}
                      {availableModels
                        .filter(model => selectedModels.includes(model.name))
                        .map(model => {
                          const modelResult = result.modelResults?.[model.name];
                          if (!modelResult) {
                            return (
                              <TableCell key={model.name} align="center">
                                <Chip size="small" label="未测试" color="default" />
                              </TableCell>
                            );
                          }
                          
                          return (
                            <TableCell key={model.name} align="center">
                              <Box>
                                <Chip
                                  size="small"
                                  label={modelResult.success ? `${(modelResult.confidence * 100).toFixed(0)}%` : '失败'}
                                  color={getMethodStatusColor(modelResult)}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  {formatDuration(modelResult.duration)}
                                </Typography>
                                {modelResult.category && (
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {modelResult.category.name}
                                  </Typography>
                                )}
                                {modelResult.error && (
                                  <Typography variant="caption" display="block" color="error">
                                    {modelResult.error}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          );
                        })
                      }
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* API配置对话框 */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>API配置</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Gemini API密钥"
            type={showApiKey ? 'text' : 'password'}
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="输入您的Gemini API密钥"
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>取消</Button>
          <Button
            onClick={saveApiConfig}
            variant="contained"
            startIcon={savingConfig ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={savingConfig || !tempApiKey.trim()}
          >
            {savingConfig ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModelSpeedTest;