# AI Agent 實作工作坊 v8（JavaScript 版）

by eddie@5xcampus.com

這是 v8 課程的完整實作 repo。全程使用 Node.js 22、OpenAI Node SDK v6
的 Responses API、OpenAI Agents SDK、Qdrant 與 MCP；開發環境使用 GitHub
Codespaces。

[在 GitHub Codespaces 開啟](https://codespaces.new/kaochenlong/ai-agent-js-v8)

## 使用方式

1. 在 GitHub 按 **Code → Codespaces → Create codespace on main**。
2. `main` 是完成版；依教材切到對應分支，例如：

   ```bash
   git checkout 1.2-openai-api
   npm install
   ```

3. 從範例建立 `.env`，再填入該章需要的金鑰：

   ```bash
   cp .env.example .env
   ```

API Key 請放在 `.env` 或 Codespaces secrets，不要印到終端機，也不要提交到
Git。

## 課程模型

| 分支 | 生成模型 | 用途 |
|------|----------|------|
| `1.2-openai-api`～`3.2-rag-search-text` | `gpt-5.6-luna` | API 基礎、Tool Calling、embedding 與向量搜尋 |
| `3.3-rag-tool`～`6.3-capstone-course-advisor` | `gpt-5.4-mini` | RAG Agent、handoff、評估、記憶與 planning |

3.1、3.2 的 RAG 流程只建立向量與執行搜尋，embedding 一律使用
`text-embedding-3-small`。從 3.3 開始，生成模型還要選擇工具、理解檢索結果並
產生有根據的答案，因此切換成 `gpt-5.4-mini`，reasoning effort 從 `low`
開始。完成版把這組分段設定集中在 `lib/models.js`。

## 教學分支

| 分支 | 主題 |
|------|------|
| `0.1-hello-world` | 起步與 Node.js 22 |
| `1.1-setup-env` | dotenv 環境變數 |
| `1.2-openai-api` | 第一次 Responses API 呼叫 |
| `1.3-openai-api-loop` | 對話迴圈 |
| `1.4-openai-api-with-memory` | lowdb 對話記憶 |
| `2.1-tool-calling-1` | Responses function tool 概念 |
| `2.2-tool-calling-2` | 真實 OpenWeather tool |
| `2.3-tool-calling-3` | 多 tool 與有限輪數 loop |
| `2.4-tool-calling-youbike` | YouBike API + Haversine |
| `2.5-tool-calling-current-time` | Zod schema 與執行期驗證 |
| `3.1-rag-text-to-vector` | Qdrant + Netflix embedding |
| `3.2-rag-search-text` | 語意搜尋 |
| `3.3-rag-tool` | RAG 包成 tool |
| `3.4-rag-for-pdf` | PDF RAG + recursive splitting |
| `4.1-agents-sdk` | Agents SDK、handoff 與跨輪狀態 |
| `4.2-mcp-server` | MCP server |
| `5.1-agent-profile` | 可重用的 Agent profile |
| `5.2-agent-evaluation` | 固定測資與 rubric 評估 |
| `5.3-memory-compression` | 本機記憶與摘要壓縮 |
| `6.1-planner-loop` | 結構化 plan → act → observe |
| `6.2-feedback-guardrails` | 失敗分類、有限重試與 guardrails |
| `6.3-capstone-course-advisor` | 課程顧問 Capstone |

## 完成版指令

```bash
npm install
npm test             # 不需 API Key 的單元測試
npm start            # 多 Agent 班導師
npm run eval         # 班導師 live eval；外部工具改用固定 fixtures
npm run plan         # 結構化 planner
npm run capstone     # 課程顧問
npm run eval:capstone
```

互動模式可輸入 `:memory` 查看摘要與近期回合，輸入 `:clear` 清除本機
`.history/memory.json`。

## 外部服務

- `OPENAI_API_KEY`：1.2 起需要。
- `OPENWEATHER_API_KEY`：2.2 的天氣工具需要。
- `QDRANT_URL` / `QDRANT_API_KEY`：3.x RAG 章節需要。
- 6.3 課程顧問的課程目錄是 repo 內的示範資料，不需要 Qdrant；若要推薦書籍，會透過本機 stdio MCP server 使用固定示範書單。

`npm test` 不會連 OpenAI、OpenWeather、Qdrant 或 MCP。Live eval 與互動程式才會使用外部服務。
