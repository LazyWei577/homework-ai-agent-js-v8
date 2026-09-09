import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCase, extractTrace } from "../evals/rubric.js";

test("從 Agents SDK run items 取出 tool 與 handoff", () => {
  const trace = extractTrace({
    finalOutput: "已根據資料回答。",
    newItems: [
      { type: "tool_call_item", rawItem: { name: "get_weather" } },
      {
        type: "handoff_output_item",
        targetAgent: { name: "Python 老師" },
      },
    ],
  });

  assert.deepEqual(trace.tools, ["get_weather"]);
  assert.deepEqual(trace.handoffs, ["Python 老師"]);
});

test("固定規則同時檢查 tool、handoff 與中文輸出", () => {
  const report = evaluateCase(
    {
      id: "sample",
      expected: {
        tool: "search_learn_python",
        handoff: "Python 老師",
        language: "zh",
      },
    },
    {
      tools: ["search_learn_python"],
      handoffs: ["Python 老師"],
      finalOutput: "這是繁體中文回答。",
    },
  );

  assert.equal(report.passed, true);
});
