import base from "./base";
import generated from "./ja.json";
import locale from "./locales/ja.json";

const ja = {
  ...base,
  ...generated,
  ...locale,
  // API.
  lang: "ja-JP",
  region: "JP",
  // UI.
  log_in: "ログイン",
  log_in_notice:
    "ホラガイベイを使用すると、ログインせずにスケジュールとゲソタウンの表示、リザルトのインポート、統計とトレンドの分析を行うことができます。ログインすると、リザルトとフレンドの読み込み、ギアの表示、イカリング3へのアクセスが可能になります。ログインするには、任天堂外部のiminkまたはnxapiに非識別情報を送信する必要があります。この情報はログする、記録または保存されません。詳しくは、プライバシーポリシーを参照してください。",
  log_in_warning:
    "ホラガイベイによってアカウントが不正使用されたり、個人情報が漏洩したりすることはありません。ただし、任天堂はサードパーティアプリに対して引き続き否定的な姿勢をとっているため、ホラガイベイは自己責任で使してください。",
  log_in_continue: "読んで理解しました",
  alternative_log_in_notice:
    "セッショントークンを持っていて、ホラガイベイによるセッショントークンの取得をスキップしたい場合は、代わりにセッショントークンをコピーしてセッショントークンでログインすることができます。",
  log_in_with_session_token: "セッショントークンでログイン",
  logging_in: "トークン取得中",
  failed_to_acquire_session_token: "セッショントークンを取得できません (%{error})",
  log_out_notice:
    "ログアウト後はリザルトとフレンドの読み込み、ギアの表示、イカリング3へのアクセスができなくなります。ホラガイベイに保存されているリザルトは消去されません。",
  log_out_continue: "ログアウト",
  logging_out: "ログアウト中",
  upgrading_database: "データベースをアップグレード中",
  reacquiring_tokens: "トークン再取得中",
  reacquiring_tokens_with_mudmouth: "Mudmouthを通じてトークン再取得中",
  failed_to_acquire_web_service_token: "Webサービストークンを取得できません (%{error})",
  failed_to_acquire_bullet_token: "ブレットトークンを取得できません (%{error})",
  failed_to_update_schedules: "スケジュールを更新できません (%{error})",
  failed_to_update_splatnet_shop: "ゲソタウンを更新できません (%{error})",
  failed_to_check_api_update: "APIのアップデートを確認できません (%{error})",
  failed_to_load_friends: "フレンドを読み込めません (%{error})",
  failed_to_load_friends_splatfest_voting: "フレンドのフェス投票状況を読み込めません (%{error})",
  failed_to_check_splatfest: "フェスを確認できません (%{error})",
  failed_to_load_summary: "サマリーを読み込めません (%{error})",
  failed_to_load_battle_results: "バトルのリザルトを読み込めません (%{error})",
  failed_to_load_salmon_run_results: "サーモンランのリザルトを読み込めません (%{error})",
  loading_n_results: "%{n}件のリザルトを読み込む中",
  loaded_n_results: "%{n}件のリザルトを読み込みました",
  loaded_n_results_failed: "%{n}件のリザルトを読み込み、%{fail}件は失敗しました (%{error})",
  loaded_n_results_skipped: "%{n}件のリザルトを読み込み、%{skip}件はスキップしました",
  loaded_n_results_skipped_failed:
    "%{n}件のリザルトを読み込み、%{skip}件はスキップ、%{fail}件は失敗しました (%{error})",
  show_more: "もっと見る",
  loading_more: "もっと読み込む中",
  all_results_showed: "すべてのリザルトが表示されました",
  n_results_showed: "%{n}/%{total}件のリザルトが表示されました",
  n_filtered_results_showed:
    "%{n}/%{filtered} (%{total})件フィルタリングされたリザルトが表示されました",
  today: "今日",
  this_week: "今週",
  this_month: "今月",
  this_season: "今シーズン",
  all_results: "すべてのリザルト",
  splatnet: "イカリング",
  splatnet_3: "イカリング3",
  export: "エクスポート",
  exporting: "エクスポート中",
  update_notice:
    "ホラガイベイがアップデートされました。詳しくは、リリースノートを参照してください。",
  go_to_app_store: "App Storeへ",
  go_to_google_play: "Google Playへ",
  release_notes: "リリースノート",
  disclaimer:
    "当アプリは、イカリング3の情報を利用した非公式アプリであり、任天堂株式会社とは一切関係はございません。",
  support: "サポート",
  preference_notice: "ホラガイベイを自分好みにカスタマイズできます。",
  enable: "有効",
  disable: "無効",
  auto_refresh: "自動更新 (%{enable})",
  background_refresh: "バックグラウンド更新 (%{enable})",
  salmon_run_friendly_mode: "サーモンランフレンドリーモード (%{enable})",
  language_notice:
    "ホラガイベイが対応する地域と言語のフェス、リザルト、イカリング3をロードできるように、地域と言語を変更できます。",
  change_game_language: "ゲームの言語を変更 (%{language})",
  change_splatfest_region: "フェス地域を変更 (%{region})",
  japan: "日本",
  the_americas_australia_new_zealand: "アメリカ大陸、オーストラリア、ニュージーランド",
  europe: "ヨーロッパ",
  hong_kong_south_korea: "香港、韓国",
  change_display_language: "表示言語を変更 (%{language})",
  relog_in_notice: "ホラガイベイがトークンを取得できない場合は、再ログインできます。",
  relog_in: "再ログイン",
  relog_in_with_session_token: "セッショントークンで再ログイン",
  relog_in_with_mudmouth: "Mudmouthで再ログイン",
  mudmouth_notice:
    "Mudmouthはネットワーク診断ツールです。ホラガイベイはMudmouthを通じてNintendo Switch Onlineからトークンを取得できます。Mudmouthを有効にするには、Mudmouthアプリ内の手順を参照してください。",
  install_mudmouth: "Mudmouthをインストール",
  add_mudmouth_profile: "Mudmouthのプロファイルを追加",
  log_in_with_mudmouth: "Mudmouthでログイン (%{enable})",
  resource_notice:
    "ホラガイベイが画像を読み込めない場合は、キャッシュを消去するか、リソースを読み込むことができます。イカリング3の制限により、ホラガイベイは一部の画像しか事前に読み込むできないことに注意してください。",
  clear_cache: "キャッシュを消去",
  clearing_cache: "キャッシュを消去中",
  preload_resources: "リソースを読み込む",
  preloading_resources: "リソースを読み込む中",
  feedback_notice:
    "ホラガイベイの使用中にエラーが発生した場合、またはアドバイスがある場合は、お気軽にフィードバックをお寄せください。",
  read_conch_bay_wiki: "ホラガイベイ百科を読む",
  create_a_github_issue: "GitHub Issueを作成",
  send_a_mail: "メールを送る",
  join_discord_server: "Discordサーバーに参加",
  join_the_beta_version: "ベータ版に参加",
  database_notice:
    "データベースを消去したい場合は、データーベースを消去を長押ししてください。続行する前に、バックアップを完了してください。",
  clear_database: "データーベースを消去",
  clearing_database: "データーベースを消去中",
  debug_notice:
    "デバッグ情報の漏洩により、アカウントが不正使用されたり、個人情報が漏洩したりする可能性があります。デバッグが必要な場合は、デバッグを有効を長押しし、デバッグ情報を他の人と共有しないでください。",
  enable_debugging: "デバッグを有効",
  copy_session_token: "セッショントークンをコピー",
  copy_web_service_token: "Webサービストークンをコピー",
  copy_bullet_token: "ブレットトークンをコピー",
  copied_to_clipboard: "クリップボードにコピーされました",
  export_configuration: "設定をエクスポート",
  export_database: "データーベースをエクスポート",
  privacy_policy: "プライバシーポリシー",
  acknowledgments: "謝辞",
  creators: "クリエーター",
  license: "ライセンス",
  oss_licenses: "オープンソースソフトウェアライセンス",
  source_code_repository: "ソースコードリポジトリ",
  welcome_tip:
    "ホラガイベイへようこそ。ホラガイベイの使用中にエラーが発生した場合、またはアドバイスがある場合は、お気軽にフィードバックをお寄せください。ホームページ下のサポートにあるGitHub Issue、メール、またはDiscordサーバーを通じて、いつでもご連絡いただけます。",
  mudmouth_tip:
    "ホラガイベイへようこそ。ホラガイベイはMudmouthを通じてトークンの取得をサポートしています。アバターを押すと、Mudmouthを有効にできます。詳しくは、ホラガイベイ百科を参照してください。",
  auto_refresh_enabled: "自動更新が有効になりました",
  auto_refresh_disabled: "自動更新が無効になりました",
  notification_notice:
    "ホラガイベイがバックグラウンドで実行されている場合、ホラガイベイは定期的にリザルトを読み込みます。ホラガイベイが読み込みステータスを通知する通知を送信できるようにしてください。",
  ok: "OK",
  failed_to_enable_background_refresh: "バックグラウンド更新を有効できません (%{error})",
  new_results: "新しいリザルト",
  loaded_n_results_in_the_background:
    "ホラガイベイはバックグラウンドで%{n}件のリザルトを読み込みました。アプリを開いてご確認ください。",
  sorry: "ごめんなさい",
  sorry_notice:
    "ホラかいベイでエラーが発生しました。アプリの更新を確認して、アプリを再起動してください。このエラーが引き続き発生する場合は、ご連絡ください。",
  error_report: "エラーレポート",
  error_description: "このエラーが発生する前に何をしていたか説明していただけますか？",
  version: "バージョン",
  error_information: "エラー情報",
  export_results: "リザルトをエクスポート",
  // Shop.
  gesotown: "ゲソタウン",
  shop_notice: "ギアはホームページ下のイカリング3から注文できます。",
  // Friend.
  playing: "試合中",
  working: "バイト中",
  online: "オンライン",
  offline: "オフライン",
  // Filter.
  filter: "フィルター",
  players: "プレーヤー",
  modes: "モード",
  rules: "ルール",
  stages: "ステージ",
  weapons: "ブキ",
  clear_filter: "フィルターを消す",
  filter_notice: "フィルターボタンを長押しするとフィルターをクリアできます。",
  // Result.
  n_x_battle: "%{n}倍マッチ",
  conch_clash: "ホラガイ争奪戦",
  n_x_conch_clash: "%{n}倍ホラガイ争奪戦",
  n_win_strike: "%{n}連勝",
  score_n: "%{score}カウント",
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
  splatfest_power: "フェスパワー",
  clout: "こうけん度",
  synergy_bonus: "おそろいボーナス",
  festival_shell: "オマツリガイ",
  played_time: "遊んだ日時",
  medals_earned: "ゲットした表彰",
  title: "%{adjective}%{subject}",
  boss_salmonids: "オオモノシャケ",
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
  share_image: "写真をシェア",
  show_raw_data: "生データを表示",
  view_battles_and_jobs_with_this_player: "このプレイヤーとのバトルとバイトを表示",
  failed_to_view_battles_and_jobs_with_this_player:
    "このプレイヤーとのバトルとバイトを表示できません",
  analyze_build: "ギア構成を分析",
  view_x_rankings: "Xランキングを表示",
  checking_x_rankings: "Xランキングをチェック中",
  failed_to_check_x_rankings: "Xランキングをチェックできません",
  self: "自分",
  team: "チーム",
  // Stats.
  stats: "統計",
  default: "デフォルト",
  appearance: "出現数",
  win_rate: "勝率",
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
  scales: "ウロコ",
  golden_eggs_collected: "集めた金イクラ",
  power_eggs_collected: "集めたイクラ",
  rescued: "たすけた",
  be_rescued: "たすけてもらった",
  wave_stats: "WAVEのきろく",
  supplied_special_weapons: "支給スペシャルウェポン",
  stats_notice: "カッコ内の数字はバトルでは1分あたり、サーモンランでは各バイトのアベレージです。",
  stats_notice2:
    "ホームページ上のリザルトグループのタイトルを押すと、リザルトグループの統計が表示されます。",
  // Trend.
  trends: "トレンド",
  recent: "最近",
  average: "平均",
  splatted_including_assisted: "たおした (アシスト含む)",
  golden_eggs_collected_including_assisted: "集めた金イクラ (含助攻)",
  trends_notice: "数字はバトルでは1分あたり、サーモンランでは各バイトのアベレージです。",
  trends_notice2: "タグを長押しして、チームのアベレージが表示されます。",
  // Rotations.
  rotations: "ローテーション",
  // Gears.
  gears: "ギア",
  failed_to_load_gears: "ギアを読み込めません (%{error})",
  headgear: "アタマ",
  clothes: "フク",
  shoes: "クツ",
  brand: "ブランド",
  ability: "ギアパワー",
  // Import.
  import: "インポート",
  importing: "インポート中",
  import_notice:
    "ホラガイベイはホラガイベイによってエクスポートされたリザルトのインポートをサポートしており、他のサードパーティアプリによってエクスポートされたリザルトをホラガイベイでサポートされている形式に変換してインポートすることもできます。",
  convert_s3s_outputs: "s3sによってエクスポートされたリザルトを変換",
  convert_stat_ink_salmon_run_json: "stat.inkサーモンランJSONを変換",
  import_ikawidget3_ikax3: "ikawidget3 IKAX3をインポート",
  import_salmdroidnw_backup: "salmdroidNWバックアップをインポート",
  "import_salmonia3+_backup": "Salmonia3+バックアップをインポート",
  import_ikawidget3_ikax3_notice:
    "ikawidget3に書き出してインポートしてください。IKAX3には暗号化されたデータが含まれているため、一部の情報が正確ではない可能性があることに注意してください。",
  import_salmdroidnw_backup_notice: "salmdroidNWにバックアップしてインポートしてください。",
  "import_salmonia3+_backup_notice":
    "Salmonia3+にバックアップしてインポートしてください。Salmonia3+のバックアップにはリザルトのすべてのデータが含まれていないため、一部の情報が欠落している可能性があることに注意してください。",
  random: "ランダム",
  split_and_import_notice:
    "ホラガイベイはリザルトをインポートするために大量のメモリを必要とします。ホラガイベイがリザルトをインポートできない場合は、リザルトを分割してインポートできます。分割してインポートするには数分から数十分かかりますのでご注意ください。",
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
  splatfest_battle_open: "フェスマッチ (オープン)",
  splatfest_battle_pro: "フェスマッチ (チャレンジ)",
  tricolor_battle: "トリカラマッチ",
  tableturf_battle: "ナワバトラー",
  salmon_run: "サーモンラン",
  big_run: "ビッグラン",
  eggstra_work: "バイトチームコンテスト",
  // Rules.
  splat_zones: "ガチエリア",
  tower_control: "ガチヤグラ",
  rainmaker: "ガチホコバトル",
  clam_blitz: "ガチアサリ",
  REGULAR: "サーモンラン",
  BIG_RUN: "ビッグラン",
  TEAM_CONTEST: "バイトチームコンテスト",
  // Waves.
  wave_n: "WAVE %{n}",
  xtrawave: "EX-WAVE",
  // Water levels.
  low_tide: "干潮",
  normal: "普通",
  high_tide: "満潮",
  // Escaped.
  "VnNTdGFnZS0tMQ==": "ランダム",
  VnNTdGFnZS0tOTk5: "",
  Q29vcFN0YWdlLS0x: "各地で同時発生",
  "Q29vcFN0YWdlLS05OTk=": "",
  "TGVhZ3VlTWF0Y2hFdmVudC1Ob3RGb3VuZA==": "",
  Q29vcEVuZW15LTMw: "オカシラ連合",
  Q29vcEVuZW15LTMx: "ランダム",
};

export default ja;
