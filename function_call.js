import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { getWeatherTool, getWeather } from "./tools/weather.js";
import { spinner } from "./utils/spinner.js";

const AVAILABLE_TOOLS = {
  get_weather: getWeather,
};

const tools = [getWeatherTool];

const history = [{ role: "user", content: "請問台北現在天氣如何？" }];

const askingSpinner = spinner("思考中...").start();

let response = await client.responses.create({
  model: DEFAULT_MODEL,
  input: history,
  tools,
  tool_choice: "auto",
});

askingSpinner.stop();

history.push(...response.output);

const functionCalls = response.output.filter(
  (item) => item.type === "function_call",
);

if (functionCalls.length > 0) {
  for (const functionCall of functionCalls) {
    const fnName = functionCall.name;
    const args = JSON.parse(functionCall.arguments);
    console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

    const fn = AVAILABLE_TOOLS[fnName];
    const result = await fn(args);

    history.push({
      type: "function_call_output",
      call_id: functionCall.call_id,
      output: JSON.stringify(result),
    });
  }

  const replySpinner = spinner("思考中...").start();

  response = await client.responses.create({
    model: DEFAULT_MODEL,
    input: history,
    tools,
  });

  replySpinner.stop();

  console.log(response.output_text);
} else {
  console.log(response.output_text);
}
