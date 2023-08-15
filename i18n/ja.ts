import base from "./base";
import generated from "./ja.json";

const ja = {
  ...base,
  ...generated,
  // API.
  lang: "ja-JP",
  // UI.
  upgrading_database: "データベースをアップグレード中",
  log_in: "ログイン",
  log_in_notice:
    "ホラガイベイはイカリング3にアクセスするために、トークンを取得する必要があります。そのプロセスには、最小限の非識別情報を使用し、任天堂以外のiminkまたはnxapiに安全なリクエストを行うことが含まれます。この情報はログする、記録または保存されません。詳しくは、プライバシーポリシーを参照してください。",
  log_in_continue: "読んで理解しました",
  alternative_log_in_notice:
    "セッショントークンを持っていて、ホラガイベイによるトークンの取得をスキップしたい場合は、代わりにセッショントークンをコピーしてログインを完了することもできます。",
  log_in_with_session_token: "セッショントークンでログイン",
  logging_in: "トークン取得中",
  failed_to_acquire_session_token: "セッショントークンを取得できません (%{error})",
  log_out_notice:
    "ログアウト後はリザルト、フレンドとカタログの読み込み、持つギアの表示、イカリング3へのアクセスができなくなります。ホラガイベイに保存されているリザルトは消去されません。",
  log_out_continue: "ログアウト",
  logging_out: "ログアウト中",
  failed_to_check_update: "ホラガイベイのアップデートを確認できません",
  reacquiring_tokens: "トークン再取得中",
  failed_to_acquire_web_service_token: "Webサービストークンを取得できません (%{error})",
  failed_to_acquire_bullet_token: "ブレットトークンを取得できません (%{error})",
  failed_to_update_schedules: "スケジュールを更新できません (%{error})",
  failed_to_update_splatnet_shop: "ゲソタウンを更新できません (%{error})",
  failed_to_check_api_update: "APIのアップデートを確認できません (%{error})",
  failed_to_load_friends: "フレンドを読み込めません (%{error})",
  failed_to_load_friends_splatfest_voting: "フレンドのフェス投票状況を読み込めません (%{error})",
  failed_to_check_splatfest: "フェスを確認できません (%{error})",
  failed_to_load_summary: "サマリーを読み込めません (%{error})",
  failed_to_load_catalog: "カタログを読み込めません (%{error})",
  failed_to_load_battle_results: "バトルのリザルトを読み込めません (%{error})",
  failed_to_load_salmon_run_results: "サーモンランのリザルトを読み込めません (%{error})",
  loading_n_results: "%{n}件のリザルトを読み込む中",
  loaded_n_results: "%{n}件のリザルトを読み込みました",
  loaded_n_results_fail_failed: "%{n}件のリザルトを読み込み、%{fail}件は失敗しました (%{error})",
  loaded_n_results_skip_skipped: "%{n}件のリザルトを読み込み、%{skip}件はスキップしました",
  loaded_n_results_skip_skipped_fail_failed:
    "%{n}件のリザルトを読み込み、%{skip}件はスキップ、%{fail}件は失敗しました (%{error})",
  show_more: "もっと見る",
  loading_more: "もっと読み込む中",
  all_results_showed: "すべてのリザルトが表示されました",
  current_battle_schedule: "いまのバトルスケジュール",
  current_salmon_run_schedule: "いまのサーモンランスケジュール",
  n_total_results_showed: "%{n}/%{total}件のリザルトが表示されました",
  n_filtered_total_filtered_results_showed:
    "%{n}/%{filtered} (%{total})件フィルタリングされたリザルトが表示されました",
  today: "今日",
  this_week: "今週",
  this_month: "今月",
  this_season: "今シーズン",
  all_results: "すべてのリザルト",
  show_more_notice: "もっと見るを長押しして、指定期間のリザルトを表示します。",
  splatnet: "イカリング",
  splatnet_3: "イカリング3",
  export: "エクスポート",
  exporting: "エクスポート中",
  disclaimer:
    "当アプリは、イカリング3の情報を利用した非公式アプリであり、任天堂株式会社とは一切関係はございません。",
  update: "アップデート",
  support: "サポート",
  language_notice:
    "ゲームの言語が表示言語と一致しない場合は、ここで変更できます。これにより、ホラガイベイは対応する言語でリザルトを読み込むことができます。",
  change_game_language_language: "ゲームの言語を変更 (%{language})",
  change_display_language_language: "表示言語を変更 (%{language})",
  relog_in_notice: "ホラガイベイがトークンを取得できない場合は、再ログインできます。",
  relog_in: "再ログイン",
  relog_in_with_session_token: "セッショントークンで再ログイン",
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
  diagnose_network: "ネットワークを診断",
  diagnosing_network: "ネットワークを診断中",
  copy_session_token: "セッショントークンをコピー",
  copy_web_service_token: "Webサービストークンをコピー",
  copy_bullet_token: "ブレットトークンをコピー",
  copied_to_clipboard: "クリップボードにコピーされました",
  export_results: "リザルトをエクスポート",
  export_database: "データーベースをエクスポート",
  privacy_policy: "プライバシーポリシー",
  acknowledgments: "謝辞",
  creators: "クリエーター",
  license: "ライセンス",
  oss_licenses: "オープンソースソフトウェアライセンス",
  source_code_repository: "ソースコードリポジトリ",
  first_aid_notice:
    "データベースが壊れているため、ロードできません。リザルトをエクスポートして、ホラガイベイを再インストールしてください。",
  auto_refresh_enabled: "自動更新が有効になりました",
  auto_refresh_disabled: "自動更新が無効になりました",
  background_refresh_notice:
    "ホラガイベイがバックグラウンドで実行されている場合、ホラガイベイは定期的にリザルトを読み込みます。ホラガイベイが読み込みステータスを通知する通知を送信できるようにしてください。",
  ok: "OK",
  failed_to_enable_background_refresh: "バックグラウンド更新を有効できません (%{error})",
  new_results: "新しいリザルト",
  loaded_n_results_in_the_background:
    "ホラガイベイはバックグラウンドで%{n}件のリザルトを読み込みました。アプリを開いてご確認ください。",
  // Shop.
  gesotown: "ゲソタウン",
  order_in_nintendo_switch_online: "Nintendo Switch Onlineで注文",
  show_owned_gears: "持つギアを表示",
  loading_owned_gears: "持つギアを読み込む中",
  failed_to_load_owned_gears: "持つギアを読み込めません (%{error})",
  headgear: "アタマ",
  clothes: "フク",
  shoes: "クツ",
  shop_notice: "ギアはホームページ下のイカリング3から注文できます。",
  // Friend.
  playing: "試合中",
  working: "バイト中",
  online: "オンライン",
  offline: "オフライン",
  // Filter.
  filter: "フィルター",
  modes: "モード",
  rules: "ルール",
  stages: "ステージ",
  weapons: "ブキ",
  clear_filter: "フィルターを消す",
  // Result.
  n_x_battle: "%{n}倍マッチ",
  n_win_strike: "%{n}連勝",
  score_score: "%{score}カウント",
  knock_out: "ノックアウト！",
  no_contest: "無効試合になりました。",
  penalty: "正常に試合が終了しませんでした。",
  exemption: "通信を切断したプレイヤーがいたため、負けとしてカウントされませんでした。",
  details: "詳細データ",
  rule: "ルール",
  stage: "ステージ",
  rank_points: "ウデマエポイント",
  anarchy_power: "バンカラパワー",
  x_power: "Xパワー",
  challenge_e: "イベント",
  challenge_power: "イベントパワー",
  clout: "こうけん度",
  festival_shell: "オマツリガイ",
  splatfest_power: "フェスパワー",
  played_time: "遊んだ日時",
  medals_earned: "ゲットした表彰",
  hazard_level: "キケン度",
  supplied_weapons: "支給ブキ",
  job_title: "バイト称号",
  your_points: "獲得ポイント",
  job_score: "バイトスコア",
  pay_grade: "評価レート",
  clear_bonus: "クリアボーナス",
  salmometer: "オカシラゲージ",
  scenario_code: "シナリオコード",
  hide_player_names: "プレイヤー名を隠す",
  show_player_names: "プレイヤー名を表示",
  show_raw_data: "生データを表示",
  open_in_nintendo_switch_online: "Nintendo Switch Onlineでチェック",
  self: "自分",
  team: "チーム",
  // Stats.
  stats: "統計",
  all: "すべて",
  day: "日",
  week: "週",
  month: "月",
  season: "シーズン",
  victory: "WIN!",
  defeat: "LOSE...",
  power: "パワー",
  turf_inked: "塗った面積",
  splatted: "たおした",
  be_splatted: "たおされた",
  special_weapon_uses: "スペシャルウェポン発動",
  stage_stats: "ステージのきろく",
  weapon_stats: "ブキのきろく",
  clear: "Clear!!",
  failure: "Failure",
  waves_cleared: "クリアWAVE",
  boss_salmonids_defeated: "倒したオオモノシャケ",
  king_salmonids_defeated: "倒したオカシラシャケ",
  golden_eggs_collected: "集めた金イクラ",
  power_eggs_collected: "集めたイクラ",
  rescued: "たすけた",
  be_rescued: "たすけてもらった",
  wave_stats: "WAVEのきろく",
  supplied_special_weapons: "支給スペシャルウェポン",
  stats_notice: "カッコ内の数字はバトルでは1分あたり、サーモンランでは各バイトのアベレージです。",
  // Trend.
  trends: "トレンド",
  recent: "最近",
  average: "平均",
  splatted_including_assisted: "たおした (アシスト含む)",
  golden_eggs_collected_including_assisted: "集めた金イクラ (含助攻)",
  trends_notice: "数字はバトルでは1分あたり、サーモンランでは各バイトのアベレージです。",
  trends_notice2: "タグを長押しして、チームのアベレージが表示されます。",
  // Import.
  import: "インポート",
  importing: "インポート中",
  import_notice:
    "ホラガイベイはホラガイベイによってエクスポートされたリザルトのインポートをサポートしており、他のサードパーティアプリによってエクスポートされたリザルトをホラガイベイでサポートされている形式に変換してインポートすることもできます。また、ホームページ下のサポートからもお問い合わせいただけます。",
  convert_s3s_outputs: "s3sによってエクスポートされたリザルトを変換",
  convert_stat_ink_salmon_run_json: "stat.inkサーモンランJSONを変換",
  convert_ikawidget3_ikax3: "ikawidget3 IKAX3を変換",
  convert_salmdroidnw_backup: "salmdroidNWバックアップを変換",
  "convert_salmonia3+_backup": "Salmonia3+バックアップを変換",
  split_and_import_notice:
    "ホラガイベイはリザルトをインポートするために大量のメモリを必要とします。ホラガイベイがリザルトをインポートできない場合は、リザルトを分割してインポートできます。分割してインポートするには数分から数十分かかりますのでご注意ください。また、ホームページ下のサポートからもお問い合わせいただけます。",
  split_and_import: "分割してインポート",
  // Modes.
  battle: "バトル",
  regular_battle: "レギュラーマッチ",
  anarchy_battle: "バンカラマッチ",
  anarchy_battle_series: "バンカラマッチ (チャレンジ)",
  anarchy_battle_open: "バンカラマッチ (オープン)",
  x_battle: "Xマッチ",
  challenge_b: "イベントマッチ",
  private_battle: "プライベートマッチ",
  splatfest_battle: "フェスマッチ",
  tricolor_battle: "トリカラマッチ",
  tableturf_battle: "陣取大戦ナワバトラー",
  "VnNNb2RlLTE=": "レギュラーマッチ",
  "VnNNb2RlLTI=": "バンカラマッチ (チャレンジ)",
  "VnNNb2RlLTM=": "Xマッチ",
  "VnNNb2RlLTQ=": "イベントマッチ",
  "VnNNb2RlLTU=": "プライベートマッチ",
  "VnNNb2RlLTY=": "フェスマッチ (オープン)",
  "VnNNb2RlLTc=": "フェスマッチ (チャレンジ)",
  "VnNNb2RlLTg=": "トリカラマッチ",
  VnNNb2RlLTUx: "バンカラマッチ (オープン)",
  CHALLENGE: "チャレンジ",
  OPEN: "オープン",
  salmon_run: "サーモンラン",
  big_run: "ビッグラン",
  eggstra_work: "バイトチームコンテスト",
  // Rules.
  "VnNSdWxlLTA=": "ナワバリバトル",
  "VnNSdWxlLTE=": "ガチエリア",
  "VnNSdWxlLTI=": "ガチヤグラ",
  "VnNSdWxlLTM=": "ガチホコバトル",
  "VnNSdWxlLTQ=": "ガチアサリ",
  "VnNSdWxlLTU=": "トリカラバトル",
  splat_zones: "ガチエリア",
  tower_control: "ガチヤグラ",
  rainmaker: "ガチホコバトル",
  clam_blitz: "ガチアサリ",
  REGULAR: "サーモンラン",
  BIG_RUN: "ビッグラン",
  TEAM_CONTEST: "バイトチームコンテスト",
  // Stages and coop stages.
  VnNTdGFnZS0tOTk5: "",
  "Q29vcFN0YWdlLS05OTk=": "",
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
  Q29vcEV2ZW50V2F2ZS0x: "ラッシュ",
  Q29vcEV2ZW50V2F2ZS0y: "キンシャケ探し",
  Q29vcEV2ZW50V2F2ZS0z: "グリル発進",
  Q29vcEV2ZW50V2F2ZS00: "ハコビヤ襲来",
  Q29vcEV2ZW50V2F2ZS01: "霧",
  Q29vcEV2ZW50V2F2ZS02: "ドスコイ大量発生",
  Q29vcEV2ZW50V2F2ZS03: "巨大タツマキ",
  Q29vcEV2ZW50V2F2ZS04: "ドロシャケ噴出",
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
