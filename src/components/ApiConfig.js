import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchGeminiModels, testGeminiConnection } from '../services/geminiApiService';

const ApiConfig = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [apiConfigs, setApiConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    api_name: 'gemini',
    api_key: '',
    model_name: 'gemini-2.5-flash-lite',
    is_active: true
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [testing, setTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const texts = {
    zh: {
      title: 'API 配置管理',
      description: '配置AI分类服务的API密钥，用于自动物品分类功能',
      apiName: 'API 名称',
      apiKey: 'API 密钥',
      isActive: '启用状态',
      addNew: '添加新配置',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      showKey: '显示密钥',
      hideKey: '隐藏密钥',
      usageCount: '使用次数',
      lastUsed: '最后使用',
      never: '从未使用',
      deleteConfirm: '确定要删除这个API配置吗？',
      saveSuccess: 'API配置保存成功',
      deleteSuccess: 'API配置删除成功',
      loadError: '加载API配置失败',
      saveError: '保存API配置失败',
      deleteError: '删除API配置失败',
      keyRequired: 'API密钥不能为空',
      modelName: '模型名称',
      loadModels: '加载模型列表',
      loadingModels: '正在加载模型...',
      loadModelsError: '加载模型列表失败',
      noModelsFound: '未找到可用模型',
      geminiInfo: 'Google Gemini API - 用于智能物品分类',
      securityNote: 'API密钥将加密存储在数据库中，仅您可以访问'
    },
    en: {
      title: 'API Configuration',
      description: 'Configure API keys for AI classification services',
      apiName: 'API Name',
      apiKey: 'API Key',
      isActive: 'Active Status',
      addNew: 'Add New Config',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      showKey: 'Show Key',
      hideKey: 'Hide Key',
      usageCount: 'Usage Count',
      lastUsed: 'Last Used',
      never: 'Never Used',
      deleteConfirm: 'Are you sure you want to delete this API configuration?',
      saveSuccess: 'API configuration saved successfully',
      deleteSuccess: 'API configuration deleted successfully',
      loadError: 'Failed to load API configurations',
      saveError: 'Failed to save API configuration',
      deleteError: 'Failed to delete API configuration',
      keyRequired: 'API key is required',
      modelName: 'Model Name',
      loadModels: 'Load Models',
      loadingModels: 'Loading models...',
      loadModelsError: 'Failed to load models',
      noModelsFound: 'No models found',
      geminiInfo: 'Google Gemini API - For intelligent item classification',
      securityNote: 'API keys are encrypted and stored securely in the database'
    }
  };

  const t = texts[language] || texts.zh;

  useEffect(() => {
    if (user) {
      fetchApiConfigs();
    }
  }, [user]);

  const fetchApiConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiConfigs(data || []);
    } catch (error) {
      console.error('Error fetching API configs:', error);
      setNotification({ open: true, message: t.loadError, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModels = async (apiKey) => {
    if (!apiKey || !apiKey.trim()) {
      setNotification({ open: true, message: t.keyRequired, severity: 'error' });
      return;
    }

    try {
      setLoadingModels(true);
      const supportedModels = await fetchGeminiModels(apiKey);
      
      setAvailableModels(supportedModels);
      
      if (supportedModels.length === 0) {
        setNotification({ open: true, message: t.noModelsFound, severity: 'warning' });
      } else {
        setNotification({ 
          open: true, 
          message: `成功加载 ${supportedModels.length} 个可用模型`, 
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setNotification({ open: true, message: error.message, severity: 'error' });
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    // 新增配置时必须提供API Key，编辑时可以为空（表示不修改）
    if (!editingConfig && !formData.api_key.trim()) {
      setNotification({ open: true, message: t.keyRequired, severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      let configData = {
        user_id: user.id,
        api_name: formData.api_name,
        model_name: formData.model_name,
        is_active: formData.is_active
      };

      // 只有当提供了新的API Key时才加密并更新
      if (formData.api_key.trim()) {
        const { data: encryptedData, error: encryptError } = await supabase
          .rpc('encrypt_api_key', { api_key: formData.api_key });
        
        if (encryptError) throw encryptError;
        configData.api_key = encryptedData;
      }

      let result;
      if (editingConfig) {
        result = await supabase
          .from('api_configs')
          .update(configData)
          .eq('id', editingConfig.id)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('api_configs')
          .insert([configData]);
      }

      if (result.error) throw result.error;

      setNotification({ open: true, message: t.saveSuccess, severity: 'success' });
      setDialogOpen(false);
      setEditingConfig(null);
      setFormData({ api_name: 'gemini', api_key: '', model_name: 'gemini-2.5-flash-lite', is_active: true });
      fetchApiConfigs();
    } catch (error) {
      console.error('Error saving API config:', error);
      setNotification({ open: true, message: t.saveError, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const { error } = await supabase
        .from('api_configs')
        .delete()
        .eq('id', configId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotification({ open: true, message: t.deleteSuccess, severity: 'success' });
      fetchApiConfigs();
    } catch (error) {
      console.error('Error deleting API config:', error);
      setNotification({ open: true, message: t.deleteError, severity: 'error' });
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      api_name: config.api_name,
      api_key: '', // 不显示已加密的密钥
      model_name: config.model_name || 'gemini-2.5-flash-lite',
      is_active: config.is_active
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (configId, isActive) => {
    try {
      const { error } = await supabase
        .from('api_configs')
        .update({ is_active: isActive })
        .eq('id', configId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotification({ 
        open: true, 
        message: isActive ? '配置已启用' : '配置已禁用', 
        severity: 'success' 
      });
      fetchApiConfigs();
    } catch (error) {
      console.error('Error toggling config status:', error);
      setNotification({ 
        open: true, 
        message: '更新配置状态失败', 
        severity: 'error' 
      });
    }
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setFormData({ api_name: 'gemini', api_key: '', model_name: 'gemini-2.5-flash-lite', is_active: true });
    setAvailableModels([]);
    setDialogOpen(true);
  };

  const toggleShowApiKey = (configId) => {
    setShowApiKey(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const maskApiKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
  };

  const handleTestConnection = async () => {
    if (!user?.id) {
      setNotification({
        open: true,
        message: '请先登录后再测试连接',
        severity: 'warning'
      });
      return;
    }

    setTesting(true);
    try {
      // 获取活跃的API配置
      const { data: configs, error: configError } = await supabase
        .from('api_configs')
        .select('id, api_key, model_name')
        .eq('user_id', user.id)
        .eq('api_name', 'gemini')
        .eq('is_active', true)
        .limit(1);

      if (configError) {
        throw new Error('获取API配置失败: ' + configError.message);
      }

      if (!configs || configs.length === 0) {
        setNotification({
          open: true,
          message: '未找到活跃的API配置，请先添加并启用API配置',
          severity: 'warning'
        });
        return;
      }

      const config = configs[0];
      
      // 解密API密钥
      const { data: decryptedKey, error: decryptError } = await supabase
        .rpc('decrypt_api_key', { encrypted_key: config.api_key });

      if (decryptError || !decryptedKey) {
        setNotification({
          open: true,
          message: 'API密钥解密失败或为空',
          severity: 'error'
        });
        return;
      }

      // 使用新的测试连接服务
      let modelName = config.model_name || 'gemini-2.5-flash';
      
      // 确保模型名称格式正确（不包含models/前缀）
      if (modelName.startsWith('models/')) {
        modelName = modelName.replace('models/', '');
      }
      
      // 调用测试连接服务并获取详细结果
      const { data, error } = await supabase.functions.invoke('gemini-test', {
        body: { 
          apiKey: decryptedKey,
          modelName: modelName
        }
      });
      
      if (error) {
        throw new Error(`连接测试失败: ${error.message}`);
      }
      
      if (data && data.success) {
        // 更新API使用统计
        await supabase.rpc('update_api_usage', {
          config_id_param: config.id
        });
        
        setNotification({
          open: true,
          message: '✅ API连接测试成功！Gemini API工作正常',
          severity: 'success'
        });
      } else {
        const errorMsg = data?.error || data?.message || '连接测试失败';
        throw new Error(errorMsg);
      }

    } catch (error) {
      console.error('API连接测试失败:', error);
      setNotification({
        open: true,
        message: `❌ API连接测试失败: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {t.title}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        {t.description}
      </Alert>

      <Alert severity="success" sx={{ mb: 3 }}>
        {t.securityNote}
      </Alert>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              API 配置列表
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testing}
                color="primary"
              >
                {testing ? '测试中...' : '🔗 测试连接'}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
              >
                {t.addNew}
              </Button>
            </Box>
          </Box>

          {apiConfigs.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={4}>
              暂无API配置，点击上方按钮添加
            </Typography>
          ) : (
            <List>
              {apiConfigs.map((config, index) => (
                <React.Fragment key={config.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                            {config.api_name === 'gemini' ? '🤖 Google Gemini' : config.api_name}
                          </span>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={config.is_active}
                                size="small"
                                onChange={(e) => handleToggleActive(config.id, e.target.checked)}
                              />
                            }
                            label={config.is_active ? '已启用' : '已禁用'}
                            sx={{ ml: 1 }}
                          />
                        </div>
                      }
                      secondary={
                        <React.Fragment>
                          <span style={{ display: 'block' }}>
                            {t.usageCount}: {config.usage_count || 0} | 
                            {t.lastUsed}: {config.last_used_at ? new Date(config.last_used_at).toLocaleDateString() : t.never}
                            {config.model_name && (
                              <><br />{t.modelName}: {config.model_name}</>
                            )}
                          </span>
                          {config.api_name === 'gemini' && (
                            <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)', marginTop: '4px', display: 'block' }}>
                              {t.geminiInfo}
                            </span>
                          )}
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEdit(config)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(config.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < apiConfigs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig ? '编辑 API 配置' : '添加 API 配置'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t.apiName}
              value={formData.api_name}
              onChange={(e) => setFormData(prev => ({ ...prev, api_name: e.target.value }))}
              margin="normal"
              select
              SelectProps={{ native: true }}
            >
              <option value="gemini">Google Gemini</option>
            </TextField>

            <TextField
              fullWidth
              label={t.apiKey}
              value={formData.api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              margin="normal"
              type={showApiKey.form ? 'text' : 'password'}
              placeholder={editingConfig ? '留空表示不修改密钥' : '请输入API密钥'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => toggleShowApiKey('form')}
                      edge="end"
                    >
                      {showApiKey.form ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 2 }}>
              <TextField
                fullWidth
                label={t.modelName}
                value={formData.model_name}
                onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                select={availableModels.length > 0}
                SelectProps={availableModels.length > 0 ? { native: true } : undefined}
                helperText={availableModels.length === 0 ? '请先输入API密钥并加载模型列表' : ''}
              >
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.displayName}
                    </option>
                  ))
                ) : null}
              </TextField>
              <Button
                variant="outlined"
                onClick={() => fetchAvailableModels(formData.api_key)}
                disabled={!formData.api_key.trim() || loadingModels}
                sx={{ minWidth: 120, height: 56 }}
              >
                {loadingModels ? t.loadingModels : t.loadModels}
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label={t.isActive}
              sx={{ mt: 2 }}
            />

            {formData.api_name === 'gemini' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                获取 Gemini API Key：
                <br />
                1. 访问 <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
                <br />
                2. 创建新的 API Key
                <br />
                3. 复制并粘贴到上方输入框
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
          >
            {saving ? '保存中...' : t.save}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知 */}
      {notification.open && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ position: 'fixed', bottom: 100, left: 20, right: 20, zIndex: 1000 }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default ApiConfig;