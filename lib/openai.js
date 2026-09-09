import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config.js";

export const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// 從這個分支開始，agent 迴圈一題要打好幾次 API，改用便宜又快的 mini，
// reasoning 從 low 起跳，需要的時候再往上調。
export const DEFAULT_MODEL = "gpt-5.4-mini";
export const DEFAULT_REASONING = { effort: "low" };
