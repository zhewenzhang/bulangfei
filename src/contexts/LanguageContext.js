import React, { createContext, useContext, useState, useEffect } from 'react';

// 语言翻译文本
const translations = {
  'zh-CN': {
    // 底部导航
    calculate: '计算',
    shoppingAnalysis: '购物分析',
    profile: '我的',
    
    // 计算器页面
    residualValueCalculator: '残值计算器',
    productName: '商品名称',
    productNamePlaceholder: '请输入商品名称',
    purchasePrice: '购买价格',
    purchasePricePlaceholder: '请输入购买价格',
    targetDailyConsumption: '目标日耗',
    targetDailyConsumptionPlaceholder: '请输入目标日耗金额',
    saveAndAnalyze: '保存并分析',
    
    // Calculator页面新增
    itemResidualValueManagement: '物品残值管理',
    itemName: '物品名称',
    targetDailyCost: '¥目标日耗',
    purchaseDate: '入手日期',
    itemStatus: '物品状态',
    inUse: '使用中',
    discontinued: '已停用',
    sold: '已出售',
    salePrice: '¥出售价格',
    calculating: '计算中...',
    calculationResults: '计算结果',
    daysInService: '已服役',
    actualDailyCost: '实际日耗',
    dailyCost: '每日成本',
    targetCost: '目标成本',
    exceedsTarget: '超出目标',
    belowTarget: '低于目标',
    differenceFromTarget: '与目标差额',
    daysToMeetTarget: '还需要 {days} 天可达成目标',
    targetAchieved: '已达成目标!',
    continueUsing: '继续使用以降低日均成本',
    congratulations: '恭喜！您的使用效率很高',
    saving: '保存中...',
    
    // 历史页面
    purchaseHistory: '购买历史',
    noRecords: '暂无记录',
    noRecordsDesc: '还没有任何购买记录，快去添加第一个商品吧！',
    actualDailyConsumption: '实际日耗',
    consumedAmount: '已消耗金额',
    serviceDays: '服役天数',
    usageRate: '使用率',
    notRecorded: '未记录',
    noPurchasePrice: '无购买价格',
    
    // History页面新增
    calculationHistory: '计算历史',
    historyRecords: '历史计算记录 ({count} 条记录)',
    totalConsumption: '累计消费',
    totalExpenditure: '累计消费',
    averageDailyCost: '平均日耗',
    achievedCount: '已达成数量',
    estimatedAchievement: '预计达成',
    allAchieved: '全部达成',
      achievementStatus: '是否达成',
      achieved: '已达成',
      daysToAchieve: '天后达成',
      days: '天',
      loading: '加载中...',
      loadFailed: '加载失败',
    totalItems: '物品总数',
    itemNameCol: '物品名称',
    targetDailyCostCol: '目标日耗',
    actualDailyCostCol: '实际日耗',
    serviceDurationCol: '服役天数',
    loginToView: '请登录查看历史记录',
    loginButton: '立即登录',
    
    // 账户页面
    welcomeBack: '欢迎回来！',
    verifiedUser: '已认证用户',
    logout: '退出登录',
    appSettings: '⚙️ 应用设置',
    darkMode: '深色模式',
    darkModeDesc: '切换应用主题外观',
    switchTheme: '切换应用主题外观',
    languageRegion: '语言地区',
    languageRegionDesc: '选择应用显示语言',
    selectAppLanguage: '选择应用显示语言',
    notificationSettings: '通知设置',
    notificationSettingsDesc: '管理应用通知偏好',
    manageNotificationPreferences: '管理应用通知偏好',
    privacySecurity: '隐私与安全',
    privacySecurityDesc: '数据保护和安全设置',
    dataProtectionSecuritySettings: '数据保护和安全设置',
    aboutApp: '关于应用',
    aboutAppDesc: '版本信息和帮助',
    versionInfoHelp: '版本信息和帮助',
    selectLanguage: '🌐 选择语言',
    cancel: '取消',
    confirm: '确定',
    
    // 应用信息
    appName: '残值计算器',
    version: 'v1.0.0',
    copyright: '© 2024 残值计算器团队',
  },
  
  'zh-TW': {
    // 底部導航
    calculate: '計算',
    shoppingAnalysis: '購物分析',
    profile: '我的',
    
    // 計算器頁面
    residualValueCalculator: '殘值計算器',
    productName: '商品名稱',
    productNamePlaceholder: '請輸入商品名稱',
    purchasePrice: '購買價格',
    purchasePricePlaceholder: '請輸入購買價格',
    targetDailyConsumption: '目標日耗',
    targetDailyConsumptionPlaceholder: '請輸入目標日耗金額',
    saveAndAnalyze: '保存並分析',
    
    // Calculator頁面新增
    itemResidualValueManagement: '物品殘值管理',
    itemName: '物品名稱',
    targetDailyCost: '¥目標日耗',
    purchaseDate: '入手日期',
    itemStatus: '物品狀態',
    inUse: '使用中',
    discontinued: '已停用',
    sold: '已出售',
    salePrice: '¥出售價格',
    calculating: '計算中...',
    calculationResults: '計算結果',
    daysInService: '已服役',
    actualDailyCost: '實際日耗',
    dailyCost: '每日成本',
    targetCost: '目標成本',
    exceedsTarget: '超出目標',
    belowTarget: '低於目標',
    differenceFromTarget: '與目標差額',
    daysToMeetTarget: '還需要 {days} 天可達成目標',
    targetAchieved: '已達成目標!',
    continueUsing: '繼續使用以降低日均成本',
    congratulations: '恭喜！您的使用效率很高',
    saving: '保存中...',
    
    // 歷史頁面
    purchaseHistory: '購買歷史',
    noRecords: '暫無記錄',
    noRecordsDesc: '還沒有任何購買記錄，快去添加第一個商品吧！',
    actualDailyConsumption: '實際日耗',
    consumedAmount: '已消耗金額',
    serviceDays: '服役天數',
    usageRate: '使用率',
    notRecorded: '未記錄',
    noPurchasePrice: '無購買價格',
    
    // History頁面新增
    calculationHistory: '計算歷史',
    historyRecords: '歷史計算記錄 ({count} 條記錄)',
    totalConsumption: '累計消費',
    totalExpenditure: '累計消費',
    averageDailyCost: '平均日耗',
    achievedCount: '已達成數量',
    estimatedAchievement: '預計達成',
    allAchieved: '全部達成',
    achievementStatus: '是否達成',
      achieved: '已達成',
      daysToAchieve: '天後達成',
      days: '天',
    totalItems: '物品總數',
    itemNameCol: '物品名稱',
    targetDailyCostCol: '目標日耗',
    actualDailyCostCol: '實際日耗',
    serviceDurationCol: '服役天數',
    loginToView: '請登錄查看歷史記錄',
    loginButton: '立即登錄',
    
    // 賬戶頁面
    welcomeBack: '歡迎回來！',
    verifiedUser: '已認證用戶',
    logout: '退出登錄',
    appSettings: '⚙️ 應用設置',
    darkMode: '深色模式',
    darkModeDesc: '切換應用主題外觀',
    switchTheme: '切換應用主題外觀',
    languageRegion: '語言地區',
    languageRegionDesc: '選擇應用顯示語言',
    selectAppLanguage: '選擇應用顯示語言',
    notificationSettings: '通知設置',
    notificationSettingsDesc: '管理應用通知偏好',
    manageNotificationPreferences: '管理應用通知偏好',
    privacySecurity: '隱私與安全',
    privacySecurityDesc: '數據保護和安全設置',
    dataProtectionSecuritySettings: '數據保護和安全設置',
    aboutApp: '關於應用',
    aboutAppDesc: '版本信息和幫助',
    versionInfoHelp: '版本信息和幫助',
    selectLanguage: '🌐 選擇語言',
    cancel: '取消',
    confirm: '確定',
    
    // 應用信息
    appName: '殘值計算器',
    version: 'v1.0.0',
    copyright: '© 2024 殘值計算器團隊',
  },
  
  'en': {
    // Bottom Navigation
    calculate: 'Calculate',
    shoppingAnalysis: 'Shopping Analysis',
    profile: 'Profile',
    
    // Calculator Page
    residualValueCalculator: 'Residual Value Calculator',
    productName: 'Product Name',
    productNamePlaceholder: 'Enter product name',
    purchasePrice: 'Purchase Price',
    purchasePricePlaceholder: 'Enter purchase price',
    targetDailyConsumption: 'Target Daily Consumption',
    targetDailyConsumptionPlaceholder: 'Enter target daily consumption amount',
    saveAndAnalyze: 'Save and Analyze',
    
    // Calculator Page New
    itemResidualValueManagement: 'Item Residual Value Management',
    itemName: 'Item Name',
    targetDailyCost: '$Target Daily Cost',
    purchaseDate: 'Purchase Date',
    itemStatus: 'Item Status',
    inUse: 'In Use',
    discontinued: 'Discontinued',
    sold: 'Sold',
    salePrice: '$Sale Price',
    calculating: 'Calculating...',
    calculationResults: 'Calculation Results',
    daysInService: 'Days in Service',
    actualDailyCost: 'Actual Daily Cost',
    dailyCost: 'Daily Cost',
    targetCost: 'Target Cost',
    exceedsTarget: 'Exceeds Target',
    belowTarget: 'Below Target',
    differenceFromTarget: 'Difference from Target',
    daysToMeetTarget: 'Need {days} more days to meet target',
    targetAchieved: 'Target Achieved!',
    continueUsing: 'Continue using to reduce average daily cost',
    congratulations: 'Congratulations! Your usage efficiency is high',
    saving: 'Saving...',
    
    // History Page
    purchaseHistory: 'Purchase History',
    noRecords: 'No Records',
    noRecordsDesc: 'No purchase records yet, add your first product!',
    actualDailyConsumption: 'Actual Daily Consumption',
    consumedAmount: 'Consumed Amount',
    serviceDays: 'Service Days',
    usageRate: 'Usage Rate',
    notRecorded: 'Not Recorded',
    noPurchasePrice: 'No Purchase Price',
    
    // History Page New
    calculationHistory: 'Calculation History',
    historyRecords: 'Historical Calculation Records ({count} records)',
    totalConsumption: 'Total Consumption',
    totalExpenditure: 'Total Expenditure',
    averageDailyCost: 'Average Daily Cost',
    achievedCount: 'Achieved Count',
    estimatedAchievement: 'Estimated Achievement',
    allAchieved: 'All Achieved',
    achievementStatus: 'Achievement Status',
      achieved: 'Achieved',
      daysToAchieve: 'days to achieve',
      days: ' days',
      loading: 'Loading...',
      loadFailed: 'Load Failed',
    totalItems: 'Total Items',
    itemNameCol: 'Item Name',
    targetDailyCostCol: 'Target Daily Cost',
    actualDailyCostCol: 'Actual Daily Cost',
    serviceDurationCol: 'Service Duration',
    loginToView: 'Please login to view history records',
    loginButton: 'Login Now',
    
    // Account Page
    welcomeBack: 'Welcome Back!',
    verifiedUser: 'Verified User',
    logout: 'Logout',
    appSettings: '⚙️ App Settings',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Toggle app theme appearance',
    switchTheme: 'Toggle app theme appearance',
    languageRegion: 'Language & Region',
    languageRegionDesc: 'Select app display language',
    selectAppLanguage: 'Select app display language',
    notificationSettings: 'Notification Settings',
    notificationSettingsDesc: 'Manage app notification preferences',
    manageNotificationPreferences: 'Manage app notification preferences',
    privacySecurity: 'Privacy & Security',
    privacySecurityDesc: 'Data protection and security settings',
    dataProtectionSecuritySettings: 'Data protection and security settings',
    aboutApp: 'About App',
    aboutAppDesc: 'Version info and help',
    versionInfoHelp: 'Version info and help',
    selectLanguage: '🌐 Select Language',
    cancel: 'Cancel',
    confirm: 'Confirm',
    
    // App Info
    appName: 'Residual Value Calculator',
    version: 'v1.0.0',
    copyright: '© 2024 Residual Value Calculator Team',
  },
  
  'ja': {
    // ボトムナビゲーション
    calculate: '計算',
    shoppingAnalysis: 'ショッピング分析',
    profile: 'プロフィール',
    
    // 計算機ページ
    residualValueCalculator: '残存価値計算機',
    productName: '商品名',
    productNamePlaceholder: '商品名を入力してください',
    purchasePrice: '購入価格',
    purchasePricePlaceholder: '購入価格を入力してください',
    targetDailyConsumption: '目標日消費',
    targetDailyConsumptionPlaceholder: '目標日消費金額を入力してください',
    saveAndAnalyze: '保存して分析',
    
    // Calculator ページ新規
    itemResidualValueManagement: 'アイテム残存価値管理',
    itemName: 'アイテム名',
    targetDailyCost: '¥目標日コスト',
    purchaseDate: '購入日',
    itemStatus: 'アイテムステータス',
    inUse: '使用中',
    discontinued: '使用停止',
    sold: '売却済み',
    salePrice: '¥売却価格',
    calculating: '計算中...',
    calculationResults: '計算結果',
    daysInService: '使用日数',
    actualDailyCost: '実際の日コスト',
    dailyCost: '日コスト',
    targetCost: '目標コスト',
    exceedsTarget: '目標超過',
    belowTarget: '目標以下',
    differenceFromTarget: '目標との差額',
    daysToMeetTarget: 'あと{days}日で目標達成',
    targetAchieved: '目標達成！',
    continueUsing: '平均日コストを下げるため継続使用',
    congratulations: 'おめでとうございます！使用効率が高いです',
    saving: '保存中...',
    
    // 履歴ページ
    purchaseHistory: '購入履歴',
    noRecords: 'レコードなし',
    noRecordsDesc: '購入記録がまだありません。最初の商品を追加してください！',
    actualDailyConsumption: '実際の日消費',
    consumedAmount: '消費金額',
    serviceDays: 'サービス日数',
    usageRate: '使用率',
    notRecorded: '記録なし',
    noPurchasePrice: '購入価格なし',
    
    // History ページ新規
    calculationHistory: '計算履歴',
    historyRecords: '履歴計算記録（{count}件の記録）',
    totalConsumption: '総消費',
    totalExpenditure: '総支出',
    averageDailyCost: '平均日コスト',
    achievedCount: '達成数',
    estimatedAchievement: '予想達成',
    allAchieved: '全て達成',
    achievementStatus: '達成状況',
      achieved: '達成済み',
      daysToAchieve: '日後達成',
      days: '日',
      loading: '読み込み中...',
      loadFailed: '読み込み失敗',
    totalItems: '総アイテム数',
    itemNameCol: 'アイテム名',
    targetDailyCostCol: '目標日コスト',
    actualDailyCostCol: '実際の日コスト',
    serviceDurationCol: '使用期間',
    loginToView: '履歴記録を表示するにはログインしてください',
    loginButton: '今すぐログイン',
    
    // アカウントページ
    welcomeBack: 'おかえりなさい！',
    verifiedUser: '認証済みユーザー',
    logout: 'ログアウト',
    appSettings: '⚙️ アプリ設定',
    darkMode: 'ダークモード',
    darkModeDesc: 'アプリテーマの外観を切り替え',
    switchTheme: 'アプリテーマの外観を切り替え',
    languageRegion: '言語と地域',
    languageRegionDesc: 'アプリ表示言語を選択',
    selectAppLanguage: 'アプリ表示言語を選択',
    notificationSettings: '通知設定',
    notificationSettingsDesc: 'アプリ通知設定を管理',
    manageNotificationPreferences: 'アプリ通知設定を管理',
    privacySecurity: 'プライバシーとセキュリティ',
    privacySecurityDesc: 'データ保護とセキュリティ設定',
    dataProtectionSecuritySettings: 'データ保護とセキュリティ設定',
    aboutApp: 'アプリについて',
    aboutAppDesc: 'バージョン情報とヘルプ',
    versionInfoHelp: 'バージョン情報とヘルプ',
    selectLanguage: '🌐 言語を選択',
    cancel: 'キャンセル',
    confirm: '確認',
    
    // アプリ情報
    appName: '残存価値計算機',
    version: 'v1.0.0',
    copyright: '© 2024 残存価値計算機チーム',
  },
};

// 创建语言上下文
const LanguageContext = createContext();

// 语言上下文提供者
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh-CN');

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    // 可以在这里添加本地存储逻辑
    localStorage.setItem('app_language', newLanguage);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['zh-CN'][key] || key;
  };

  // 从本地存储恢复语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言上下文的钩子
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;