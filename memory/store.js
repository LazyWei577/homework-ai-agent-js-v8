import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const EMPTY_MEMORY = Object.freeze({ summary: "", turns: [] });

export class ConversationMemory {
  constructor({
    filePath = ".history/memory.json",
    compressAfterTurns = 6,
    keepRecentTurns = 2,
  } = {}) {
    if (keepRecentTurns < 1 || compressAfterTurns <= keepRecentTurns) {
      throw new RangeError("記憶門檻必須大於要保留的近期回合數");
    }

    this.filePath = filePath;
    this.compressAfterTurns = compressAfterTurns;
    this.keepRecentTurns = keepRecentTurns;
    this.data = structuredClone(EMPTY_MEMORY);
  }

  async load() {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      this.data = {
        summary: String(parsed.summary ?? ""),
        turns: Array.isArray(parsed.turns) ? parsed.turns : [],
      };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    return this;
  }

  buildInput(userInput) {
    const input = [];

    if (this.data.summary) {
      input.push({
        role: "developer",
        content: `以下是較早對話的壓縮工作記憶：\n${this.data.summary}`,
      });
    }

    for (const turn of this.data.turns) {
      input.push({ role: "user", content: turn.user });
      input.push(...turn.output);
    }

    input.push({ role: "user", content: userInput });
    return input;
  }

  async recordTurn(user, output) {
    this.data.turns.push({
      user: String(user),
      output: structuredClone(output ?? []),
    });
    await this.save();
  }

  shouldCompress() {
    return this.data.turns.length > this.compressAfterTurns;
  }

  async compact(summarize) {
    const splitAt = this.data.turns.length - this.keepRecentTurns;
    if (splitAt <= 0) return false;

    const olderTurns = this.data.turns.slice(0, splitAt);
    const summary = await summarize({
      previousSummary: this.data.summary,
      turns: olderTurns,
    });

    this.data = {
      summary: String(summary).trim(),
      turns: this.data.turns.slice(splitAt),
    };
    await this.save();
    return true;
  }

  async clear() {
    this.data = structuredClone(EMPTY_MEMORY);
    await this.save();
  }

  describe() {
    return [
      `摘要：${this.data.summary || "（尚無）"}`,
      `近期回合：${this.data.turns.length}`,
    ].join("\n");
  }

  async save() {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(this.data, null, 2)}\n`);
  }
}

export async function createConversationMemory(options) {
  return await new ConversationMemory(options).load();
}
