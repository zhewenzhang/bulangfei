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
    purchasePricePlaceholder: '请输入购买价格',
    targetDailyConsumption: '目标日耗',
    targetDailyConsumptionPlaceholder: '请输入目标日耗金额',
    saveAndAnalyze: '保存并分析',
    
    // Calculator页面新增
    itemResidualValueManagement: '物品残值管理',
    itemName: '物品名称',
    purchaseDate: '入手日期',
    itemStatus: '物品状态',
    inUse: '使用中',
    discontinued: '已停用',
    sold: '已出售',
    salePrice: '¥出售价格',
    calculating: '计算中...',
    calculationResults: '计算结果',
    daysInService: '已服役',
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
    notRecorded: '未记录',
    noPurchasePrice: '无购买价格',
    unknown: '未知',
    
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
    
    // 登录页面
    emailLabel: '邮箱地址',
    passwordLabel: '密码',
    signInButton: '登录',
    signInLoading: '登录中...',
    signUpButton: '注册',
    signUpLoading: '注册中...',
    socialProviderText: '使用{{provider}}登录',
    socialProviderSignUpText: '使用{{provider}}注册',
    signInLinkText: '已有账户？点击登录',
    signUpLinkText: '没有账户？点击注册',
    forgotPasswordButton: '发送重置链接',
    forgotPasswordLoading: '发送中...',
    forgotPasswordLinkText: '忘记密码？',
    signUpConfirmationText: '请检查您的邮箱并点击确认链接',
    forgotPasswordConfirmationText: '请检查您的邮箱获取密码重置链接',
    
    // 购物分析页面登录提示
    pleaseLoginFirst: '请先登录账户',
    loginToViewAnalysis: '登录后即可查看购物分析记录',
    loginNow: '立即登录',
    
    // 物品详情页面
    itemDetailInfo: '物品详情信息',
    targetDailyCost: '目标日耗',
    actualDailyCost: '实际日耗',
    purchasePrice: '购买价格',
    consumedAmount: '已消耗金额',
    serviceDays: '服役天数',
    usageRate: '使用率',
    closeDetail: '关闭详情',
    
    // 编辑功能
    editRecord: '编辑记录',
    manuallyModified: '已手动修改',
    autoCalculateBasedOnCategory: '将根据分类自动计算',
    recalculate: '重新计算',
    autoCalculateNotification: '根据分类「{categoryName}」自动计算目标日耗：{dailyTarget}元/天（预期持有{duration}天）',
    loading: '加载中...',
    loadFailed: '加载失败',
    itemCategory: '物品分类',
    selectCategory: '请选择分类',
    suggestedCategories: '建议分类：',
    analyzingCategory: '正在分析分类...',
    save: '保存',
    cancel: '取消',
    saving: '保存中...',
    editContent: '编辑内容',
    
    // Analytics页面
    analyticsTitle: '购物分析',
    overview: '总览',
    categories: '分类统计',
    trends: '趋势分析',
    totalItems: '总物品数',
    totalPurchaseValue: '总购买价值',
    totalCurrentValue: '总消耗值',
    totalDepreciation: '使用率',
    avgDepreciationRate: '平均贬值率',
    categoryName: '分类',
    itemCount: '物品数量',
    purchaseValue: '购买价值',
    currentValue: '当前价值',
    depreciation: '贬值金额',
    depreciationRate: '贬值率',
    recentItems: '最近添加的物品',
    currentPrice: '每天成本',
    serviceDuration: '使用时长',
    addedDate: '添加日期',
    noData: '暂无数据',
    error: '加载数据时出错',
    yuan: '元',
    trendsComingSoon: '趋势分析功能正在开发中，敬请期待！',
    calculationFormula: '计算公式说明：',
    totalConsumptionFormula: '• 总消耗值 = Σ(使用时长 × 目标日耗)',
    usageRateFormula: '• 使用率 = 总消耗值 ÷ 总购买价值 × 100%',
    depreciationRateFormula: '• 贬值率 = (购买价格 - 当前价格) ÷ 购买价格 × 100%',
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
    purchasePricePlaceholder: '請輸入購買價格',
    targetDailyConsumption: '目標日耗',
    targetDailyConsumptionPlaceholder: '請輸入目標日耗金額',
    saveAndAnalyze: '保存並分析',
    
    // Calculator頁面新增
    itemResidualValueManagement: '物品殘值管理',
    itemName: '物品名稱',
    purchaseDate: '入手日期',
    itemStatus: '物品狀態',
    inUse: '使用中',
    discontinued: '已停用',
    sold: '已出售',
    salePrice: '¥出售價格',
    calculating: '計算中...',
    calculationResults: '計算結果',
    daysInService: '已服役',
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
    notRecorded: '未記錄',
    noPurchasePrice: '無購買價格',
    unknown: '未知',
    
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
    
    // 登錄頁面
    emailLabel: '郵箱地址',
    passwordLabel: '密碼',
    signInButton: '登錄',
    signInLoading: '登錄中...',
    signUpButton: '註冊',
    signUpLoading: '註冊中...',
    socialProviderText: '使用{{provider}}登錄',
    socialProviderSignUpText: '使用{{provider}}註冊',
    signInLinkText: '已有賬戶？點擊登錄',
    signUpLinkText: '沒有賬戶？點擊註冊',
    forgotPasswordButton: '發送重置鏈接',
    forgotPasswordLoading: '發送中...',
    forgotPasswordLinkText: '忘記密碼？',
    signUpConfirmationText: '請檢查您的郵箱並點擊確認鏈接',
    forgotPasswordConfirmationText: '請檢查您的郵箱獲取密碼重置鏈接',
    
    // 購物分析頁面登錄提示
    pleaseLoginFirst: '請先登錄賬戶',
    loginToViewAnalysis: '登錄後即可查看購物分析記錄',
    loginNow: '立即登錄',
    
    // 物品詳情頁面
    itemDetailInfo: '物品詳情信息',
    targetDailyCost: '目標日耗',
    actualDailyCost: '實際日耗',
    purchasePrice: '購買價格',
    consumedAmount: '已消耗金額',
    serviceDays: '服役天數',
    usageRate: '使用率',
    closeDetail: '關閉詳情',
    
    // Edit Record
    editRecord: '編輯記錄',
    manuallyModified: '已手動修改',
    autoCalculateBasedOnCategory: '將根據分類自動計算',
    recalculate: '重新計算',
    autoCalculateNotification: '根據分類「{categoryName}」自動計算目標日耗：{dailyTarget}元/天（預期持有{duration}天）',
    loading: '加載中...',
    loadFailed: '加載失敗',
    itemCategory: '物品分類',
    selectCategory: '請選擇分類',
    suggestedCategories: '建議分類：',
    analyzingCategory: '正在分析分類...',
    save: '保存',
    cancel: '取消',
    saving: '保存中...',
    editContent: '編輯內容',
    
    // Analytics Page
    analyticsTitle: '購物分析',
    overview: '總覽',
    categories: '分類統計',
    trends: '趨勢分析',
    totalItems: '總物品數',
    totalPurchaseValue: '總購買價值',
    totalCurrentValue: '總消耗值',
    totalDepreciation: '使用率',
    avgDepreciationRate: '平均貶值率',
    categoryName: '分類',
    itemCount: '物品數量',
    purchaseValue: '購買價值',
    currentValue: '當前價值',
    depreciation: '貶值金額',
    depreciationRate: '貶值率',
    recentItems: '最近添加的物品',
    currentPrice: '每天成本',
    serviceDuration: '使用時長',
    addedDate: '添加日期',
    noData: '暫無數據',
    error: '加載數據時出錯',
    yuan: '元',
    trendsComingSoon: '趨勢分析功能正在開發中，敬請期待！',
    calculationFormula: '計算公式說明：',
    totalConsumptionFormula: '• 總消耗值 = Σ(使用時長 × 目標日耗)',
    usageRateFormula: '• 使用率 = 總消耗值 ÷ 總購買價值 × 100%',
    depreciationRateFormula: '• 貶值率 = (購買價格 - 當前價格) ÷ 購買價格 × 100%',
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
    purchasePricePlaceholder: 'Enter purchase price',
    targetDailyConsumption: 'Target Daily Consumption',
    targetDailyConsumptionPlaceholder: 'Enter target daily consumption amount',
    saveAndAnalyze: 'Save and Analyze',
    
    // Calculator Page New
    itemResidualValueManagement: 'Item Residual Value Management',
    itemName: 'Item Name',
    purchaseDate: 'Purchase Date',
    itemStatus: 'Item Status',
    inUse: 'In Use',
    discontinued: 'Discontinued',
    sold: 'Sold',
    salePrice: '$Sale Price',
    calculating: 'Calculating...',
    calculationResults: 'Calculation Results',
    daysInService: 'Days in Service',
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
    notRecorded: 'Not Recorded',
    noPurchasePrice: 'No Purchase Price',
    unknown: 'Unknown',
    
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
    
    // Login page
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInButton: 'Sign In',
    signInLoading: 'Signing In...',
    signUpButton: 'Sign Up',
    signUpLoading: 'Signing Up...',
    socialProviderText: 'Sign in with {{provider}}',
    socialProviderSignUpText: 'Sign up with {{provider}}',
    signInLinkText: 'Already have an account? Sign in',
    signUpLinkText: 'Don\'t have an account? Sign up',
    forgotPasswordButton: 'Send Reset Link',
    forgotPasswordLoading: 'Sending...',
    forgotPasswordLinkText: 'Forgot your password?',
    signUpConfirmationText: 'Please check your email and click the confirmation link',
    forgotPasswordConfirmationText: 'Please check your email for password reset link',
    
    // Shopping analysis page login prompt
    pleaseLoginFirst: 'Please login first',
    loginToViewAnalysis: 'Login to view shopping analysis records',
    loginNow: 'Login Now',
    
    // Item detail page
    itemDetailInfo: 'Item Detail Information',
    targetDailyCost: 'Target Daily Cost',
    actualDailyCost: 'Actual Daily Cost',
    purchasePrice: 'Purchase Price',
    consumedAmount: 'Consumed Amount',
    serviceDays: 'Service Days',
    usageRate: 'Usage Rate',
    closeDetail: 'Close Detail',
    
    // Edit functionality
    editRecord: 'Edit Record',
    manuallyModified: 'Manually Modified',
    autoCalculateBasedOnCategory: 'Will auto-calculate based on category',
    recalculate: 'Recalculate',
    autoCalculateNotification: 'Auto-calculated target daily cost based on category "{categoryName}": {dailyTarget} yuan/day (expected to hold for {duration} days)',
    loading: 'Loading...',
    loadFailed: 'Load Failed',
    itemCategory: 'Item Category',
    selectCategory: 'Please select category',
    suggestedCategories: 'Suggested categories:',
    analyzingCategory: 'Analyzing category...',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    editContent: 'Edit Content',
    
    // Analytics page
    analyticsTitle: 'Shopping Analytics',
    overview: 'Overview',
    categories: 'Category Statistics',
    trends: 'Trend Analysis',
    totalItems: 'Total Items',
    totalPurchaseValue: 'Total Purchase Value',
    totalCurrentValue: 'Total Consumption Value',
    totalDepreciation: 'Usage Rate',
    avgDepreciationRate: 'Avg Depreciation Rate',
    categoryName: 'Category',
    itemCount: 'Item Count',
    purchaseValue: 'Purchase Value',
    currentValue: 'Current Value',
    depreciation: 'Depreciation',
    depreciationRate: 'Depreciation Rate',
    recentItems: 'Recently Added Items',
    currentPrice: 'Daily Cost',
    serviceDuration: 'Service Duration',
    addedDate: 'Added Date',
    noData: 'No data available',
    error: 'Error loading data',
    yuan: '¥',
    trendsComingSoon: 'Trend analysis feature is under development, stay tuned!',
    calculationFormula: 'Calculation Formula:',
    totalConsumptionFormula: '• Total Consumption Value = Σ(Service Duration × Target Daily Cost)',
    usageRateFormula: '• Usage Rate = Total Consumption Value ÷ Total Purchase Value × 100%',
    depreciationRateFormula: '• Depreciation Rate = (Purchase Price - Current Price) ÷ Purchase Price × 100%',
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
    purchasePricePlaceholder: '購入価格を入力してください',
    targetDailyConsumption: '目標日消費',
    targetDailyConsumptionPlaceholder: '目標日消費金額を入力してください',
    saveAndAnalyze: '保存して分析',
    
    // Calculator ページ新規
    itemResidualValueManagement: 'アイテム残存価値管理',
    itemName: 'アイテム名',
    purchaseDate: '購入日',
    itemStatus: 'アイテムステータス',
    inUse: '使用中',
    discontinued: '使用停止',
    sold: '売却済み',
    salePrice: '¥売却価格',
    calculating: '計算中...',
    calculationResults: '計算結果',
    daysInService: '使用日数',
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
    notRecorded: '記録なし',
    noPurchasePrice: '購入価格なし',
    unknown: '不明',
    
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
    
    // ログインページ
    emailLabel: 'メールアドレス',
    passwordLabel: 'パスワード',
    signInButton: 'ログイン',
    signInLoading: 'ログイン中...',
    signUpButton: '登録',
    signUpLoading: '登録中...',
    socialProviderText: '{{provider}}でログイン',
    socialProviderSignUpText: '{{provider}}で登録',
    signInLinkText: 'アカウントをお持ちですか？ログイン',
    signUpLinkText: 'アカウントをお持ちでない方は登録',
    forgotPasswordButton: 'リセットリンクを送信',
    forgotPasswordLoading: '送信中...',
    forgotPasswordLinkText: 'パスワードを忘れましたか？',
    signUpConfirmationText: 'メールを確認して確認リンクをクリックしてください',
    forgotPasswordConfirmationText: 'パスワードリセットリンクのメールを確認してください',
    
    // ショッピング分析ページのログインプロンプト
    pleaseLoginFirst: 'まずログインしてください',
    loginToViewAnalysis: 'ログインしてショッピング分析記録を表示',
    loginNow: '今すぐログイン',
    
    // アイテム詳細ページ
    itemDetailInfo: 'アイテム詳細情報',
    targetDailyCost: '目標日額',
    actualDailyCost: '実際日額',
    consumedAmount: '消費金額',
    serviceDays: 'サービス日数',
    usageRate: '使用率',
    closeDetail: '詳細を閉じる',
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

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations['zh-CN'][key] || key;
    
    // 替换参数
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        const regex = new RegExp(`\\{${param}\\}`, 'g');
        text = text.replace(regex, params[param]);
      });
    }
    
    return text;
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