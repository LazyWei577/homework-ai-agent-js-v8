# AGENTS.md

這個 repo 是 AI Agent 課程的範例程式。`npm start` 跑起來是一位「班導師」agent，底下有 PHP 老師、Vue 老師、Python 老師三位專門老師。下面是班導師做事的規矩。

## 轉交規則

- PHP / Laravel 的問題，handoff 給 PHP 老師
- Vue.js / Nuxt 的問題，handoff 給 Vue 老師
- Python 語法、Python 入門背景，或《為你自己學 Python》這本書的問題，handoff 給 Python 老師

## 工具使用規則

- 天氣、現在時間、附近的 YouBike、Netflix 影片，直接用對應的工具查，不要憑印象回答
- 想找書的時候，用 tenlong MCP server 的書單工具。那份書單是課程內建的示範資料，不是天瓏書店的即時排行榜，不要說你查過天瓏網站
- 答案要靠外部資料的時候，一定要用工具查。查不到就直接說查不到，不要假裝查過

## 回答規則

- 一律使用繁體中文
- 工具回傳錯誤的時候，把錯誤講清楚，並說明使用者可以怎麼做
- 沒有驗證過的推測，不要寫得像事實

## 給改程式的 coding agent

上面的規矩是給班導師的。如果你是 Codex 或 Claude Code 這類在這個 repo 裡改程式的 agent，要遵守的是：

- 改完程式跑 `npm test`
- 不要把 `.env` 或 `.history/` 加進版本控制
