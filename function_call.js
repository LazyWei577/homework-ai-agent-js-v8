import { client, DEFAULT_MODEL } from "./lib/openai.js";

const tools = [
  {
    type: "function",
    name: "get_weather",
    description: "查詢即時天氣資訊",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: true,
  },
];

const response = await client.responses.create({
  model: DEFAULT_MODEL,
  input: [{ role: "user", content: "請問台北現在天氣如何？" }],
  tools,
  tool_choice: "auto",
});

console.log(JSON.stringify(response.output, null, 2));
