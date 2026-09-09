import { client, DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/openai.js";

export async function summarizeConversation({
  previousSummary = "",
  turns,
  openai = client,
  model = DEFAULT_MODEL,
}) {
  const response = await openai.responses.create({
    model,
    reasoning: DEFAULT_REASONING,
    store: false,
    instructions: `請把對話壓縮成 Agent 後續需要的工作記憶。
只保留使用者偏好、任務目標、重要限制、已完成事項與待辦事項。
工具結果只保留後續決策會用到的結論，不要加入原本沒有的事實。
請使用繁體中文。`,
    input: JSON.stringify({ previousSummary, turns }),
  });

  return response.output_text.trim();
}
