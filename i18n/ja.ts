import base from "./base";

const ja = {
  ...base,
  // API.
  lang: "ja-JP",
  // UI.
  log_in: "ログイン",
  log_in_notice:
    "ホラガイベイはイカリング3にアクセスするために、トークンを取得する必要があります。そのプロセスには、最小限の非識別情報を使用し、任天堂以外のiminkに安全なリクエストを行うことが含まれます。この情報はログする、記録または保存されません。詳しくは、プライバシーポリシーを参照してください。",
  imink_privacy_policy: "imink プライバシーポリシー",
  log_in_continue: "読んで理解しました",
  logging_in: "トークン取得中",
  log_out_notice:
    "ログアウトすると、ホラガイベイに保存されているすべてのデータが削除されます！続行する前にバックアップを完了してください。",
  log_out_continue: "データを削除してログアウト",
  logging_out: "ログアウト中",
  failed_to_check_api_update: "APIのアップデートを確認できませんでした",
  reacquiring_tokens: "トークン再取得中",
  loading_n_results: "%{n}件のリザルトを読み込む中",
  loaded_n_results: "%{n}件のリザルトを読み込みました",
  loaded_n_results_fail_failed: "%{n}件のリザルトを読み込み、%{fail}件は失敗しました",
  loaded_n_results_skip_skipped: "%{n}件のリザルトを読み込み、%{skip}件はスキップしました",
  loaded_n_results_fail_failed_skip_skipped:
    "%{n}件のリザルトを読み込み、%{fail}件は失敗、%{skip}件はスキップしました",
  load_more: "もっと読み込む",
  loading_more: "もっと読み込む中",
  loaded_all: "すべてを読み込みました",
  load_more_notice: "もっと読み込むを長押しして、すべてのリザルトを読み込みます。",
  import: "インポート",
  export: "エクスポート",
  exporting: "エクスポート中",
  disclaimer:
    "当アプリは、イカリング3の情報を利用した非公式アプリであり、任天堂株式会社とは一切関係はございません。",
  support: "サポート",
  alternative_log_in_notice:
    "セッショントークンを持っていて、ホラガイベイによるトークンの取得をスキップしたい場合は、代わりにセッショントークンをコピーしてログインを完了することができます。",
  log_in_with_session_token: "セッショントークンでログイン",
  language_notice:
    "ゲームの言語が表示言語と一致しない場合は、ここで変更できます。これにより、ホラガイベイは対応する言語でリザルトを読み込むことができます。",
  change_game_language_language: "ゲームの言語を変更 (%{language})",
  change_display_language_language: "表示言語を変更 (%{language})",
  relog_in_notice: "ホラガイベイがトークンを取得できない場合は、再ログインできます。",
  relog_in: "再ログイン",
  resource_notice:
    "ホラガイベイが画像を読み込めない場合は、キャッシュを消去するか、リソースを読み込むことができます。イカリング3の制限により、ホラガイベイは一部の画像しか事前に読み込むできないことに注意してください。",
  clear_cache: "キャッシュを消去",
  clearing_cache: "キャッシュを消去中",
  preload_resources: "リソースを読み込む",
  preloading_resources: "リソースを読み込む中",
  feedback_notice:
    "ホラガイベイの使用中に問題が発生した場合、またはアドバイスがある場合は、お気軽にフィードバックをお寄せください。",
  create_a_github_issue: "GitHub Issueを作成",
  send_a_mail: "メールを送る",
  debug_notice: "次の情報はデバッグ専用です。他の人と共有しないでください。",
  copy_session_token: "セッショントークンをコピー",
  copy_bullet_token: "ブレットトークンをコピー",
  export_results: "リザルトをエクスポート",
  export_database: "データーベースをエクスポート",
  privacy_policy: "プライバシーポリシー",
  acknowledgments: "謝辞",
  creators: "クリエーター",
  license: "ライセンス",
  oss_licenses: "オープンソースソフトウェアライセンス",
  first_aid_notice:
    "データベースが壊れているため、ロードできません。リザルトをエクスポートして、ホラガイベイを再インストールしてください。",
  auto_refresh_enabled: "自動更新が有効になりました",
  // Shop.
  gesotown: "ゲソタウン",
  order_in_nintendo_switch_online: "Nintendo Switch Onlineで注文",
  display_owned_gears: "持つギアを表示",
  loading_owned_gears: "持つギアを読み込む中",
  headgear: "アタマ",
  clothes: "フク",
  shoes: "クツ",
  // Friend.
  playing: "試合中",
  working: "バイト中",
  online: "オンライン",
  offline: "オフライン",
  // Filter.
  filter: "フィルター",
  clear_filter: "フィルターを消す",
  // Result.
  n_x_battle: "%{n}倍マッチ",
  n_win_strike: "%{n}連勝",
  score_score: "%{score}カウント",
  knock_out: "ノックアウト！",
  no_contest: "無効試合になりました。",
  penalty: "正常に試合が終了しませんでした。",
  exemption: "通信を切断したプレイヤーがいたため、負けとしてカウントされませんでした。",
  hide_player_names: "プレイヤー名を隠す",
  show_player_names: "プレイヤー名を表示",
  show_raw_data: "生データを表示",
  open_in_nintendo_switch_online: "Nintendo Switch Onlineでチェック",
  // Stats.
  stats: "統計",
  count: "カウント",
  database: "データベース",
  victory: "WIN!",
  defeat: "LOSE...",
  splatted: "たおした",
  be_splatted: "たおされた",
  special_weapon_uses: "スペシャルウェポン発動",
  clear: "Clear!!",
  failure: "Failure",
  waves_cleared: "クリアWAVE",
  boss_salmonids_defeated: "倒したオオモノシャケ",
  golden_eggs_collected: "集めた金イクラ",
  power_eggs_collected: "集めたイクラ",
  rescued: "たすけた",
  be_rescued: "たすけてもらった",
  stats_notice: "現在ロードされているリザルトからの統計。",
  // Modes.
  modes: "モード",
  battle: "バトル",
  regular_battle: "レギュラーマッチ",
  anarchy_battle: "バンカラマッチ",
  anarchy_battle_series: "バンカラマッチ (チャレンジ)",
  anarchy_battle_open: "バンカラマッチ (オープン)",
  x_battle: "Xマッチ",
  private_battle: "プライベートマッチ",
  splatfest_battle: "フェスマッチ",
  tricolor_battle: "トリカラマッチ",
  tableturf_battle: "陣取大戦ナワバトラー",
  "VnNNb2RlLTE=": "レギュラーマッチ",
  "VnNNb2RlLTI=": "バンカラマッチ (チャレンジ)",
  "VnNNb2RlLTM=": "Xマッチ",
  "VnNNb2RlLTU=": "プライベートマッチ",
  "VnNNb2RlLTY=": "フェスマッチ (オープン)",
  "VnNNb2RlLTc=": "フェスマッチ (チャレンジ)",
  "VnNNb2RlLTg=": "トリカラマッチ",
  VnNNb2RlLTUx: "バンカラマッチ (オープン)",
  CHALLENGE: "チャレンジ",
  OPEN: "オープン",
  salmon_run: "サーモンラン",
  big_run: "ビッグラン",
  // Rules.
  rules: "ルール",
  "VnNSdWxlLTA=": "ナワバリバトル",
  "VnNSdWxlLTE=": "ガチエリア",
  "VnNSdWxlLTI=": "ガチヤグラ",
  "VnNSdWxlLTM=": "ガチホコバトル",
  "VnNSdWxlLTQ=": "ガチアサリ",
  "VnNSdWxlLTU=": "トリカラバトル",
  REGULAR: "サーモンラン",
  BIG_RUN: "ビッグラン",
  // Stages.
  stages: "ステージ",
  VnNTdGFnZS0x: "ユノハナ大渓谷",
  VnNTdGFnZS0y: "ゴンズイ地区",
  VnNTdGFnZS0z: "ヤガラ市場",
  VnNTdGFnZS00: "マテガイ放水路",
  VnNTdGFnZS01: "ナンプラー遺跡",
  VnNTdGFnZS02: "ナメロウ金属",
  VnNTdGFnZS03: "クサヤ温泉",
  VnNTdGFnZS05: "ヒラメが丘団地",
  "VnNTdGFnZS0xMA==": "マサバ海峡大橋",
  "VnNTdGFnZS0xMQ==": "キンメダイ美術館",
  "VnNTdGFnZS0xMg==": "マヒマヒリゾート＆スパ",
  "VnNTdGFnZS0xMw==": "海女美術大学",
  "VnNTdGFnZS0xNA==": "チョウザメ造船",
  "VnNTdGFnZS0xNQ==": "ザトウマーケット",
  "VnNTdGFnZS0xNg==": "スメーシーワールド",
  "VnNTdGFnZS0xOA==": "マンタマリア号",
  VnNTdGFnZS0tOTk5: "",
  // Coop stages.
  "Q29vcFN0YWdlLTE=": "シェケナダム",
  "Q29vcFN0YWdlLTI=": "アラマキ砦",
  "Q29vcFN0YWdlLTY=": "難破船ドン・ブラコ",
  "Q29vcFN0YWdlLTc=": "ムニ・エール海洋発電所",
  "Q29vcFN0YWdlLTEwMA==": "スメーシーワールド",
  "Q29vcFN0YWdlLTEwMg==": "海女美術大学",
  "Q29vcFN0YWdlLS05OTk=": "",
  // Weapons.
  weapons: "ブキ",
  "V2VhcG9uLTA=": "ボールドマーカー",
  "V2VhcG9uLTE=": "ボールドマーカーネオ",
  V2VhcG9uLTEw: "わかばシューター",
  V2VhcG9uLTEx: "もみじシューター",
  V2VhcG9uLTIw: "シャープマーカー",
  V2VhcG9uLTIx: "シャープマーカーネオ",
  V2VhcG9uLTMw: "プロモデラーMG",
  V2VhcG9uLTMx: "プロモデラーRG",
  V2VhcG9uLTQw: "スプラシューター",
  V2VhcG9uLTQx: "スプラシューターコラボ",
  V2VhcG9uLTQ1: "ヒーローシューター レプリカ",
  V2VhcG9uLTUw: ".52ガロン",
  V2VhcG9uLTYw: "N-ZAP85",
  V2VhcG9uLTYx: "N-ZAP89",
  V2VhcG9uLTcw: "プライムシューター",
  V2VhcG9uLTcx: "プライムシューターコラボ",
  V2VhcG9uLTgw: ".96ガロン",
  V2VhcG9uLTgx: ".96ガロンデコ",
  V2VhcG9uLTkw: "ジェットスイーパー",
  V2VhcG9uLTkx: "ジェットスイーパーカスタム",
  "V2VhcG9uLTEwMA==": "スペースシューター",
  "V2VhcG9uLTIwMA==": "ノヴァブラスター",
  "V2VhcG9uLTIwMQ==": "ノヴァブラスターネオ",
  "V2VhcG9uLTIxMA==": "ホットブラスター",
  "V2VhcG9uLTIyMA==": "ロングブラスター",
  "V2VhcG9uLTIzMA==": "クラッシュブラスター",
  "V2VhcG9uLTIzMQ==": "クラッシュブラスターネオ",
  "V2VhcG9uLTI0MA==": "ラピッドブラスター",
  "V2VhcG9uLTI0MQ==": "ラピッドブラスターデコ",
  "V2VhcG9uLTI1MA==": "Rブラスターエリート",
  "V2VhcG9uLTMwMA==": "L3リールガン",
  "V2VhcG9uLTMwMQ==": "L3リールガンD",
  "V2VhcG9uLTMxMA==": "H3リールガン",
  "V2VhcG9uLTQwMA==": "ボトルガイザー",
  "V2VhcG9uLTEwMDA=": "カーボンローラー",
  "V2VhcG9uLTEwMDE=": "カーボンローラーデコ",
  "V2VhcG9uLTEwMTA=": "スプラローラー",
  "V2VhcG9uLTEwMTE=": "スプラローラーコラボ",
  "V2VhcG9uLTEwMjA=": "ダイナモローラー",
  "V2VhcG9uLTEwMzA=": "ヴァリアブルローラー",
  "V2VhcG9uLTEwNDA=": "ワイドローラー",
  "V2VhcG9uLTExMDA=": "パブロ",
  "V2VhcG9uLTExMDE=": "パブロ・ヒュー",
  "V2VhcG9uLTExMTA=": "ホクサイ",
  "V2VhcG9uLTIwMDA=": "スクイックリンα",
  "V2VhcG9uLTIwMTA=": "スプラチャージャー",
  "V2VhcG9uLTIwMTE=": "スプラチャージャーコラボ",
  "V2VhcG9uLTIwMjA=": "スプラスコープ",
  "V2VhcG9uLTIwMjE=": "スプラスコープコラボ",
  "V2VhcG9uLTIwMzA=": "リッター4K",
  "V2VhcG9uLTIwNDA=": "4Kスコープ",
  "V2VhcG9uLTIwNTA=": "14式竹筒銃・甲",
  "V2VhcG9uLTIwNjA=": "ソイチューバー",
  "V2VhcG9uLTIwNzA=": "R-PEN/5H",
  "V2VhcG9uLTMwMDA=": "バケットスロッシャー",
  "V2VhcG9uLTMwMDE=": "バケットスロッシャーデコ",
  "V2VhcG9uLTMwMTA=": "ヒッセン",
  "V2VhcG9uLTMwMTE=": "ヒッセン・ヒュー",
  "V2VhcG9uLTMwMjA=": "スクリュースロッシャー",
  "V2VhcG9uLTMwMzA=": "オーバーフロッシャー",
  "V2VhcG9uLTMwNDA=": "エクスプロッシャー",
  "V2VhcG9uLTQwMDA=": "スプラスピナー",
  "V2VhcG9uLTQwMDE=": "スプラスピナーコラボ",
  "V2VhcG9uLTQwMTA=": "バレルスピナー",
  "V2VhcG9uLTQwMjA=": "ハイドラント",
  "V2VhcG9uLTQwMzA=": "クーゲルシュライバー",
  "V2VhcG9uLTQwNDA=": "ノーチラス47",
  "V2VhcG9uLTUwMDA=": "スパッタリー",
  "V2VhcG9uLTUwMDE=": "スパッタリー・ヒュー",
  "V2VhcG9uLTUwMTA=": "スプラマニューバー",
  "V2VhcG9uLTUwMjA=": "ケルビン525",
  "V2VhcG9uLTUwMzA=": "デュアルスイーパー",
  "V2VhcG9uLTUwNDA=": "クアッドホッパーブラック",
  "V2VhcG9uLTYwMDA=": "パラシェルター",
  "V2VhcG9uLTYwMTA=": "キャンピングシェルター",
  "V2VhcG9uLTYwMjA=": "スパイガジェット",
  "V2VhcG9uLTcwMTA=": "トライストリンガー",
  "V2VhcG9uLTcwMjA=": "LACT-450",
  "V2VhcG9uLTgwMDA=": "ジムワイパー",
  "V2VhcG9uLTgwMTA=": "ドライブワイパー",
  // Brands.
  "QnJhbmQtMA==": "バトロイカ",
  "QnJhbmQtMQ==": "アイロニック",
  "QnJhbmQtMg==": "クラーゲス",
  "QnJhbmQtMw==": "ロッケンベルグ",
  "QnJhbmQtNA==": "エゾッコ",
  "QnJhbmQtNQ==": "フォーリマ",
  "QnJhbmQtNg==": "ホッコリー",
  "QnJhbmQtNw==": "ホタックス",
  "QnJhbmQtOA==": "ジモン",
  "QnJhbmQtOQ==": "シグレニ",
  "QnJhbmQtMTA=": "アロメ",
  "QnJhbmQtMTE=": "ヤコ",
  "QnJhbmQtMTU=": "アナアキ",
  "QnJhbmQtMTY=": "エンペリー",
  "QnJhbmQtMTc=": "タタキケンサキ",
  "QnJhbmQtMTg=": "エゾッコリー",
  "QnJhbmQtMTk=": "バラズシ",
  "QnJhbmQtMjA=": "シチリン",
  "QnJhbmQtOTc=": "クマサン商会",
  "QnJhbmQtOTg=": "アタリメイド",
  "QnJhbmQtOTk=": "amiibo",
  // Work suits.
  "Q29vcFVuaWZvcm0tMQ==": "バイトツナギ オレンジ",
  "Q29vcFVuaWZvcm0tMg==": "バイトツナギ グリーン",
  "Q29vcFVuaWZvcm0tMw==": "バイトツナギ イエロー",
  "Q29vcFVuaWZvcm0tNA==": "バイトツナギ ピンク",
  "Q29vcFVuaWZvcm0tNQ==": "バイトツナギ ブルー",
  "Q29vcFVuaWZvcm0tNg==": "バイトツナギ ブラック",
  "Q29vcFVuaWZvcm0tNw==": "バイトツナギ ホワイト",
  "Q29vcFVuaWZvcm0tOA==": "バイトウェーダー オレンジ",
  "Q29vcFVuaWZvcm0tOQ==": "バイトウェーダー ブラック",
  "Q29vcFVuaWZvcm0tMTA=": "バイトウェーダー イエロー",
  "Q29vcFVuaWZvcm0tMTE=": "バイトウェーダー ブラウン",
  // Grades.
  "Q29vcEdyYWRlLTA=": "かけだし",
  "Q29vcEdyYWRlLTE=": "はんにんまえ",
  "Q29vcEdyYWRlLTI=": "いちにんまえ	",
  "Q29vcEdyYWRlLTM=": "じゅくれん	",
  "Q29vcEdyYWRlLTQ=": "たつじん",
  "Q29vcEdyYWRlLTU=": "たつじん+1",
  "Q29vcEdyYWRlLTY=": "たつじん+2",
  "Q29vcEdyYWRlLTc=": "たつじん+3",
  "Q29vcEdyYWRlLTg=": "でんせつ",
  // Waves.
  wave_n: "WAVE %{n}",
  xtrawave: "EX-WAVE",
  // Water levels.
  low_tide: "干潮",
  normal: "普通",
  high_tide: "満潮",
  // Events.
  Q29vcEV2ZW50V2F2ZS00: "ハコビヤ襲来",
  Q29vcEV2ZW50V2F2ZS01: "霧",
  Q29vcEV2ZW50V2F2ZS02: "ドスコイ大量発生",
  Q29vcEV2ZW50V2F2ZS03: "巨大タツマキ",
  Q29vcEV2ZW50V2F2ZS04: "ドロシャケ噴出",
  Q29vcEV2ZW50V2F2ZS0x: "ラッシュ",
  Q29vcEV2ZW50V2F2ZS0y: "キンシャケ探し",
  Q29vcEV2ZW50V2F2ZS0z: "グリル発進",
  // Boss Salmonids.
  boss_salmonids: "オオモノシャケ",
  "Q29vcEVuZW15LTQ=": "バクダン",
  "Q29vcEVuZW15LTU=": "カタパッド",
  "Q29vcEVuZW15LTY=": "テッパン",
  "Q29vcEVuZW15LTc=": "ヘビ",
  "Q29vcEVuZW15LTg=": "タワー",
  "Q29vcEVuZW15LTk=": "モグラ",
  Q29vcEVuZW15LTEw: "コウモリ",
  Q29vcEVuZW15LTEx: "ハシラ",
  Q29vcEVuZW15LTEy: "ダイバー",
  Q29vcEVuZW15LTEz: "テッキュウ",
  Q29vcEVuZW15LTE0: "ナベブタ",
  Q29vcEVuZW15LTE1: "キンシャケ",
  Q29vcEVuZW15LTE3: "グリル",
  Q29vcEVuZW15LTIw: "ドロシャケ",
  // King Salmonids.
  Q29vcEVuZW15LTIz: "ヨコヅナ",
  Q29vcEVuZW15LTI0: "タツ",
};

export default ja;
