import { Agent, MCPServerStdio } from "@openai/agents";
import { toAgentTool } from "../utils/agent-tool.js";
import { loadAgentsMd, withAgentsMd } from "../lib/agents-md.js";
import { DEFAULT_MODEL, DEFAULT_REASONING } from "../lib/openai.js";
import {
  weatherTool,
  youbikeTool,
  currentTimeTool,
  netflixTool,
  pythonBookTool,
} from "../tools/index.js";

export const DEFAULT_AGENT_MODEL = DEFAULT_MODEL;
export const DEFAULT_AGENT_MODEL_SETTINGS = { reasoning: DEFAULT_REASONING };

// eval 要換成假資料的時候，從外面傳一組同名的工具進來即可
export const defaultClassroomToolset = {
  currentTime: currentTimeTool,
  weather: weatherTool,
  youbike: youbikeTool,
  netflix: netflixTool,
  pythonBook: pythonBookTool,
};

// main.js 與 evals/run-evals.js 共用這個函式，測的才是同一組 agent。
// main.js 裡有互動迴圈，直接 import 會把迴圈也跑起來，所以要抽出來。
export async function buildClassroomAgent({
  model = DEFAULT_AGENT_MODEL,
  modelSettings = DEFAULT_AGENT_MODEL_SETTINGS,
  useMcp = true,
  memoryContext = "",
  toolset = defaultClassroomToolset,
} = {}) {
  const agentsMd = loadAgentsMd();

  const tenlongMcp = useMcp
    ? new MCPServerStdio({
        fullCommand: "node mcp-server.js",
        name: "tenlong",
        cacheToolsList: true,
      })
    : null;

  if (tenlongMcp) {
    await tenlongMcp.connect();
  }

  const phpTeacher = new Agent({
    name: "PHP 老師",
    model,
    modelSettings,
    instructions:
      "你是 PHP 老師，專門回答 PHP、Laravel 相關問題。請用繁體中文回答。",
    handoffDescription: "PHP 或 Laravel 相關問題",
  });

  const vueTeacher = new Agent({
    name: "Vue 老師",
    model,
    modelSettings,
    instructions:
      "你是 Vue 老師，專門回答 Vue.js、Nuxt 相關問題。請用繁體中文回答。",
    handoffDescription: "Vue.js 或 Nuxt 相關問題",
  });

  const pythonTeacher = new Agent({
    name: "Python 老師",
    model,
    modelSettings,
    instructions:
      "你是 Python 老師，請用繁體中文回答 Python 相關問題。如果問題是關於《為你自己學 Python》這本書、或 Python 的入門背景（用途、特色、怎麼學），先用 search_learn_python 查書裡的內容再回答；其他 Python 問題用你自己的知識解釋即可。",
    handoffDescription: "Python 語法、函式庫，或《為你自己學 Python》這本書的相關問題",
    tools: [toAgentTool(toolset.pythonBook)],
  });

  const baseInstructions = withAgentsMd(
    "你是班導師，協助學生回答各種問題。請用繁體中文回答。",
    agentsMd,
  );

  const homeroom = Agent.create({
    name: "班導師",
    model,
    modelSettings,
    instructions: memoryContext
      ? `${baseInstructions}\n\n額外上下文：\n${memoryContext}`
      : baseInstructions,
    tools: [
      toAgentTool(toolset.currentTime),
      toAgentTool(toolset.weather),
      toAgentTool(toolset.youbike),
      toAgentTool(toolset.netflix),
    ],
    handoffs: [phpTeacher, vueTeacher, pythonTeacher],
    ...(tenlongMcp && { mcpServers: [tenlongMcp] }),
  });

  return {
    agent: homeroom,
    agentsMd,
    close: async () => {
      if (tenlongMcp) {
        await tenlongMcp.close();
      }
    },
  };
}
