import test from "node:test";
import assert from "node:assert/strict";
import { runPlan } from "../planner/run-plan.js";

const samplePlan = {
  goal: "確認時間與台北天氣",
  steps: [
    {
      id: 1,
      action: "get_current_time",
      arguments: "{}",
      reason: "確認現在時間",
    },
    {
      id: 2,
      action: "get_weather",
      arguments: '{"city":"Taipei"}',
      reason: "確認台北天氣",
    },
  ],
  fallback: "請使用者稍後重試",
};

test("依順序執行 planner 允許的 action", async () => {
  const calls = [];
  const result = await runPlan(samplePlan, {
    handlers: {
      get_current_time: async () => {
        calls.push("time");
        return "14:00";
      },
      get_weather: async ({ city }) => {
        calls.push(city);
        return { temperature: 30 };
      },
    },
  });

  assert.equal(result.status, "completed");
  assert.deepEqual(calls, ["time", "Taipei"]);
});

test("工具失敗時停止後續步驟", async () => {
  const result = await runPlan(samplePlan, {
    handlers: {
      get_current_time: async () => ({ error: "服務暫時不可用" }),
      get_weather: async () => assert.fail("失敗後不應繼續執行"),
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.observations.length, 1);
  assert.match(result.observations[0].error, /服務暫時不可用/);
});
