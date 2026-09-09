import { Agent, MCPServerStdio } from "@openai/agents";
import { toAgentTool } from "../utils/agent-tool.js";
import { courseSearchTool, learningPlanTool } from "../tools/courses.js";
import { currentTimeTool } from "../tools/current_time.js";
import {
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_MODEL_SETTINGS,
} from "./classroom.js";

export const defaultCourseAdvisorToolset = {
  searchCourses: courseSearchTool,
  buildLearningPlan: learningPlanTool,
  currentTime: currentTimeTool,
};

const COURSE_ADVISOR_INSTRUCTIONS = `角色：五倍學院 AI 與程式課程顧問

目標：根據學員背景、每週時間與目標，使用真實課程目錄規劃可執行的學習路線。

語氣：使用繁體中文，務實、具體，先補齊必要資訊再給建議。

工具邊界：
- 推薦課程前必須先用 search_courses，不得憑空捏造課名或課程內容。
- 只有拿到 search_courses 回傳的 course id，才能呼叫 build_learning_plan。
- 需要書籍補充時可使用 tenlong MCP 的課程示範書單；它不是即時榜單，未實際呼叫時也不要聲稱查過。

回答規則：
- 缺少背景、目標、每週時數或計畫週數時，先提出精確問題，不要自行猜測。
- 說明每門課為何符合目標，並列出每週目標、時數與產出。
- 查無適合課程時，明確說明目前示範目錄的限制。
- 工具失敗時說明錯誤與下一步，不要用模型記憶冒充查詢結果。`;

export async function buildCourseAdvisor({
  model = DEFAULT_AGENT_MODEL,
  modelSettings = DEFAULT_AGENT_MODEL_SETTINGS,
  useMcp = true,
  toolset = defaultCourseAdvisorToolset,
} = {}) {
  const tenlongMcp = useMcp
    ? new MCPServerStdio({
        fullCommand: "node mcp-server.js",
        name: "tenlong",
        cacheToolsList: true,
      })
    : null;

  if (tenlongMcp) await tenlongMcp.connect();

  const agent = Agent.create({
    name: "課程顧問",
    model,
    modelSettings,
    instructions: COURSE_ADVISOR_INSTRUCTIONS,
    tools: [
      toAgentTool(toolset.searchCourses),
      toAgentTool(toolset.buildLearningPlan),
      toAgentTool(toolset.currentTime),
    ],
    ...(tenlongMcp && { mcpServers: [tenlongMcp] }),
  });

  return {
    agent,
    close: async () => {
      if (tenlongMcp) await tenlongMcp.close();
    },
  };
}
