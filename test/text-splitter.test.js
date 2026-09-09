import test from "node:test";
import assert from "node:assert/strict";
import { splitText } from "../utils/text-splitter.js";

test("優先沿著段落與句子邊界切分", () => {
  const text = "第一段很短。\n\n第二段也很短。\n\n第三段仍然很短。";
  const chunks = splitText(text, { chunkSize: 10, overlap: 0 });

  assert.deepEqual(chunks, [
    "第一段很短。",
    "第二段也很短。",
    "第三段仍然很短。",
  ]);
});

test("每塊不超過上限，並保留指定 overlap", () => {
  const chunks = splitText("abcdefghijklmnopqrstuvwxyz", {
    chunkSize: 10,
    overlap: 2,
    separators: [""],
  });

  assert.ok(chunks.every((chunk) => chunk.length <= 10));
  for (let index = 1; index < chunks.length; index += 1) {
    assert.equal(chunks[index - 1].slice(-2), chunks[index].slice(0, 2));
  }
});

test("拒絕不合理的 chunk 設定", () => {
  assert.throws(
    () => splitText("hello", { chunkSize: 10, overlap: 10 }),
    /overlap/,
  );
});
