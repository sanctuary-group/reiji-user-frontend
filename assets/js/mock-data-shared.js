/**
 * Shared Mock Data - Used across all authenticated pages
 */

var MOCK_CRYPTO_TICKER = [
  { symbol: 'BTC', price: 14235000, change: 2.34 },
  { symbol: 'ETH', price: 498200, change: -1.12 },
  { symbol: 'XRP', price: 87.5, change: 5.67 },
  { symbol: 'BNB', price: 98400, change: 0.89 },
  { symbol: 'SOL', price: 28500, change: 3.45 },
  { symbol: 'DOGE', price: 15.2, change: -2.80 },
  { symbol: 'HYPE', price: 3240, change: 12.50 },
  { symbol: 'SUI', price: 420, change: 8.30 }
];

var MOCK_FOREX_RATES = [
  { pair: '米ドル/円', value: 149.85, change: -0.32 },
  { pair: 'ユーロ/円', value: 162.40, change: 0.15 },
  { pair: '英ポンド/円', value: 189.20, change: -0.45 },
  { pair: '豪ドル/円', value: 97.65, change: 0.08 },
  { pair: 'メキシコペソ/円', value: 8.72, change: -0.05 },
  { pair: 'ユーロ/ドル', value: 1.0839, change: 0.0012 }
];

var MOCK_SIDEBAR_LINKS = [
  {
    label: '損益記録',
    icon: '<i class="fa-solid fa-chart-column"></i>',
    items: [
      { label: 'カレンダー', href: 'calendar.html' },
      { label: '月間損益', href: 'report.html', period: 'monthly' },
      { label: '年間損益', href: 'report.html', period: 'yearly' },
      { label: '生涯損益', href: 'report.html', period: 'lifetime' },
      { label: '損益グラフ', href: 'graph.html' },
      { label: '口座入出金管理', href: 'deposit.html' }
    ]
  },
  {
    label: 'シミュレーション',
    icon: '<i class="fa-solid fa-calculator"></i>',
    items: [
      { label: '税金計算ツール', href: '#' }
    ]
  },
  {
    label: '有益動画まとめ',
    icon: '<i class="fa-solid fa-video"></i>',
    items: [
      { label: 'YouTube', href: '#' },
      { label: '限定配信', href: '#' }
    ]
  },
  {
    label: '有益サイト一覧',
    icon: '<i class="fa-solid fa-globe"></i>',
    items: [
      { label: 'レイジの有益情報局', href: '#' },
      { label: '投資総合情報', href: '#' },
      { label: '仮想通貨関連', href: '#' },
      { label: 'FX関連', href: '#' },
      { label: 'ニュースメディア', href: '#' },
      { label: '証券会社一覧', href: '#' }
    ]
  }
];

var MOCK_CMC_TOP5 = [
  { rank: 1, name: 'Bitcoin', symbol: 'BTC', price: 14235000, change: 2.34 },
  { rank: 2, name: 'Ethereum', symbol: 'ETH', price: 498200, change: -1.12 },
  { rank: 3, name: 'BNB', symbol: 'BNB', price: 98400, change: 0.89 },
  { rank: 4, name: 'Solana', symbol: 'SOL', price: 28500, change: 3.45 },
  { rank: 5, name: 'XRP', symbol: 'XRP', price: 87.5, change: 5.67 }
];

var MOCK_CMC_TRENDING = [
  { rank: 1, name: 'HYPE', symbol: 'HYPE', price: 3240, change: 12.50 },
  { rank: 2, name: 'SUI', symbol: 'SUI', price: 420, change: 8.30 },
  { rank: 3, name: 'PEPE', symbol: 'PEPE', price: 0.0012, change: 7.80 },
  { rank: 4, name: 'Aptos', symbol: 'APT', price: 1850, change: 6.20 },
  { rank: 5, name: 'Render', symbol: 'RENDER', price: 1230, change: 5.90 }
];

var MOCK_ECONOMIC_INDICATORS = [
  { time: '22:30', country: '米', name: '消費者物価指数(CPI)', importance: 'high', actual: '', forecast: '+0.3%', previous: '+0.2%' },
  { time: '22:30', country: '米', name: '新規失業保険申請件数', importance: 'medium', actual: '', forecast: '22.0万件', previous: '21.5万件' },
  { time: '09:30', country: '日', name: '国内総生産(GDP)', importance: 'high', actual: '+0.5%', forecast: '+0.4%', previous: '+0.3%' },
  { time: '18:00', country: '欧', name: '鉱工業生産', importance: 'low', actual: '', forecast: '+0.2%', previous: '-0.1%' }
];

/**
 * Full crypto list for crypto.html
 */
var MOCK_CRYPTO_ALL = [
  { rank: 1,  name: 'Bitcoin',     symbol: 'BTC',    price: 14235000, change: 2.34,   trending: false },
  { rank: 2,  name: 'Ethereum',    symbol: 'ETH',    price: 498200,   change: -1.12,  trending: false },
  { rank: 3,  name: 'BNB',         symbol: 'BNB',    price: 98400,    change: 0.89,   trending: false },
  { rank: 4,  name: 'Solana',      symbol: 'SOL',    price: 28500,    change: 3.45,   trending: false },
  { rank: 5,  name: 'XRP',         symbol: 'XRP',    price: 87.5,     change: 5.67,   trending: true },
  { rank: 6,  name: 'Cardano',     symbol: 'ADA',    price: 95.8,     change: 1.23,   trending: false },
  { rank: 7,  name: 'Dogecoin',    symbol: 'DOGE',   price: 15.2,     change: -2.80,  trending: false },
  { rank: 8,  name: 'TRON',        symbol: 'TRX',    price: 18.5,     change: 0.45,   trending: false },
  { rank: 9,  name: 'Avalanche',   symbol: 'AVAX',   price: 5620,     change: 4.12,   trending: true },
  { rank: 10, name: 'Chainlink',   symbol: 'LINK',   price: 2340,     change: -0.78,  trending: false },
  { rank: 11, name: 'Polkadot',    symbol: 'DOT',    price: 1050,     change: 2.10,   trending: false },
  { rank: 12, name: 'Polygon',     symbol: 'MATIC',  price: 145,      change: -1.55,  trending: false },
  { rank: 13, name: 'Hyperliquid', symbol: 'HYPE',   price: 3240,     change: 12.50,  trending: true },
  { rank: 14, name: 'Sui',         symbol: 'SUI',    price: 420,      change: 8.30,   trending: true },
  { rank: 15, name: 'PEPE',        symbol: 'PEPE',   price: 0.0012,   change: 7.80,   trending: true },
  { rank: 16, name: 'Aptos',       symbol: 'APT',    price: 1850,     change: 6.20,   trending: true },
  { rank: 17, name: 'Render',      symbol: 'RENDER', price: 1230,     change: 5.90,   trending: true },
  { rank: 18, name: 'Cosmos',      symbol: 'ATOM',   price: 1580,     change: -0.34,  trending: false },
  { rank: 19, name: 'Uniswap',     symbol: 'UNI',    price: 1820,     change: 3.67,   trending: false },
  { rank: 20, name: 'Stellar',     symbol: 'XLM',    price: 42.5,     change: 1.89,   trending: false }
];

/**
 * Full economic indicators for indicators.html (keyed by date)
 */
var MOCK_INDICATORS_ALL = {
  '2026-02-10': [
    { time: '08:50', country: '日', name: '経常収支', importance: 'medium', actual: '2.5兆円', forecast: '2.3兆円', previous: '2.1兆円' },
    { time: '14:00', country: '日', name: '景気ウォッチャー調査', importance: 'low', actual: '49.8', forecast: '49.5', previous: '49.2' },
    { time: '24:00', country: '米', name: 'JOLTS求人件数', importance: 'medium', actual: '', forecast: '880万件', previous: '875万件' }
  ],
  '2026-02-11': [
    { time: '16:00', country: '英', name: 'GDP速報値(前期比)', importance: 'high', actual: '+0.3%', forecast: '+0.2%', previous: '+0.1%' },
    { time: '19:00', country: '欧', name: 'ZEW景況指数', importance: 'medium', actual: '17.5', forecast: '15.2', previous: '16.9' },
    { time: '22:30', country: '米', name: '小売売上高', importance: 'high', actual: '+0.4%', forecast: '+0.3%', previous: '+0.6%' }
  ],
  '2026-02-12': [
    { time: '09:30', country: '日', name: '国内総生産(GDP)', importance: 'high', actual: '+0.5%', forecast: '+0.4%', previous: '+0.3%' },
    { time: '18:00', country: '欧', name: '鉱工業生産', importance: 'low', actual: '', forecast: '+0.2%', previous: '-0.1%' },
    { time: '22:30', country: '米', name: '消費者物価指数(CPI)', importance: 'high', actual: '', forecast: '+0.3%', previous: '+0.2%' },
    { time: '22:30', country: '米', name: '新規失業保険申請件数', importance: 'medium', actual: '', forecast: '22.0万件', previous: '21.5万件' }
  ],
  '2026-02-13': [
    { time: '08:50', country: '日', name: '機械受注', importance: 'medium', actual: '', forecast: '+2.1%', previous: '+1.8%' },
    { time: '16:00', country: '英', name: '消費者物価指数(CPI)', importance: 'high', actual: '', forecast: '+3.0%', previous: '+3.0%' },
    { time: '22:30', country: '米', name: '生産者物価指数(PPI)', importance: 'high', actual: '', forecast: '+0.2%', previous: '+0.3%' },
    { time: '28:00', country: '米', name: 'FRB議長講演', importance: 'high', actual: '', forecast: '-', previous: '-' }
  ],
  '2026-02-14': [
    { time: '08:50', country: '日', name: '貿易収支', importance: 'medium', actual: '', forecast: '-5500億円', previous: '-4800億円' },
    { time: '16:00', country: '独', name: 'GDP速報値', importance: 'high', actual: '', forecast: '+0.1%', previous: '-0.1%' },
    { time: '19:00', country: '欧', name: 'GDP速報値', importance: 'high', actual: '', forecast: '+0.2%', previous: '+0.3%' },
    { time: '22:30', country: '米', name: '小売売上高', importance: 'high', actual: '', forecast: '+0.5%', previous: '+0.4%' },
    { time: '23:15', country: '米', name: '鉱工業生産', importance: 'medium', actual: '', forecast: '+0.3%', previous: '+0.1%' }
  ]
};
