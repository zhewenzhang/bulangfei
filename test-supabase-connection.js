// Supabase连接测试脚本
// 用于验证环境变量和Supabase连接是否正常

const { createClient } = require('@supabase/supabase-js');

console.log('🔗 测试Supabase连接...');
console.log('================================');

// 检查环境变量
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 环境变量缺失！');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ 环境变量检查通过');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 20) + '...');

// 创建Supabase客户端
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase客户端创建成功');
  
  // 测试连接
  supabase
    .from('categories')
    .select('count', { count: 'exact', head: true })
    .then(({ data, error, count }) => {
      if (error) {
        console.log('❌ 数据库连接失败:', error.message);
        process.exit(1);
      } else {
        console.log('✅ 数据库连接成功');
        console.log('Categories表记录数:', count);
        console.log('🎉 Supabase配置完全正常！');
      }
    })
    .catch(err => {
      console.log('❌ 连接测试失败:', err.message);
      process.exit(1);
    });
    
} catch (error) {
  console.log('❌ Supabase客户端创建失败:', error.message);
  process.exit(1);
}

console.log('================================');