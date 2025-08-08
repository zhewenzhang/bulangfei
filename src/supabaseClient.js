import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to show a friendlier error message to the user.
  // For development, throwing an error is clear and effective.
  throw new Error("Supabase URL or Anon Key is missing. Make sure it's set in your .env.local file and prefixed with REACT_APP_");
}

// 動態設置重定向 URL
const getRedirectURL = () => {
  // 如果是生產環境或者當前域名是 Zeabur 部署的域名
  if (window.location.hostname === 'a2a.zeabur.app') {
    return 'https://a2a.zeabur.app';
  }
  // 本地開發環境
  return window.location.origin;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: getRedirectURL(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // 添加网络错误重试机制
    retryAttempts: 3,
    retryDelay: 1000
  },
  // 添加全局错误处理
  global: {
    headers: {
      'X-Client-Info': 'residual-value-calculator'
    }
  },
  // 数据库连接配置
  db: {
    schema: 'public'
  },
  // 实时连接配置
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
