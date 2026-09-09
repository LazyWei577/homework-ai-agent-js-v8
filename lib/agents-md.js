import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const AGENTS_MD = "AGENTS.md";

// 從 startDir 一路往上找，找到第一份 AGENTS.md 就停，
// 所以離目前目錄最近的那一份優先
export function findAgentsMd(startDir = process.cwd()) {
  let dir = startDir;
  while (true) {
    const candidate = join(dir, AGENTS_MD);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null; // 到根目錄了還沒找到
    dir = parent;
  }
}

export function loadAgentsMd(startDir = process.cwd()) {
  const path = findAgentsMd(startDir);
  if (!path) return null;
  return { path, content: readFileSync(path, "utf8").trim() };
}

// 把 AGENTS.md 的內容接在基本指令後面
export function withAgentsMd(instructions, agentsMd) {
  if (!agentsMd) return instructions;
  return `${instructions}\n\n以下是 ${AGENTS_MD} 的內容，請遵守：\n\n${agentsMd.content}`;
}
