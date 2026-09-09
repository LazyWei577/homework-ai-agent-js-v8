import { input } from "@inquirer/prompts";
import { run } from "@openai/agents";
import { spinner } from "./utils/spinner.js";
import { buildClassroomAgent } from "./agents/classroom.js";
import { createConversationMemory } from "./memory/store.js";
import { summarizeConversation } from "./memory/summarize.js";

const classroom = await buildClassroomAgent();
const memory = await createConversationMemory();

console.log(
  classroom.agentsMd
    ? `[AGENTS.md] 已載入 ${classroom.agentsMd.path}`
    : "[AGENTS.md] 找不到，班導師只有程式裡的基本指令",
);

try {
  while (true) {
    const userInput = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userInput === "") continue;
    if (userInput === ":memory") {
      console.log(memory.describe());
      continue;
    }
    if (userInput === ":clear") {
      await memory.clear();
      console.log("對話記憶已清除");
      continue;
    }
    if (userInput.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("處理中...").start();
    let result;

    try {
      result = await run(
        classroom.agent,
        memory.buildInput(userInput),
        { maxTurns: 8 },
      );
    } finally {
      spin.stop();
    }

    await memory.recordTurn(userInput, result.output);

    console.log(`\n[由 ${result.lastAgent?.name ?? "班導師"} 回答]`);
    console.log(result.finalOutput);
    console.log();

    if (memory.shouldCompress()) {
      const compactSpin = spinner("壓縮對話記憶中...").start();
      try {
        await memory.compact(summarizeConversation);
      } finally {
        compactSpin.stop();
      }
    }
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
} finally {
  await classroom.close();
}
