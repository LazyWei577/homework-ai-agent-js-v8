import { z } from "zod";

export const PLANNER_ACTIONS = [
  "get_current_time",
  "get_weather",
  "get_nearby_youbike",
  "search_netflix",
  "search_learn_python",
];

export const PlanSchema = z.object({
  goal: z.string().min(1).describe("這份計畫要完成的目標"),
  steps: z
    .array(
      z.object({
        id: z.number().int().positive(),
        action: z.enum(PLANNER_ACTIONS),
        arguments: z
          .string()
          .describe("傳給 action 的 JSON object 字串，例如 {\"city\":\"Taipei\"}"),
        reason: z.string().min(1),
      }),
    )
    .min(1)
    .max(6),
  fallback: z.string().min(1).describe("工具失敗或資料不足時的處理方式"),
});
