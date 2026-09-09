import { run } from "@openai/agents";
import { OPENAI_API_KEY } from "../config.js";
import { buildClassroomAgent } from "../agents/classroom.js";
import { evalCases } from "./cases.js";
import { evalToolset } from "./fixtures.js";
import { evaluateCase, extractTrace, manualRubric } from "./rubric.js";

if (!OPENAI_API_KEY) {
  console.error("缺少 OPENAI_API_KEY，請先設定 .env 再執行 npm run eval");
  process.exit(1);
}

const classroom = await buildClassroomAgent({
  useMcp: false,
  toolset: evalToolset,
});

let failed = 0;

try {
  for (const testCase of evalCases) {
    const result = await run(classroom.agent, testCase.input, { maxTurns: 8 });
    const trace = extractTrace(result);
    const report = evaluateCase(testCase, trace);

    console.log(`\n${report.passed ? "PASS" : "FAIL"} ${testCase.id}`);
    for (const check of report.checks) {
      console.log(`  ${check.passed ? "✓" : "✗"} ${check.name}`);
    }
    console.log(`  tools: ${trace.tools.join(", ") || "(none)"}`);
    console.log(`  handoffs: ${trace.handoffs.join(", ") || "(none)"}`);
    console.log(`  answer: ${trace.finalOutput}`);

    if (!report.passed) failed += 1;
  }
} finally {
  await classroom.close();
}

console.log("\n仍需人工抽查：");
for (const item of manualRubric) console.log(`- ${item}`);

if (failed > 0) process.exitCode = 1;
