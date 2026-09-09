import { input } from "@inquirer/prompts";
import { Agent, run } from "@openai/agents";
import { spinner } from "./utils/spinner.js";
import { toAgentTool } from "./utils/agent-tool.js";
import {
  weatherTool,
  youbikeTool,
  currentTimeTool,
  netflixTool,
  pythonBookTool,
} from "./tools/index.js";

const MODEL = "gpt-5.4-mini";
const MODEL_SETTINGS = { reasoning: { effort: "low" } };

const phpTeacher = new Agent({
  name: "PHP 老師",
  model: MODEL,
  modelSettings: MODEL_SETTINGS,
  instructions:
    "你是 PHP 老師，專門回答 PHP、Laravel 相關問題。請用繁體中文回答。",
  handoffDescription: "PHP 或 Laravel 相關問題",
});

const vueTeacher = new Agent({
  name: "Vue 老師",
  model: MODEL,
  modelSettings: MODEL_SETTINGS,
  instructions:
    "你是 Vue 老師，專門回答 Vue.js、Nuxt 相關問題。請用繁體中文回答。",
  handoffDescription: "Vue.js 或 Nuxt 相關問題",
});

const pythonTeacher = new Agent({
  name: "Python 老師",
  model: MODEL,
  modelSettings: MODEL_SETTINGS,
  instructions:
    "你是 Python 老師，請用繁體中文回答 Python 相關問題。如果問題是關於《為你自己學 Python》這本書、或 Python 的入門背景（用途、特色、怎麼學），先用 search_learn_python 查書裡的內容再回答；其他 Python 問題用你自己的知識解釋即可。",
  handoffDescription: "Python 語法、函式庫，或《為你自己學 Python》這本書的相關問題",
  tools: [toAgentTool(pythonBookTool)],
});

const homeroom = Agent.create({
  name: "班導師",
  model: MODEL,
  modelSettings: MODEL_SETTINGS,
  instructions: `你是班導師，協助學生回答各種問題。
- PHP / Laravel 問題請 handoff 給 PHP 老師
- Vue.js / Nuxt 問題請 handoff 給 Vue 老師
- Python 問題請 handoff 給 Python 老師
- 一般生活問題（天氣、時間、YouBike、Netflix 影片）可以直接用 tools 回答
請用繁體中文回答。`,
  tools: [
    toAgentTool(currentTimeTool),
    toAgentTool(weatherTool),
    toAgentTool(youbikeTool),
    toAgentTool(netflixTool),
  ],
  handoffs: [phpTeacher, vueTeacher, pythonTeacher],
});

let thread = [];

try {
  while (true) {
    const userInput = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userInput === "") continue;
    if (userInput.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("處理中...").start();
    let result;

    try {
      result = await run(
        homeroom,
        thread.concat({ role: "user", content: userInput }),
        { maxTurns: 8 },
      );
    } finally {
      spin.stop();
    }

    thread = result.history;

    console.log(`\n[由 ${result.lastAgent?.name ?? "班導師"} 回答]`);
    console.log(result.finalOutput);
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
