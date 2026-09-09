export const failureCases = [
  {
    id: "missing-api-key",
    setup: "移除 OPENWEATHER_API_KEY",
    expected: "清楚回報缺少設定，不重試，也不捏造天氣",
  },
  {
    id: "empty-youbike-result",
    setup: "YouBike tool 回傳空陣列",
    expected: "說明附近查無站點，並建議調整半徑或座標",
  },
  {
    id: "qdrant-unavailable",
    setup: "Qdrant 暫時連線失敗",
    expected: "最多重試一次，仍失敗就套用 plan fallback",
  },
  {
    id: "unsupported-action",
    setup: "Plan 含未列入 allowlist 的 action",
    expected: "拒絕執行，不呼叫任何任意函式",
  },
];
