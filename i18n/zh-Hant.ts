import base from "./base";

const zhHant = {
  ...base,
  // API.
  lang: "zh-TW",
  // UI.
  log_in: "登錄",
  log_in_notice:
    "法螺灣需要獲取令牌以訪問魷魚圈3。該過程涉及向非任天堂的imink或nxapi發送含有最少的非身份資訊的安全請求。這些資訊不會被記錄或存儲，請參閱私隱政策以獲取更多資訊。",
  log_in_continue: "我已閱讀並理解",
  alternative_log_in_notice:
    "如果您擁有會話令牌並希望跳過由法螺灣獲取令牌，您也可以複製會話令牌並完成登錄。",
  log_in_with_session_token: "通過會話令牌登錄",
  logging_in: "獲取令牌中",
  failed_to_acquire_session_token: "未能獲取會話令牌 (%{error})",
  log_out_notice: "登出將清除法螺灣所有存儲的數據！請在繼續之前完成備份。",
  log_out_continue: "清除數據並登出",
  logging_out: "登出中",
  failed_to_check_update: "未能檢查法螺灣更新",
  reacquiring_tokens: "重新獲取令牌中",
  failed_to_acquire_web_service_token: "未能獲取Web服務令牌 (%{error})",
  failed_to_acquire_bullet_token: "未能獲取Bullet令牌 (%{error})",
  failed_to_update_schedules: "未能更新時間表 (%{error})",
  failed_to_update_splatnet_shop: "未能更新魷魚鬚商城 (%{error})",
  failed_to_check_api_update: "未能檢查API更新 (%{error})",
  failed_to_load_friends: "未能載入朋友 (%{error})",
  failed_to_load_friends_splatfest_voting: "未能載入朋友的祭典投票狀況 (%{error})",
  failed_to_check_splatfest: "未能檢查祭典 (%{error})",
  failed_to_load_summary: "未能載入總覽 (%{error})",
  failed_to_load_catalog: "未能載入目錄 (%{error})",
  failed_to_load_battle_results: "未能載入對戰記錄 (%{error})",
  failed_to_load_salmon_run_results: "未能載入鮭魚跑記錄 (%{error})",
  loading_n_results: "載入%{n}項記錄中",
  loaded_n_results: "已載入%{n}項記錄",
  loaded_n_results_fail_failed: "已載入%{n}項記錄，%{fail}項失敗 (%{error})",
  loaded_n_results_skip_skipped: "已載入%{n}項記錄，%{skip}項跳過",
  loaded_n_results_skip_skipped_fail_failed:
    "已載入%{n}項記錄，%{skip}項跳過，%{fail}項失敗 (%{error})",
  show_more: "顯示更多",
  loading_more: "載入更多中",
  all_results_showed: "已顯示全部記錄",
  current_battle_schedule: "現在的對戰時間表",
  current_salmon_run_schedule: "現在的鮭魚跑時間表",
  n_total_results_showed: "已顯示%{n}/%{total}項記錄",
  n_filtered_total_filtered_results_showed: "已顯示%{n}/%{filtered} (%{total})項篩選的記錄",
  today: "今日",
  this_week: "本週",
  this_month: "本月",
  this_season: "本賽季",
  all_results: "所有記錄",
  show_more_notice: "長按顯示更多以顯示指定時間段內的記錄。",
  import: "匯入",
  importing: "匯入中",
  import_notice:
    "法螺灣支持匯入由法螺灣匯出的記錄，您也可以將其它第三方App匯出的記錄轉換至法螺灣支援的格式並匯入。此外，法螺灣需要佔用大量的內存以匯入記錄。如果法螺灣無法匯入記錄，您可以分割記錄並匯入。",
  convert_s3s_outputs: "轉換s3s匯出的記錄",
  convert_stat_ink_salmon_run_json: "轉換stat.ink鮭魚跑JSON",
  convert_ikawidget3_ikax3: "轉換ikawidget3 IKAX3",
  convert_salmdroidnw_backup: "轉換salmdroidNW備份",
  "convert_salmonia3+_backup": "轉換Salmonia3+備份",
  split_results: "分割記錄",
  export: "匯出",
  exporting: "匯出中",
  export_notice:
    "法螺灣需要佔用大量的內存以匯出記錄。如果法螺灣無法匯出記錄，您可以分割並匯出記錄。",
  split_and_export: "分割並匯出",
  disclaimer: "本應用是使用魷魚圈3的資訊的非官方應用，與任天堂有限公司無關。",
  update: "更新",
  support: "支援",
  language_notice:
    "如果您的遊戲語言與顯示語言不一致，您可以在此修改。這將使法螺灣載入對應語言的記錄。",
  change_game_language_language: "修改遊戲語言 (%{language})",
  change_display_language_language: "修改顯示語言 (%{language})",
  relog_in_notice: "如果法螺灣無法獲取令牌，您可以重新登錄。",
  relog_in: "重新登錄",
  relog_in_with_session_token: "通過會話令牌重新登錄",
  resource_notice:
    "如果法螺灣無法載入圖片，您可以清除緩存或預載入資源。請注意，由於魷魚圈3的限制，法螺灣僅能預載入部分圖片。",
  clear_cache: "清除緩存",
  clearing_cache: "清除緩存中",
  preload_resources: "預載入資源",
  preloading_resources: "預載入資源中",
  feedback_notice: "如果您在使用法螺灣時遇到任何問題或有任何建議，請隨時分享您的反饋。",
  create_a_github_issue: "創建GitHub Issue",
  send_a_mail: "發送郵件",
  debug_notice: "以下資訊僅用於調試。請不要與他人分享。",
  copy_session_token: "複製會話令牌",
  copy_web_service_token: "複製Web服務令牌",
  copy_bullet_token: "複製Bullet令牌",
  copied_to_clipboard: "已復製到剪貼板",
  export_results: "匯出記錄",
  split_and_export_results: "分割並匯出記錄",
  export_database: "匯出資料庫",
  privacy_policy: "私隱政策",
  acknowledgments: "致謝",
  creators: "創作者",
  license: "許可",
  oss_licenses: "開源軟體許可",
  source_code_repository: "源代碼庫",
  first_aid_notice: "資料庫已損壞並無法載入。請匯出記錄並重新安裝法螺灣。",
  auto_refresh_enabled: "已啟用自動刷新",
  auto_refresh_disabled: "已停用自動刷新",
  background_refresh_notice:
    "當法螺灣運行於背景時，法螺灣將定期載入記錄。請允許法螺灣傳送通知以提醒您載入狀況。",
  ok: "OK",
  failed_to_enable_background_refresh: "未能啟用背景重新整理 (%{error})",
  new_results: "新記錄",
  loaded_n_results_in_the_background: "法螺灣已在背景載入%{n}項記錄，請打開App以確認。",
  // Shop.
  gesotown: "魷魚鬚商城",
  order_in_nintendo_switch_online: "在Nintendo Switch Online中預訂",
  show_owned_gears: "显示持有的裝備",
  loading_owned_gears: "載入持有的裝備中",
  failed_to_load_owned_gears: "未能載入持有的裝備 (%{error})",
  headgear: "頭部裝備",
  clothes: "服裝",
  shoes: "鞋子",
  // Friend.
  playing: "比賽中",
  working: "打工中",
  online: "線上",
  offline: "離線",
  // Filter.
  filter: "篩選",
  clear_filter: "清除篩選",
  // Result.
  n_x_battle: "%{n}倍比賽",
  n_win_strike: "%{n}連勝",
  score_score: "%{score}計數",
  knock_out: "完勝！",
  no_contest: "本次對戰已被判定為無效比賽。",
  penalty: "比賽未能正常結束。",
  exemption: "因有玩家中斷連線，比賽結果不會以落敗計算。",
  details: "詳細數據",
  rule: "規則",
  stage: "場地",
  rank_points: "技術點數",
  anarchy_power: "蠻頹戰力",
  x_power: "X戰力",
  challenge_e: "活動",
  challenge_power: "活動戰力",
  clout: "貢獻度",
  festival_shell: "祭典貝",
  splatfest_power: "祭典戰力",
  played_time: "遊戲時間",
  medals_earned: "獲得的表揚",
  hazard_level: "危險度",
  supplied_weapons: "派發武器",
  job_title: "打工稱號",
  your_points: "獲得點數",
  job_score: "打工分數",
  pay_grade: "評價倍率",
  clear_bonus: "完成獎勵",
  salmometer: "頭目槽",
  scenario_code: "劇本代碼",
  hide_player_names: "隱藏玩家名稱",
  show_player_names: "顯示玩家名稱",
  show_raw_data: "顯示原始數據",
  open_in_nintendo_switch_online: "在Nintendo Switch Online中查看",
  // Stats.
  stats: "統計",
  victory: "WIN!",
  defeat: "LOSE...",
  power: "戰力",
  turf_inked: "塗墨面積",
  splatted: "擊倒",
  be_splatted: "陣亡",
  special_weapon_uses: "特殊武器發動",
  clear: "Clear!!",
  failure: "Failure",
  waves_cleared: "完成WAVE",
  boss_salmonids_defeated: "擊倒的巨大鮭魚",
  king_salmonids_defeated: "擊倒的頭目鮭魚",
  golden_eggs_collected: "收集的金鮭魚卵",
  power_eggs_collected: "收集的鮭魚卵",
  rescued: "救援",
  be_rescued: "被救助",
  stats_notice: "由當前已顯示的記錄統計。括號內的數字對戰為每分鐘，鮭魚跑為每次打工的平均值。",
  // Trend.
  trends: "趨勢",
  average: "平均",
  day: "日",
  week: "周",
  month: "月",
  season: "赛季",
  splatted_including_assisted: "擊倒 (含助攻)",
  golden_eggs_collected_including_assisted: "收集的金鮭魚卵 (含助攻)",
  trends_notice: "由當前已顯示的記錄統計。對戰為每分鐘，鮭魚跑為每次打工的平均值。",
  trends_notice2: "長按標籤以顯示團隊平均值。",
  // Modes.
  modes: "模式",
  battle: "對戰",
  regular_battle: "一般比賽",
  anarchy_battle: "蠻頹比賽",
  anarchy_battle_series: "蠻頹比賽 (挑戰)",
  anarchy_battle_open: "蠻頹比賽 (開放)",
  x_battle: "X比賽",
  challenge_b: "活動比賽",
  private_battle: "私人比賽",
  splatfest_battle: "祭典比賽",
  tricolor_battle: "三色奪寶比賽",
  tableturf_battle: "占地鬥士",
  "VnNNb2RlLTE=": "一般比賽",
  "VnNNb2RlLTI=": "蠻頹比賽 (挑戰)",
  "VnNNb2RlLTM=": "X比賽",
  "VnNNb2RlLTQ=": "活動比賽",
  "VnNNb2RlLTU=": "私人比賽",
  "VnNNb2RlLTY=": "祭典比賽 (開放)",
  "VnNNb2RlLTc=": "祭典比賽 (挑戰)",
  "VnNNb2RlLTg=": "三色奪寶比賽",
  VnNNb2RlLTUx: "蠻頹比賽 (開放)",
  CHALLENGE: "挑戰",
  OPEN: "開放",
  salmon_run: "鮭魚跑",
  big_run: "大型跑",
  eggstra_work: "團隊打工競賽",
  // Rules.
  rules: "規則",
  "VnNSdWxlLTA=": "占地對戰",
  "VnNSdWxlLTE=": "真格區域",
  "VnNSdWxlLTI=": "真格塔樓",
  "VnNSdWxlLTM=": "真格魚虎對戰",
  "VnNSdWxlLTQ=": "真格蛤蜊",
  "VnNSdWxlLTU=": "三色奪寶對戰",
  splat_zones: "真格區域",
  tower_control: "真格塔樓",
  rainmaker: "真格魚虎對戰",
  clam_blitz: "真格蛤蜊",
  REGULAR: "鮭魚跑",
  BIG_RUN: "大型跑",
  TEAM_CONTEST: "團隊打工競賽",
  // Challenges.
  "TGVhZ3VlTWF0Y2hFdmVudC1Db21wZXRpdGlvbnNBVQ==": "大賽活動 (AU/NZ)",
  "TGVhZ3VlTWF0Y2hFdmVudC1Db21wZXRpdGlvbnNFVQ==": "大賽活動 (EU)",
  "TGVhZ3VlTWF0Y2hFdmVudC1Db21wZXRpdGlvbnNKUA==": "大賽活動 (JP)",
  "TGVhZ3VlTWF0Y2hFdmVudC1Db21wZXRpdGlvbnNVUw==": "大賽活動 (US)",
  TGVhZ3VlTWF0Y2hFdmVudC1EZWVwRm9n: "迷霧之戰",
  "TGVhZ3VlTWF0Y2hFdmVudC1IaWdoSnVtcA==": "沖天跳躍對戰",
  TGVhZ3VlTWF0Y2hFdmVudC1Nb250aGx5TGVhZ3VlTWF0Y2hSZWFs: "月一‧活動比賽",
  "TGVhZ3VlTWF0Y2hFdmVudC1OZXdTZWFzb25DdXA=": "新賽季開幕紀念盃",
  TGVhZ3VlTWF0Y2hFdmVudC1QYWlyQ3Vw: "最強搭檔爭奪戰",
  "TGVhZ3VlTWF0Y2hFdmVudC1SYW5kb21XZWFwb24=": "愛惜使用各類武器的武器子盃",
  "TGVhZ3VlTWF0Y2hFdmVudC1TcGVjaWFsUnVzaF9VbHRyYVNob3Q=": "終極發射狂歡祭",
  "TGVhZ3VlTWF0Y2hFdmVudC1TcGVjaWFsUnVzaF9aaXBDYXN0ZXI=": "觸手噴射狂歡祭",
  TGVhZ3VlTWF0Y2hFdmVudC1Vc3VhbGx5: "大賽活動",
  TGVhZ3VlTWF0Y2hFdmVudC1XZWFwb25MaW1pdGVkX1JvbGxlckJydXNo: "最強滾筒＆畫筆爭奪戰",
  // Stages.
  stages: "場地",
  VnNTdGFnZS0x: "溫泉花大峽谷",
  VnNTdGFnZS0y: "鰻鯰區",
  VnNTdGFnZS0z: "煙管魚市場",
  VnNTdGFnZS00: "竹蟶疏洪道",
  VnNTdGFnZS01: "魚露遺跡",
  VnNTdGFnZS02: "魚肉碎金屬",
  VnNTdGFnZS03: "臭魚乾溫泉",
  VnNTdGFnZS04: "塔拉波特購物公園",
  VnNTdGFnZS05: "比目魚住宅區",
  "VnNTdGFnZS0xMA==": "真鯖跨海大橋",
  "VnNTdGFnZS0xMQ==": "金眼鯛美術館",
  "VnNTdGFnZS0xMg==": "鬼頭刀SPA度假區",
  "VnNTdGFnZS0xMw==": "海女美術大學",
  "VnNTdGFnZS0xNA==": "鱘魚造船廠",
  "VnNTdGFnZS0xNQ==": "座頭購物中心",
  "VnNTdGFnZS0xNg==": "醋飯海洋世界",
  "VnNTdGFnZS0xNw==": "昆布賽道",
  "VnNTdGFnZS0xOA==": "鬼蝠魟瑪利亞號",
  VnNTdGFnZS0tOTk5: "",
  // Coop stages.
  "Q29vcFN0YWdlLTE=": "鮭壩",
  "Q29vcFN0YWdlLTI=": "新卷堡",
  "Q29vcFN0YWdlLTY=": "漂浮落難船",
  "Q29vcFN0YWdlLTc=": "麥年海洋發電所",
  "Q29vcFN0YWdlLTg=": "生筋子系統交流道遺址",
  "Q29vcFN0YWdlLTEwMA==": "醋飯海洋世界",
  "Q29vcFN0YWdlLTEwMg==": "海女美術大學",
  "Q29vcFN0YWdlLTEwMw==": "竹蟶疏洪道",
  "Q29vcFN0YWdlLS05OTk=": "",
  // Weapons.
  weapons: "武器",
  "V2VhcG9uLTA=": "廣域標記槍",
  "V2VhcG9uLTE=": "廣域標記槍 新型",
  V2VhcG9uLTEw: "新葉射擊槍",
  V2VhcG9uLTEx: "楓葉射擊槍",
  V2VhcG9uLTIw: "窄域標記槍",
  V2VhcG9uLTIx: "窄域標記槍 新型",
  V2VhcG9uLTMw: "專業模型槍MG",
  V2VhcG9uLTMx: "專業模型槍RG",
  V2VhcG9uLTQw: "斯普拉射擊槍",
  V2VhcG9uLTQx: "斯普拉射擊槍 聯名",
  V2VhcG9uLTQ1: "英雄射擊槍 複製",
  V2VhcG9uLTUw: ".52加侖",
  V2VhcG9uLTYw: "N-ZAP85",
  V2VhcG9uLTYx: "N-ZAP89",
  V2VhcG9uLTcw: "頂尖射擊槍",
  V2VhcG9uLTcx: "頂尖射擊槍 聯名",
  V2VhcG9uLTgw: ".96加侖",
  V2VhcG9uLTgx: ".96加侖 裝飾",
  V2VhcG9uLTkw: "噴射清潔槍",
  V2VhcG9uLTkx: "噴射清潔槍 改裝",
  "V2VhcG9uLTEwMA==": "太空射擊槍",
  "V2VhcG9uLTEwMQ==": "太空射擊槍 聯名",
  "V2VhcG9uLTIwMA==": "新星爆破槍",
  "V2VhcG9uLTIwMQ==": "新星爆破槍 新型",
  "V2VhcG9uLTIxMA==": "火熱爆破槍",
  "V2VhcG9uLTIyMA==": "遠距爆破槍",
  "V2VhcG9uLTIzMA==": "衝塗爆破槍",
  "V2VhcG9uLTIzMQ==": "衝塗爆破槍 新型",
  "V2VhcG9uLTI0MA==": "快速爆破槍",
  "V2VhcG9uLTI0MQ==": "快速爆破槍 裝飾",
  "V2VhcG9uLTI1MA==": "快速爆破槍 精英",
  "V2VhcG9uLTI1MQ==": "快速爆破槍 精英裝飾",
  "V2VhcG9uLTI2MA==": "S-BLAST92",
  "V2VhcG9uLTMwMA==": "L3捲管槍",
  "V2VhcG9uLTMwMQ==": "L3捲管槍D",
  "V2VhcG9uLTMxMA==": "H3捲管槍",
  "V2VhcG9uLTMxMQ==": "H3捲管槍D",
  "V2VhcG9uLTQwMA==": "開瓶噴泉槍",
  "V2VhcG9uLTEwMDA=": "碳纖維滾筒",
  "V2VhcG9uLTEwMDE=": "碳纖維滾筒 裝飾",
  "V2VhcG9uLTEwMTA=": "斯普拉滾筒",
  "V2VhcG9uLTEwMTE=": "斯普拉滾筒 聯名",
  "V2VhcG9uLTEwMjA=": "電動馬達滾筒",
  "V2VhcG9uLTEwMzA=": "可變式滾筒",
  "V2VhcG9uLTEwNDA=": "寬滾筒",
  "V2VhcG9uLTEwNDE=": "寬滾筒 聯名",
  "V2VhcG9uLTExMDA=": "巴勃羅",
  "V2VhcG9uLTExMDE=": "巴勃羅‧新藝術",
  "V2VhcG9uLTExMTA=": "北齋",
  "V2VhcG9uLTExMjA=": "文森",
  "V2VhcG9uLTIwMDA=": "魷快潔α",
  "V2VhcG9uLTIwMTA=": "斯普拉蓄力狙擊槍",
  "V2VhcG9uLTIwMTE=": "斯普拉蓄力狙擊槍 聯名",
  "V2VhcG9uLTIwMjA=": "斯普拉準星槍",
  "V2VhcG9uLTIwMjE=": "斯普拉準星槍 聯名",
  "V2VhcG9uLTIwMzA=": "公升4K",
  "V2VhcG9uLTIwNDA=": "4K準星槍",
  "V2VhcG9uLTIwNTA=": "14式竹筒槍‧甲",
  "V2VhcG9uLTIwNjA=": "高壓油管槍",
  "V2VhcG9uLTIwNzA=": "R-PEN/5H",
  "V2VhcG9uLTMwMDA=": "飛濺潑桶",
  "V2VhcG9uLTMwMDE=": "飛濺潑桶 裝飾",
  "V2VhcG9uLTMwMTA=": "洗筆桶",
  "V2VhcG9uLTMwMTE=": "洗筆桶‧新藝術",
  "V2VhcG9uLTMwMjA=": "迴旋潑桶",
  "V2VhcG9uLTMwMzA=": "滿溢泡澡潑桶",
  "V2VhcG9uLTMwNDA=": "爆炸潑桶",
  "V2VhcG9uLTQwMDA=": "斯普拉旋轉槍",
  "V2VhcG9uLTQwMDE=": "斯普拉旋轉槍 聯名",
  "V2VhcG9uLTQwMTA=": "桶裝旋轉槍",
  "V2VhcG9uLTQwMTE=": "桶裝旋轉槍 裝飾",
  "V2VhcG9uLTQwMjA=": "消防栓旋轉槍",
  "V2VhcG9uLTQwMzA=": "圓珠筆",
  "V2VhcG9uLTQwNDA=": "鸚鵡螺號47",
  "V2VhcG9uLTUwMDA=": "濺鍍槍",
  "V2VhcG9uLTUwMDE=": "濺鍍槍‧新藝術",
  "V2VhcG9uLTUwMTA=": "斯普拉機動槍",
  "V2VhcG9uLTUwMjA=": "開爾文525",
  "V2VhcG9uLTUwMzA=": "雙重清潔槍",
  "V2VhcG9uLTUwMzE=": "雙重清潔槍 改裝",
  "V2VhcG9uLTUwNDA=": "四重彈跳手槍 黑",
  "V2VhcG9uLTUwNDE=": "四重彈跳手槍 白",
  "V2VhcG9uLTYwMDA=": "遮陽防空傘",
  "V2VhcG9uLTYwMTA=": "露營防空傘",
  "V2VhcG9uLTYwMTE=": "露營防空傘 姐妹",
  "V2VhcG9uLTYwMjA=": "特務配件",
  "V2VhcG9uLTcwMTA=": "三發獵魚弓",
  "V2VhcG9uLTcwMjA=": "LACT-450",
  "V2VhcG9uLTgwMDA=": "工作刮水刀",
  "V2VhcG9uLTgwMTA=": "雨刷刮水刀",
  "V2VhcG9uLTgwMTE=": "雨刷刮水刀 裝飾",
  V2VhcG9uLTIwOTAw: "熊先生印章爆破槍",
  V2VhcG9uLTIyOTAw: "熊先生印章狙擊槍",
  V2VhcG9uLTIzOTAw: "熊先生印章潑桶",
  V2VhcG9uLTI2OTAw: "熊先生印章防空傘",
  V2VhcG9uLTI3OTAw: "熊先生印章獵魚弓",
  V2VhcG9uLTI4OTAw: "熊先生印章刮水刀",
  // Brands.
  "QnJhbmQtMA==": "戰鬥魷魚",
  "QnJhbmQtMQ==": "鋼鐵先鋒",
  "QnJhbmQtMg==": "海月",
  "QnJhbmQtMw==": "羅肯貝格",
  "QnJhbmQtNA==": "澤酷",
  "QnJhbmQtNQ==": "鍛品",
  "QnJhbmQtNg==": "暖流",
  "QnJhbmQtNw==": "帆立",
  "QnJhbmQtOA==": "寺門",
  "QnJhbmQtOQ==": "時雨",
  "QnJhbmQtMTA=": "艾洛眼",
  "QnJhbmQtMTE=": "暇古",
  "QnJhbmQtMTU=": "無法無天",
  "QnJhbmQtMTY=": "魷皇",
  "QnJhbmQtMTc=": "劍尖魷",
  "QnJhbmQtMTg=": "澤酷暖流",
  "QnJhbmQtMTk=": "散壽司",
  "QnJhbmQtMjA=": "七輪",
  "QnJhbmQtOTc=": "熊先生商會",
  "QnJhbmQtOTg=": "魚乾製造",
  "QnJhbmQtOTk=": "amiibo",
  // Work suits.
  "Q29vcFVuaWZvcm0tMQ==": "打工連身工作服 橘色",
  "Q29vcFVuaWZvcm0tMg==": "打工連身工作服 綠色",
  "Q29vcFVuaWZvcm0tMw==": "打工連身工作服 黃色",
  "Q29vcFVuaWZvcm0tNA==": "打工連身工作服 粉紅色",
  "Q29vcFVuaWZvcm0tNQ==": "打工連身工作服 藍色",
  "Q29vcFVuaWZvcm0tNg==": "打工連身工作服 黑色",
  "Q29vcFVuaWZvcm0tNw==": "打工連身工作服 白色",
  "Q29vcFVuaWZvcm0tOA==": "打工防水衣 橘色",
  "Q29vcFVuaWZvcm0tOQ==": "打工防水衣 黑色",
  "Q29vcFVuaWZvcm0tMTA=": "打工防水衣 黃色",
  "Q29vcFVuaWZvcm0tMTE=": "打工防水衣 棕色",
  // Grades.
  "Q29vcEdyYWRlLTA=": "新手",
  "Q29vcEdyYWRlLTE=": "半吊子",
  "Q29vcEdyYWRlLTI=": "獨當一面",
  "Q29vcEdyYWRlLTM=": "熟練",
  "Q29vcEdyYWRlLTQ=": "達人",
  "Q29vcEdyYWRlLTU=": "達人+1",
  "Q29vcEdyYWRlLTY=": "達人+2",
  "Q29vcEdyYWRlLTc=": "達人+3",
  "Q29vcEdyYWRlLTg=": "傳說",
  // Waves.
  wave_n: "WAVE %{n}",
  xtrawave: "EX-WAVE",
  // Water levels.
  low_tide: "乾潮",
  normal: "普通",
  high_tide: "滿潮",
  // Events.
  Q29vcEV2ZW50V2F2ZS0x: "狂潮",
  Q29vcEV2ZW50V2F2ZS0y: "尋找金鮭魚",
  Q29vcEV2ZW50V2F2ZS0z: "烤架魚出動",
  Q29vcEV2ZW50V2F2ZS00: "走私魚來襲",
  Q29vcEV2ZW50V2F2ZS01: "霧",
  Q29vcEV2ZW50V2F2ZS02: "大胖魚大量出現",
  Q29vcEV2ZW50V2F2ZS03: "巨型龍捲風",
  Q29vcEV2ZW50V2F2ZS04: "泥鮭魚噴發",
  // Boss Salmonids.
  boss_salmonids: "巨大鮭魚",
  "Q29vcEVuZW15LTQ=": "炸彈魚",
  "Q29vcEVuZW15LTU=": "墊肩飛魚",
  "Q29vcEVuZW15LTY=": "鐵板魚",
  "Q29vcEVuZW15LTc=": "蛇魚",
  "Q29vcEVuZW15LTg=": "高塔魚",
  "Q29vcEVuZW15LTk=": "鼴鼠魚",
  Q29vcEVuZW15LTEw: "蝙蝠魚",
  Q29vcEVuZW15LTEx: "柱魚",
  Q29vcEVuZW15LTEy: "潛水魚",
  Q29vcEVuZW15LTEz: "鐵球魚",
  Q29vcEVuZW15LTE0: "鍋蓋魚",
  Q29vcEVuZW15LTE1: "金鮭魚",
  Q29vcEVuZW15LTE3: "烤架鱼",
  Q29vcEVuZW15LTIw: "泥鮭魚",
  // King Salmonids.
  Q29vcEVuZW15LTIz: "橫綱",
  Q29vcEVuZW15LTI0: "辰龍",
};

export default zhHant;
