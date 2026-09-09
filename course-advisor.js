import { input } from "@inquirer/prompts";
import { run } from "@openai/agents";
import { buildCourseAdvisor } from "./agents/course-advisor.js";
import { createConversationMemory } from "./memory/store.js";
import { summarizeConversation } from "./memory/summarize.js";
import { spinner } from "./utils/spinner.js";

const advisor = await buildCourseAdvisor();
const memory = await createConversationMemory({
  filePath: ".history/course-advisor.json",
});

console.log("課程顧問已啟動。請說明你的背景、每週時間、週數與學習目標。");

try {
  while (true) {
    const userInput = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (!userInput) continue;
    if (userInput === ":memory") {
      console.log(memory.describe());
      continue;
    }
    if (userInput === ":clear") {
      await memory.clear();
      console.log("課程顧問記憶已清除");
      continue;
    }
    if (userInput.toLowerCase() === "exit") break;

    const spin = spinner("規劃中...").start();
    let result;
    try {
      result = await run(advisor.agent, memory.buildInput(userInput), {
        maxTurns: 8,
      });
    } finally {
      spin.stop();
    }

    await memory.recordTurn(userInput, result.output);
    console.log(`\n${result.finalOutput}\n`);

    if (memory.shouldCompress()) {
      await memory.compact(summarizeConversation);
    }
  }
} catch (error) {
  if (error.name !== "ExitPromptError") throw error;
} finally {
  await advisor.close();
}

console.log("再會~");
