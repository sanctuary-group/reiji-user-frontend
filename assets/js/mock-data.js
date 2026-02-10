/**
 * Mock Data - All dummy data for prototype
 */

var MOCK_USER = {
  name: '投資太郎',
  bio: '日本株をメインにデイトレード・スイングトレードを行っています。2020年から投資を始め、コツコツ利益を積み上げています。',
  style: 'デイトレード / 日本株',
  followers: 128,
  following: 42,
  posts: 356,
  likes: 1024,
  yearlyGoal: 3000000
};

var MOCK_PNL_SUMMARY = {
  thisMonth: { total: 287400, winDays: 12, lossDays: 5, tradeDays: 17 },
  thisYear: { total: 1567890 },
  lifetime: { total: 8234567 }
};

var MOCK_CATEGORIES = [
  { id: 'stock', name: '現物取引', colorVar: 'cat-stock' },
  { id: 'margin', name: '信用取引', colorVar: 'cat-margin' },
  { id: 'fx', name: 'FX/CFD', colorVar: 'cat-fx' },
  { id: 'crypto', name: '仮想通貨', colorVar: 'cat-crypto' },
  { id: 'dividend', name: '配当金', colorVar: 'cat-dividend' }
];

var MOCK_CALENDAR = {
  '2025-10': {
    1: { total: 18000, categories: [{ id: 'stock', amount: 18000 }], comment: '' },
    2: { total: -7500, categories: [{ id: 'margin', amount: -7500 }], comment: '' },
    3: { total: 22000, categories: [{ id: 'stock', amount: 15000 }, { id: 'fx', amount: 7000 }], comment: '' },
    6: { total: 35000, categories: [{ id: 'stock', amount: 25000 }, { id: 'margin', amount: 10000 }], comment: '好調' },
    7: { total: -12000, categories: [{ id: 'fx', amount: -12000 }], comment: '' },
    8: { total: 8500, categories: [{ id: 'stock', amount: 8500 }], comment: '' },
    9: { total: 15000, categories: [{ id: 'margin', amount: 15000 }], comment: '' },
    10: { total: -25000, categories: [{ id: 'crypto', amount: -25000 }], comment: '暴落' },
    14: { total: 42000, categories: [{ id: 'stock', amount: 30000 }, { id: 'margin', amount: 12000 }], comment: '決算好調' },
    15: { total: -8000, categories: [{ id: 'fx', amount: -8000 }], comment: '' },
    16: { total: 19000, categories: [{ id: 'stock', amount: 19000 }], comment: '' },
    17: { total: 6500, categories: [{ id: 'dividend', amount: 6500 }], comment: '配当' },
    20: { total: -15000, categories: [{ id: 'margin', amount: -15000 }], comment: '' },
    21: { total: 28000, categories: [{ id: 'stock', amount: 20000 }, { id: 'crypto', amount: 8000 }], comment: '' },
    22: { total: 11000, categories: [{ id: 'stock', amount: 11000 }], comment: '' },
    23: { total: -5000, categories: [{ id: 'fx', amount: -5000 }], comment: '' },
    24: { total: 33000, categories: [{ id: 'stock', amount: 25000 }, { id: 'margin', amount: 8000 }], comment: '' },
    27: { total: -18000, categories: [{ id: 'margin', amount: -10000 }, { id: 'crypto', amount: -8000 }], comment: '' },
    28: { total: 14000, categories: [{ id: 'stock', amount: 14000 }], comment: '' },
    29: { total: 20000, categories: [{ id: 'stock', amount: 12000 }, { id: 'fx', amount: 8000 }], comment: '' },
    30: { total: -6000, categories: [{ id: 'margin', amount: -6000 }], comment: '' },
    31: { total: 25000, categories: [{ id: 'stock', amount: 18000 }, { id: 'dividend', amount: 7000 }], comment: '' }
  },
  '2025-11': {
    4: { total: 29000, categories: [{ id: 'stock', amount: 20000 }, { id: 'margin', amount: 9000 }], comment: '' },
    5: { total: -11000, categories: [{ id: 'fx', amount: -11000 }], comment: '' },
    6: { total: 16500, categories: [{ id: 'stock', amount: 16500 }], comment: '' },
    7: { total: 38000, categories: [{ id: 'stock', amount: 25000 }, { id: 'crypto', amount: 13000 }], comment: '大勝' },
    10: { total: -20000, categories: [{ id: 'margin', amount: -15000 }, { id: 'fx', amount: -5000 }], comment: '' },
    11: { total: 12000, categories: [{ id: 'stock', amount: 12000 }], comment: '' },
    12: { total: 8000, categories: [{ id: 'dividend', amount: 8000 }], comment: '配当入金' },
    13: { total: -9500, categories: [{ id: 'crypto', amount: -9500 }], comment: '' },
    14: { total: 45000, categories: [{ id: 'stock', amount: 30000 }, { id: 'margin', amount: 15000 }], comment: '決算好調' },
    17: { total: 21000, categories: [{ id: 'stock', amount: 15000 }, { id: 'fx', amount: 6000 }], comment: '' },
    18: { total: -14000, categories: [{ id: 'margin', amount: -14000 }], comment: '' },
    19: { total: 33000, categories: [{ id: 'stock', amount: 22000 }, { id: 'margin', amount: 11000 }], comment: '' },
    20: { total: 7500, categories: [{ id: 'stock', amount: 7500 }], comment: '' },
    21: { total: -6000, categories: [{ id: 'fx', amount: -6000 }], comment: '' },
    25: { total: 18000, categories: [{ id: 'stock', amount: 18000 }], comment: '' },
    26: { total: -8500, categories: [{ id: 'margin', amount: -8500 }], comment: '' },
    27: { total: 26000, categories: [{ id: 'stock', amount: 18000 }, { id: 'crypto', amount: 8000 }], comment: '' },
    28: { total: 15000, categories: [{ id: 'stock', amount: 10000 }, { id: 'dividend', amount: 5000 }], comment: '' }
  },
  '2025-12': {
    1: { total: 22000, categories: [{ id: 'stock', amount: 15000 }, { id: 'margin', amount: 7000 }], comment: '' },
    2: { total: -13000, categories: [{ id: 'fx', amount: -8000 }, { id: 'crypto', amount: -5000 }], comment: '' },
    3: { total: 31000, categories: [{ id: 'stock', amount: 25000 }, { id: 'margin', amount: 6000 }], comment: '' },
    4: { total: 9500, categories: [{ id: 'stock', amount: 9500 }], comment: '' },
    5: { total: -17000, categories: [{ id: 'margin', amount: -17000 }], comment: '急落' },
    8: { total: 28000, categories: [{ id: 'stock', amount: 20000 }, { id: 'fx', amount: 8000 }], comment: '' },
    9: { total: 14000, categories: [{ id: 'stock', amount: 14000 }], comment: '' },
    10: { total: -8500, categories: [{ id: 'crypto', amount: -8500 }], comment: '' },
    11: { total: 36000, categories: [{ id: 'stock', amount: 24000 }, { id: 'margin', amount: 12000 }], comment: '年末ラリー' },
    12: { total: 19000, categories: [{ id: 'stock', amount: 12000 }, { id: 'dividend', amount: 7000 }], comment: '配当' },
    15: { total: -22000, categories: [{ id: 'margin', amount: -15000 }, { id: 'fx', amount: -7000 }], comment: '' },
    16: { total: 41000, categories: [{ id: 'stock', amount: 30000 }, { id: 'margin', amount: 11000 }], comment: '好調' },
    17: { total: 11500, categories: [{ id: 'stock', amount: 11500 }], comment: '' },
    18: { total: -5000, categories: [{ id: 'fx', amount: -5000 }], comment: '' },
    19: { total: 25000, categories: [{ id: 'stock', amount: 18000 }, { id: 'crypto', amount: 7000 }], comment: '' },
    22: { total: 15000, categories: [{ id: 'stock', amount: 15000 }], comment: '' },
    23: { total: -10000, categories: [{ id: 'margin', amount: -10000 }], comment: '' },
    24: { total: 32000, categories: [{ id: 'stock', amount: 22000 }, { id: 'margin', amount: 10000 }], comment: 'クリスマスラリー' },
    25: { total: 8000, categories: [{ id: 'dividend', amount: 8000 }], comment: '配当' },
    26: { total: -7000, categories: [{ id: 'fx', amount: -7000 }], comment: '' },
    29: { total: 18000, categories: [{ id: 'stock', amount: 18000 }], comment: '' },
    30: { total: 12000, categories: [{ id: 'stock', amount: 8000 }, { id: 'margin', amount: 4000 }], comment: '大納会' }
  },
  '2026-01': {
    5: { total: 32000, categories: [{ id: 'stock', amount: 32000 }], comment: 'トヨタ好決算' },
    6: { total: -15000, categories: [{ id: 'margin', amount: -15000 }], comment: '' },
    7: { total: 8500, categories: [{ id: 'stock', amount: 5000 }, { id: 'fx', amount: 3500 }], comment: '' },
    8: { total: -3200, categories: [{ id: 'fx', amount: -3200 }], comment: '損切り' },
    9: { total: 45000, categories: [{ id: 'stock', amount: 30000 }, { id: 'margin', amount: 15000 }], comment: '好調' },
    13: { total: 12000, categories: [{ id: 'stock', amount: 12000 }], comment: '' },
    14: { total: -22000, categories: [{ id: 'margin', amount: -22000 }], comment: '急落' },
    15: { total: 18500, categories: [{ id: 'stock', amount: 10000 }, { id: 'dividend', amount: 8500 }], comment: '配当入金' },
    16: { total: 5600, categories: [{ id: 'fx', amount: 5600 }], comment: '' },
    19: { total: -8000, categories: [{ id: 'crypto', amount: -8000 }], comment: 'BTC下落' },
    20: { total: 27000, categories: [{ id: 'stock', amount: 20000 }, { id: 'margin', amount: 7000 }], comment: '' },
    21: { total: 15200, categories: [{ id: 'stock', amount: 15200 }], comment: '' },
    22: { total: -5500, categories: [{ id: 'fx', amount: -5500 }], comment: '' },
    23: { total: 38000, categories: [{ id: 'stock', amount: 25000 }, { id: 'crypto', amount: 13000 }], comment: '大勝' },
    26: { total: 9800, categories: [{ id: 'stock', amount: 9800 }], comment: '' },
    27: { total: -12000, categories: [{ id: 'margin', amount: -12000 }], comment: '' },
    28: { total: 21000, categories: [{ id: 'stock', amount: 15000 }, { id: 'fx', amount: 6000 }], comment: '' },
    29: { total: 6500, categories: [{ id: 'dividend', amount: 6500 }], comment: '配当金' },
    30: { total: -18000, categories: [{ id: 'margin', amount: -10000 }, { id: 'crypto', amount: -8000 }], comment: '' }
  },
  '2026-02': {
    2: { total: 45200, categories: [{ id: 'stock', amount: 30000 }, { id: 'margin', amount: 15200 }], comment: '好スタート' },
    3: { total: -12000, categories: [{ id: 'fx', amount: -12000 }], comment: '円高で損切り' },
    4: { total: 28000, categories: [{ id: 'stock', amount: 28000 }], comment: 'ソニー上昇' },
    5: { total: 15600, categories: [{ id: 'stock', amount: 8000 }, { id: 'crypto', amount: 7600 }], comment: '' },
    6: { total: -8400, categories: [{ id: 'margin', amount: -8400 }], comment: '' },
    9: { total: 52000, categories: [{ id: 'stock', amount: 35000 }, { id: 'margin', amount: 17000 }], comment: '決算シーズン好調' },
    10: { total: -5000, categories: [{ id: 'fx', amount: -5000 }], comment: '' },
    11: { total: 33000, categories: [{ id: 'stock', amount: 20000 }, { id: 'dividend', amount: 13000 }], comment: '配当入金あり' },
    12: { total: 18500, categories: [{ id: 'stock', amount: 18500 }], comment: '' },
    13: { total: -22000, categories: [{ id: 'margin', amount: -15000 }, { id: 'crypto', amount: -7000 }], comment: '調整局面' },
    16: { total: 41000, categories: [{ id: 'stock', amount: 25000 }, { id: 'fx', amount: 16000 }], comment: '' },
    17: { total: 12000, categories: [{ id: 'stock', amount: 12000 }], comment: '' },
    18: { total: -9500, categories: [{ id: 'margin', amount: -9500 }], comment: '' },
    19: { total: 25000, categories: [{ id: 'stock', amount: 18000 }, { id: 'crypto', amount: 7000 }], comment: '' },
    20: { total: 38000, categories: [{ id: 'stock', amount: 22000 }, { id: 'margin', amount: 16000 }], comment: '今月最高益' },
    23: { total: -15000, categories: [{ id: 'fx', amount: -15000 }], comment: '' },
    24: { total: 20000, categories: [{ id: 'stock', amount: 20000 }], comment: '' },
    25: { total: 8500, categories: [{ id: 'dividend', amount: 8500 }], comment: '' },
    26: { total: -18500, categories: [{ id: 'margin', amount: -12000 }, { id: 'crypto', amount: -6500 }], comment: '' },
    27: { total: 35000, categories: [{ id: 'stock', amount: 35000 }], comment: '' }
  }
};

var MOCK_POPULAR_USERS = [
  { name: '山田花子', pnlMonth: 523000, style: '日本株 / スイング', followers: 892 },
  { name: '佐藤健一', pnlMonth: 412000, style: 'FX / デイトレード', followers: 654 },
  { name: '田中美咲', pnlMonth: 387000, style: '仮想通貨 / 長期', followers: 1203 },
  { name: '鈴木大輔', pnlMonth: -156000, style: '米国株 / グロース', followers: 445 },
  { name: '高橋優子', pnlMonth: 298000, style: '日本株 / バリュー', followers: 778 },
  { name: '伊藤翔太', pnlMonth: 189000, style: '先物 / スキャルピング', followers: 321 }
];

var MOCK_ACTIVITY = [
  { date: '2026-02-09', type: '損益記録', desc: '日本株 +52,000円', typeClass: 'profit' },
  { date: '2026-02-08', type: 'ブログ投稿', desc: '2月第2週の振り返り', typeClass: 'primary' },
  { date: '2026-02-07', type: '損益記録', desc: 'FX/CFD -5,000円', typeClass: 'loss' },
  { date: '2026-02-06', type: 'フォロー', desc: '田中美咲さんをフォロー', typeClass: 'accent' },
  { date: '2026-02-05', type: '損益記録', desc: '仮想通貨 +7,600円', typeClass: 'profit' }
];

/**
 * Format number as Japanese yen
 */
function formatYen(amount) {
  var prefix = amount >= 0 ? '+' : '';
  return prefix + new Intl.NumberFormat('ja-JP').format(amount) + '円';
}

/**
 * Get category info by ID
 */
function getCategoryById(id) {
  for (var i = 0; i < MOCK_CATEGORIES.length; i++) {
    if (MOCK_CATEGORIES[i].id === id) return MOCK_CATEGORIES[i];
  }
  return null;
}
