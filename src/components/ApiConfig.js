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
    is_active: true
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [testing, setTesting] = useState(false);

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

  const handleSave = async () => {
    if (!formData.api_key.trim()) {
      setNotification({ open: true, message: t.keyRequired, severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      // 加密API密钥
      const { data: encryptedData, error: encryptError } = await supabase
        .rpc('encrypt_api_key', { api_key: formData.api_key });
      
      if (encryptError) throw encryptError;

      const configData = {
        user_id: user.id,
        api_name: formData.api_name,
        api_key: encryptedData,
        is_active: formData.is_active
      };

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
      setFormData({ api_name: 'gemini', api_key: '', is_active: true });
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
      is_active: config.is_active
    });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setFormData({ api_name: 'gemini', api_key: '', is_active: true });
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
      const { data, error } = await supabase
        .rpc('get_active_api_config', {
          user_id_param: user.id,
          api_name_param: 'gemini'
        });

      if (error) {
        throw new Error('获取API配置失败: ' + error.message);
      }

      if (!data || data.length === 0) {
        setNotification({
          open: true,
          message: '未找到活跃的API配置，请先添加并启用API配置',
          severity: 'warning'
        });
        return;
      }

      const apiConfig = data[0];
      if (!apiConfig.decrypted_key) {
        setNotification({
          open: true,
          message: 'API密钥无效或为空',
          severity: 'error'
        });
        return;
      }

      // 测试API连接
      const testPrompt = '测试连接';
      const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiConfig.decrypted_key,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: testPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API调用失败 (${response.status})`;
        
        if (response.status === 400) {
          errorMessage += ': API密钥格式错误或无效';
        } else if (response.status === 403) {
          errorMessage += ': API密钥权限不足或已被禁用';
        } else if (response.status === 429) {
          errorMessage += ': API调用频率超限';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0) {
        // 更新API使用统计
        await supabase.rpc('update_api_usage', {
          config_id_param: apiConfig.id
        });
        
        setNotification({
          open: true,
          message: '✅ API连接测试成功！Gemini API工作正常',
          severity: 'success'
        });
      } else {
        throw new Error('API响应格式异常');
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
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {config.api_name === 'gemini' ? '🤖 Google Gemini' : config.api_name}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={config.is_active}
                                size="small"
                                disabled
                              />
                            }
                            label={config.is_active ? '已启用' : '已禁用'}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {t.usageCount}: {config.usage_count || 0} | 
                            {t.lastUsed}: {config.last_used_at ? new Date(config.last_used_at).toLocaleDateString() : t.never}
                          </Typography>
                          {config.api_name === 'gemini' && (
                            <Typography variant="caption" color="textSecondary">
                              {t.geminiInfo}
                            </Typography>
                          )}
                        </Box>
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