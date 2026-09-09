import { input } from "@inquirer/prompts";
import { createPlan } from "./create-plan.js";
import { runPlan } from "./run-plan.js";

const goal = (
  await input({ message: "請描述需要規劃的多步驟任務：" })
).trim();

if (!goal) {
  console.error("任務不能是空白");
  process.exit(1);
}

const plan = await createPlan(goal);
console.log("\n計畫：");
console.log(JSON.stringify(plan, null, 2));

const result = await runPlan(plan, {
  onStep(event) {
    if (event.phase === "act") {
      console.log(`\n[執行 ${event.step.id}] ${event.step.action}`);
    } else {
      console.log(`[${event.observation.status}] ${event.observation.reason}`);
    }
  },
});

console.log("\n執行結果：");
console.log(JSON.stringify(result, null, 2));

if (result.status === "failed") {
  console.log(`\n替代方案：${result.fallback}`);
  process.exitCode = 1;
}
