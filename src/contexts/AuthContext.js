import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // 网络错误处理函数
  const handleNetworkError = (error) => {
    console.error('Network error:', error);
    if (error.message?.includes('ERR_NETWORK_CHANGED') || 
        error.message?.includes('fetch') ||
        error.code === 'NETWORK_ERROR') {
      setNetworkError('网络连接发生变化，正在重新连接...');
      // 延迟重试
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setNetworkError(null);
      }, 2000);
    }
  };

  // 重连函数
  const retryConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
        setNetworkError(null);
        setRetryCount(0);
      } else if (error) {
        handleNetworkError(error);
      }
    } catch (err) {
      handleNetworkError(err);
    }
  }, []);

  useEffect(() => {
    // 处理 OAuth 回调 URL
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (data?.session) {
          setUser(data.session.user);
          // 清理 URL 中的认证参数
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          setNetworkError(null);
        } else if (error) {
          handleNetworkError(error);
        }
      } catch (err) {
        handleNetworkError(err);
      }
      
      setLoading(false);
    };

    handleAuthCallback();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // 如果是登录成功，清理 URL
        if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 网络重连效果
  useEffect(() => {
    if (retryCount > 0 && retryCount <= 3) {
      retryConnection();
    }
  }, [retryCount, retryConnection]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signOut,
    networkError,
    retryConnection,
    retryCount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};