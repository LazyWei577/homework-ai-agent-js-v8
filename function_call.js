import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const TOOLS_BY_NAME = Object.fromEntries(toolList.map((tool) => [tool.name, tool]));
const MAX_TOOL_ROUNDS = 8;

const history = [
  {
    role: "user",
    content:
      "現在幾點？我在台北車站附近，請問現在天氣如何？順便告訴我附近還有沒有 YouBike 可以租？",
  },
];

let completed = false;

for (let round = 1; round <= MAX_TOOL_ROUNDS; round += 1) {
  const spin = spinner("思考中...").start();

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    input: history,
    tools,
    tool_choice: "auto",
  });

  spin.stop();

  history.push(...response.output);

  const functionCalls = response.output.filter(
    (item) => item.type === "function_call",
  );

  if (functionCalls.length === 0) {
    console.log(response.output_text);
    completed = true;
    break;
  }

  for (const functionCall of functionCalls) {
    const fnName = functionCall.name;
    const tool = TOOLS_BY_NAME[fnName];
    if (!tool) {
      throw new Error(`模型要求了未註冊的工具：${fnName}`);
    }

    const args = tool.parameters.parse(JSON.parse(functionCall.arguments));
    console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

    const result = await tool.fn(args);

    history.push({
      type: "function_call_output",
      call_id: functionCall.call_id,
      output: JSON.stringify(result),
    });
  }
}

if (!completed) {
  throw new Error(`Tool calling 超過 ${MAX_TOOL_ROUNDS} 輪，已停止執行`);
}
