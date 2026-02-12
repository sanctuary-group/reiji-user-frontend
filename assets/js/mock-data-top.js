/**
 * TOP Page Mock Data - Only loaded on dashboard.html (TOP page)
 */

var MOCK_BANNERS = [
  { id: 1, title: 'REIJI ACADEMY 新講座公開', subtitle: '投資の基礎から応用まで学べる', url: '#', bgColor: '#d97706' },
  { id: 2, title: '確定申告セミナー開催中', subtitle: '2026年の確定申告を完全サポート', url: '#', bgColor: '#0d9488' },
  { id: 3, title: '新機能：仮想通貨自動連携', subtitle: '取引所APIで損益を自動記録', url: '#', bgColor: '#7c3aed' }
];

var MOCK_NOTICES = [
  { tag: '重要', tagClass: 'badge-loss', date: '2026/02/10', title: 'サーバーメンテナンスのお知らせ', excerpt: '2/15 AM2:00-5:00の間、サービスを一時停止いたします。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2026/02/08', title: '仮想通貨レート表示機能を追加しました', excerpt: 'CoinMarketCap連携により、リアルタイムレートを確認できます。' },
  { tag: 'イベント', tagClass: 'badge-accent', date: '2026/02/05', title: 'REIJI ACADEMY 第3期生募集開始', excerpt: '3月開講予定の第3期生の募集を開始しました。' }
];

var MOCK_VIDEOS = [
  { title: '【2026年2月】仮想通貨市場レビュー', date: '2026/02/09', views: '12.5万', bgColor: '#ef4444' },
  { title: '初心者必見！FXで勝てるチャート分析', date: '2026/02/07', views: '8.2万', bgColor: '#3b82f6' },
  { title: '確定申告のやり方完全ガイド', date: '2026/02/05', views: '25.1万', bgColor: '#10b981' },
  { title: 'ビットコイン今後の値動き予想', date: '2026/02/03', views: '18.7万', bgColor: '#f59e0b' },
  { title: '日本株おすすめ銘柄5選', date: '2026/02/01', views: '6.3万', bgColor: '#8b5cf6' },
  { title: '損切りのタイミングを解説', date: '2026/01/30', views: '9.8万', bgColor: '#ec4899' }
];

var MOCK_CRYPTO_NEWS = [
  { title: 'ビットコイン、1500万円突破後の調整局面入りか', source: 'CoinDesk', date: '2026/02/10', url: '#' },
  { title: 'イーサリアムETF承認への期待高まる', source: 'CoinPost', date: '2026/02/10', url: '#' },
  { title: 'SEC、新たな仮想通貨規制案を公表', source: 'Bloomberg', date: '2026/02/09', url: '#' },
  { title: 'ソラナエコシステム、DeFi TVLが過去最高更新', source: 'The Block', date: '2026/02/09', url: '#' },
  { title: '日本の仮想通貨税制改正案、国会提出へ', source: 'CoinPost', date: '2026/02/08', url: '#' }
];

var MOCK_FOREX_NEWS = [
  { title: '米雇用統計予想上回り、ドル円一時150円台', source: 'ロイター', date: '2026/02/10', url: '#' },
  { title: 'ECB理事会、据え置き決定もタカ派姿勢', source: 'ブルームバーグ', date: '2026/02/10', url: '#' },
  { title: '日銀、次回会合で追加利上げ検討か', source: '日経新聞', date: '2026/02/09', url: '#' },
  { title: '豪ドル、RBA議事要旨でハト派転換示唆', source: 'ロイター', date: '2026/02/09', url: '#' },
  { title: 'メキシコペソ、中銀の利下げ観測で下落', source: 'Bloomberg', date: '2026/02/08', url: '#' }
];

/**
 * Full data for "See All" pages
 */
var MOCK_NOTICES_ALL = [
  { tag: '重要', tagClass: 'badge-loss', date: '2026/02/10', title: 'サーバーメンテナンスのお知らせ', excerpt: '2/15 AM2:00-5:00の間、サービスを一時停止いたします。ご利用の皆様にはご不便をおかけいたしますが、ご了承ください。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2026/02/08', title: '仮想通貨レート表示機能を追加しました', excerpt: 'CoinMarketCap連携により、リアルタイムレートを確認できます。TOP5と急上昇銘柄を右サイドバーに表示しています。' },
  { tag: 'イベント', tagClass: 'badge-accent', date: '2026/02/05', title: 'REIJI ACADEMY 第3期生募集開始', excerpt: '3月開講予定の第3期生の募集を開始しました。投資の基礎から応用までを体系的に学べるカリキュラムです。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2026/02/03', title: '損益グラフページを追加しました', excerpt: '累計損益の推移をグラフで確認できる新ページを追加しました。月間・年間・生涯の3つの期間で確認できます。' },
  { tag: '重要', tagClass: 'badge-loss', date: '2026/01/30', title: '利用規約の一部改定について', excerpt: '2026年3月1日より利用規約の一部を改定いたします。主な変更点はデータの取り扱いに関する条項です。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2026/01/25', title: '簡易電卓機能を追加しました', excerpt: 'ナビゲーションバーの「簡易電卓」から利用できます。取引計算にご活用ください。' },
  { tag: 'お知らせ', tagClass: 'badge-accent', date: '2026/01/20', title: '年末年始のサポート対応について', excerpt: '1月4日よりサポート対応を再開しております。年末年始にお問い合わせいただいた方には順次回答いたします。' },
  { tag: 'イベント', tagClass: 'badge-accent', date: '2026/01/15', title: '確定申告セミナー開催のお知らせ', excerpt: '2026年の確定申告に向けた無料オンラインセミナーを2月に開催予定です。投資に関する税金の基礎を解説します。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2026/01/10', title: 'カレンダーにコメント機能を追加', excerpt: '日次損益記録にコメントを追加できるようになりました。その日の振り返りメモとしてご活用ください。' },
  { tag: '重要', tagClass: 'badge-loss', date: '2026/01/05', title: 'パスワードポリシー変更のお願い', excerpt: 'セキュリティ強化のため、8文字以上のパスワード設定を必須とさせていただきます。' },
  { tag: 'お知らせ', tagClass: 'badge-accent', date: '2025/12/28', title: '2025年の振り返りレポート機能', excerpt: '年間レポートで2025年の投資成績を確認できます。生涯損益レポートもご覧いただけます。' },
  { tag: '新機能', tagClass: 'badge-primary', date: '2025/12/20', title: '口座入出金管理機能をリリース', excerpt: '複数口座の入金・出金履歴を一元管理できる機能を追加しました。月次の入出金状況を確認できます。' }
];

var MOCK_VIDEOS_ALL = [
  { title: '【2026年2月】仮想通貨市場レビュー', date: '2026/02/09', views: '12.5万', bgColor: '#ef4444' },
  { title: '初心者必見！FXで勝てるチャート分析', date: '2026/02/07', views: '8.2万', bgColor: '#3b82f6' },
  { title: '確定申告のやり方完全ガイド', date: '2026/02/05', views: '25.1万', bgColor: '#10b981' },
  { title: 'ビットコイン今後の値動き予想', date: '2026/02/03', views: '18.7万', bgColor: '#f59e0b' },
  { title: '日本株おすすめ銘柄5選', date: '2026/02/01', views: '6.3万', bgColor: '#8b5cf6' },
  { title: '損切りのタイミングを解説', date: '2026/01/30', views: '9.8万', bgColor: '#ec4899' },
  { title: 'インデックス投資の始め方2026年版', date: '2026/01/28', views: '15.2万', bgColor: '#06b6d4' },
  { title: 'レバレッジ取引のリスク管理術', date: '2026/01/25', views: '7.4万', bgColor: '#f43f5e' },
  { title: '【永久保存版】テクニカル分析入門', date: '2026/01/22', views: '32.0万', bgColor: '#d97706' },
  { title: 'つみたてNISA vs 新NISA 徹底比較', date: '2026/01/18', views: '20.3万', bgColor: '#0d9488' },
  { title: '高配当株ポートフォリオの組み方', date: '2026/01/15', views: '11.6万', bgColor: '#7c3aed' },
  { title: '2026年注目の仮想通貨TOP10', date: '2026/01/12', views: '28.9万', bgColor: '#ef4444' },
  { title: 'FX自動売買の設定方法と注意点', date: '2026/01/08', views: '5.8万', bgColor: '#3b82f6' },
  { title: '米国株ETFおすすめランキング', date: '2026/01/05', views: '14.1万', bgColor: '#10b981' }
];

var MOCK_CRYPTO_NEWS_ALL = [
  { title: 'ビットコイン、1500万円突破後の調整局面入りか', source: 'CoinDesk', date: '2026/02/10', url: '#', excerpt: 'ビットコインは先週1500万円を突破したものの、利益確定売りに押され調整局面に入った可能性がある。' },
  { title: 'イーサリアムETF承認への期待高まる', source: 'CoinPost', date: '2026/02/10', url: '#', excerpt: 'SEC関係者の発言を受け、イーサリアム現物ETFの承認期待が高まっている。' },
  { title: 'SEC、新たな仮想通貨規制案を公表', source: 'Bloomberg', date: '2026/02/09', url: '#', excerpt: '米証券取引委員会は仮想通貨取引所に対する新たな規制案を公表した。' },
  { title: 'ソラナエコシステム、DeFi TVLが過去最高更新', source: 'The Block', date: '2026/02/09', url: '#', excerpt: 'ソラナのDeFiエコシステムのTVLが200億ドルを超え、過去最高を記録した。' },
  { title: '日本の仮想通貨税制改正案、国会提出へ', source: 'CoinPost', date: '2026/02/08', url: '#', excerpt: '仮想通貨の所得を分離課税とする改正案が来月の国会に提出される見込み。' },
  { title: 'メタバース関連トークンが軒並み上昇', source: 'CoinTelegraph', date: '2026/02/08', url: '#', excerpt: 'Apple Vision Proの新モデル発表を受け、メタバース関連トークンが急騰。' },
  { title: 'バイナンス、日本市場向け新サービスを発表', source: 'CoinPost', date: '2026/02/07', url: '#', excerpt: 'バイナンスジャパンが日本居住者向けの新たな取引サービスを発表した。' },
  { title: 'リップル社、SEC訴訟で最終和解か', source: 'CoinDesk', date: '2026/02/07', url: '#', excerpt: 'リップル社とSECの訴訟が最終和解に向けて進展していることが関係者への取材で分かった。' },
  { title: 'ステーブルコイン市場規模、2000億ドル突破', source: 'The Block', date: '2026/02/06', url: '#', excerpt: 'ステーブルコインの総市場規模が初めて2000億ドルを超えた。USDTが引き続きシェア首位。' },
  { title: 'DeFiプロトコルのハッキング被害が減少傾向', source: 'Bloomberg', date: '2026/02/06', url: '#', excerpt: '2026年Q1のDeFiハッキング被害額は前年同期比40%減少。セキュリティ監査の強化が寄与。' },
  { title: 'NFT市場、2026年に復活の兆し', source: 'CoinTelegraph', date: '2026/02/05', url: '#', excerpt: 'NFTの月間取引量が3ヶ月連続で増加しており、市場回復の兆しが見えている。' },
  { title: '中央銀行デジタル通貨(CBDC)、G7で議論進む', source: 'ロイター', date: '2026/02/05', url: '#', excerpt: 'G7財務相会議でCBDCの国際的な相互運用性について議論が行われた。' },
  { title: 'ライトニングネットワーク、決済処理量が10倍に', source: 'CoinDesk', date: '2026/02/04', url: '#', excerpt: 'ビットコインのレイヤー2ソリューションの決済処理量が前年比10倍に成長。' },
  { title: 'テスラ、ビットコイン保有を維持と発表', source: 'Bloomberg', date: '2026/02/03', url: '#', excerpt: 'テスラの四半期決算報告で、同社がビットコインの保有を継続していることが明らかになった。' },
  { title: '韓国、仮想通貨課税を2027年に延期', source: 'CoinPost', date: '2026/02/02', url: '#', excerpt: '韓国政府は仮想通貨のキャピタルゲイン課税の開始を2027年1月に延期する方針を固めた。' }
];

var MOCK_FOREX_NEWS_ALL = [
  { title: '米雇用統計予想上回り、ドル円一時150円台', source: 'ロイター', date: '2026/02/10', url: '#', excerpt: '1月の米雇用統計が市場予想を上回る結果となり、ドル円は一時150円台に上昇した。' },
  { title: 'ECB理事会、据え置き決定もタカ派姿勢', source: 'ブルームバーグ', date: '2026/02/10', url: '#', excerpt: 'ECBは政策金利を据え置いたものの、ラガルド総裁は追加利上げの可能性を示唆。' },
  { title: '日銀、次回会合で追加利上げ検討か', source: '日経新聞', date: '2026/02/09', url: '#', excerpt: '日本銀行が3月の金融政策決定会合で追加利上げを検討する方針であることが関係者への取材で判明。' },
  { title: '豪ドル、RBA議事要旨でハト派転換示唆', source: 'ロイター', date: '2026/02/09', url: '#', excerpt: 'RBA議事要旨でインフレ鈍化への自信が示され、豪ドルが対円で下落。' },
  { title: 'メキシコペソ、中銀の利下げ観測で下落', source: 'Bloomberg', date: '2026/02/08', url: '#', excerpt: 'メキシコ中央銀行の利下げ観測が強まり、ペソは対円で1.5%下落した。' },
  { title: 'トルコリラ、過去最安値を更新', source: 'ロイター', date: '2026/02/08', url: '#', excerpt: 'トルコの高インフレ継続を背景に、リラは対ドルで過去最安値を更新した。' },
  { title: '英中銀、金利据え置きも利下げ示唆', source: 'BBC', date: '2026/02/07', url: '#', excerpt: 'イングランド銀行はMPC会合で金利を据え置いたが、今年中の利下げ開始を示唆。' },
  { title: '中国人民元、PMI改善で反発', source: 'ブルームバーグ', date: '2026/02/07', url: '#', excerpt: '中国の製造業PMIが予想を上回り、人民元は対ドルで0.3%上昇した。' },
  { title: 'スイスフラン、安全資産として買われる', source: 'ロイター', date: '2026/02/06', url: '#', excerpt: '中東情勢の緊迫化を受け、安全資産としてスイスフランが買われている。' },
  { title: 'カナダドル、原油高で上昇', source: 'ブルームバーグ', date: '2026/02/06', url: '#', excerpt: 'WTI原油価格の上昇を追い風に、カナダドルが対円で上昇。' },
  { title: 'FRB議事要旨、利下げ時期の不透明感', source: '日経新聞', date: '2026/02/05', url: '#', excerpt: 'FRB議事要旨では利下げ時期について委員間で意見の相違があることが明らかに。' },
  { title: 'ユーロドル、独経済指標悪化で下落', source: 'ロイター', date: '2026/02/05', url: '#', excerpt: 'ドイツの鉱工業生産が予想を下回り、ユーロドルは1.08台前半に下落。' },
  { title: '南アフリカランド、電力危機で弱含み', source: 'Bloomberg', date: '2026/02/04', url: '#', excerpt: '南アフリカの電力供給不安が継続し、ランドは主要通貨に対して弱含んでいる。' },
  { title: 'NZドル、RBNZ政策決定を前に様子見', source: 'ロイター', date: '2026/02/03', url: '#', excerpt: '来週のRBNZ政策決定会合を前に、NZドルは狭いレンジで推移。' },
  { title: '円安進行、輸入企業に打撃', source: '日経新聞', date: '2026/02/02', url: '#', excerpt: '円安の進行が食品・エネルギーの輸入コスト増加を通じて企業収益を圧迫している。' }
];
