import { Agent, run } from "@openai/agents";
import { DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/openai.js";
import { PlanSchema, PLANNER_ACTIONS } from "./schema.js";

export const DEFAULT_PLANNER_MODEL = DEFAULT_MODEL;
export const DEFAULT_PLANNER_MODEL_SETTINGS = { reasoning: DEFAULT_REASONING };

const ACTION_GUIDE = {
  get_current_time: "取得台灣現在時間；arguments 用 {}",
  get_weather: '查城市即時天氣；arguments 例如 {"city":"Taipei"}',
  get_nearby_youbike:
    '查座標附近站點；arguments 例如 {"lat":25.0478,"lon":121.517,"radius":500,"available_amount":1,"limit":3}',
  search_netflix:
    '搜尋 Netflix 資料；arguments 例如 {"query":"夢境科幻片","limit":3}',
  search_learn_python:
    '搜尋《為你自己學 Python》；arguments 例如 {"query":"適合初學者嗎","limit":3}',
};

export function buildPlannerAgent({
  model = DEFAULT_PLANNER_MODEL,
  modelSettings = DEFAULT_PLANNER_MODEL_SETTINGS,
} = {}) {
  return new Agent({
    name: "任務規劃員",
    model,
    modelSettings,
    outputType: PlanSchema,
    instructions: `把使用者的多步驟任務拆成最小且必要的執行計畫。
只能使用下列 action，不要自行發明工具：
${PLANNER_ACTIONS.map((name) => `- ${name}: ${ACTION_GUIDE[name]}`).join("\n")}
每一步都要說明 reason；arguments 必須是可由 JSON.parse 解析的 object 字串。
最多六步。若缺少座標等必要資料，不要猜測，請在 fallback 說明限制。
請使用繁體中文。`,
  });
}

export async function createPlan(
  goal,
  {
    model = DEFAULT_PLANNER_MODEL,
    modelSettings = DEFAULT_PLANNER_MODEL_SETTINGS,
    runner = run,
  } = {},
) {
  const result = await runner(buildPlannerAgent({ model, modelSettings }), goal, {
    maxTurns: 2,
  });

  if (!result.finalOutput) {
    throw new Error("Planner 沒有產生可執行的計畫");
  }
  return PlanSchema.parse(result.finalOutput);
}
