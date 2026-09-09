export const manualRubric = [
  "答案是否有根據工具或知識庫結果",
  "查不到或工具失敗時是否清楚說明限制",
  "是否避免編造外部資料",
  "繁體中文語氣是否自然且符合教學情境",
];

export function extractTrace(result) {
  const tools = [];
  const handoffs = [];

  for (const item of result.newItems ?? []) {
    if (item.type === "tool_call_item" && item.rawItem?.name) {
      tools.push(item.rawItem.name);
    }
    if (item.type === "handoff_output_item" && item.targetAgent?.name) {
      handoffs.push(item.targetAgent.name);
    }
  }

  return {
    tools,
    handoffs,
    finalOutput: String(result.finalOutput ?? ""),
  };
}

export function evaluateCase(testCase, trace) {
  const checks = [];
  const { expected } = testCase;

  if (expected.tool) {
    checks.push({
      name: `使用工具 ${expected.tool}`,
      passed: trace.tools.includes(expected.tool),
    });
  }

  if (expected.handoff) {
    checks.push({
      name: `handoff 給 ${expected.handoff}`,
      passed: trace.handoffs.includes(expected.handoff),
    });
  }

  if (expected.language === "zh") {
    checks.push({
      name: "輸出包含中文",
      passed: /[\u3400-\u9fff]/u.test(trace.finalOutput),
    });
  }

  return {
    id: testCase.id,
    passed: checks.every((check) => check.passed),
    checks,
  };
}
