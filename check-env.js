// 环境变量检查脚本
// 用于验证Supabase配置是否正确

console.log('🔍 检查环境变量配置...');
console.log('================================');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✅ 已设置' : '❌ 未设置');
console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 已设置' : '❌ 未设置');

if (supabaseUrl) {
  console.log('Supabase URL:', supabaseUrl);
}

if (supabaseKey) {
  console.log('Supabase Key (前8位):', supabaseKey.substring(0, 8) + '...');
}

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ 环境变量配置不完整！');
  console.log('请确保在Zeabur控制台中设置了以下环境变量：');
  console.log('- REACT_APP_SUPABASE_URL');
  console.log('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
} else {
  console.log('\n✅ 环境变量配置正确！');
}

console.log('================================');