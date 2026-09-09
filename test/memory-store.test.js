import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConversationMemory } from "../memory/store.js";

async function withMemory(run) {
  const directory = await mkdtemp(join(tmpdir(), "ai-agent-memory-"));
  try {
    const memory = await new ConversationMemory({
      filePath: join(directory, "memory.json"),
      compressAfterTurns: 3,
      keepRecentTurns: 1,
    }).load();
    await run(memory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("組合摘要、近期回合與本輪輸入", async () => {
  await withMemory(async (memory) => {
    memory.data.summary = "使用者正在學 JavaScript。";
    await memory.recordTurn("上一題", [
      { role: "assistant", content: "上一題的回答" },
    ]);

    const input = memory.buildInput("下一題");
    assert.equal(input[0].role, "developer");
    assert.match(input[0].content, /正在學 JavaScript/);
    assert.equal(input.at(-1).content, "下一題");
  });
});

test("壓縮舊回合並保留最近一輪", async () => {
  await withMemory(async (memory) => {
    for (let index = 1; index <= 4; index += 1) {
      await memory.recordTurn(`問題 ${index}`, [
        { role: "assistant", content: `回答 ${index}` },
      ]);
    }

    assert.equal(memory.shouldCompress(), true);
    await memory.compact(async ({ turns }) =>
      turns.map((turn) => turn.user).join("、"),
    );

    assert.equal(memory.data.turns.length, 1);
    assert.equal(memory.data.turns[0].user, "問題 4");
    assert.match(memory.data.summary, /問題 1、問題 2、問題 3/);
  });
});
