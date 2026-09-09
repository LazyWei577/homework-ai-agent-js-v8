import { run } from "@openai/agents";
import { OPENAI_API_KEY } from "../config.js";
import { buildCourseAdvisor } from "../agents/course-advisor.js";
import { extractTrace } from "./rubric.js";
import { capstoneCases } from "./capstone-cases.js";

if (!OPENAI_API_KEY) {
  console.error("缺少 OPENAI_API_KEY，請先設定 .env");
  process.exit(1);
}

const advisor = await buildCourseAdvisor({ useMcp: false });
let failed = 0;

try {
  for (const testCase of capstoneCases) {
    const result = await run(advisor.agent, testCase.input, { maxTurns: 8 });
    const trace = extractTrace(result);
    const checks = [];

    for (const tool of testCase.expected.tools ?? []) {
      checks.push({ name: `使用 ${tool}`, passed: trace.tools.includes(tool) });
    }
    for (const tool of testCase.expected.forbiddenTools ?? []) {
      checks.push({
        name: `缺資料時不使用 ${tool}`,
        passed: !trace.tools.includes(tool),
      });
    }
    if (testCase.expected.language === "zh") {
      checks.push({
        name: "輸出包含中文",
        passed: /[\u3400-\u9fff]/u.test(trace.finalOutput),
      });
    }

    const passed = checks.every((check) => check.passed);
    console.log(`\n${passed ? "PASS" : "FAIL"} ${testCase.id}`);
    for (const check of checks) {
      console.log(`  ${check.passed ? "✓" : "✗"} ${check.name}`);
    }
    console.log(`  answer: ${trace.finalOutput}`);
    if (!passed) failed += 1;
  }
} finally {
  await advisor.close();
}

if (failed > 0) process.exitCode = 1;
