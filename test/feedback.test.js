import test from "node:test";
import assert from "node:assert/strict";
import { executeWithFeedback, isRetryableError } from "../planner/feedback.js";

const step = {
  id: 1,
  action: "get_weather",
  arguments: '{"city":"Taipei"}',
  reason: "查天氣",
};

test("暫時性錯誤只重試一次", async () => {
  let calls = 0;
  const result = await executeWithFeedback({
    step,
    args: { city: "Taipei" },
    maxRetries: 10,
    handler: async () => {
      calls += 1;
      if (calls === 1) throw new Error("服務暫時無法連線");
      return { temperature: 30 };
    },
  });

  assert.equal(result.status, "completed");
  assert.equal(result.attempts, 2);
  assert.equal(calls, 2);
});

test("API key 錯誤不重試", async () => {
  let calls = 0;
  const result = await executeWithFeedback({
    step,
    args: { city: "Taipei" },
    handler: async () => {
      calls += 1;
      return { error: "OPENWEATHER_API_KEY 尚未設定" };
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.attempts, 1);
  assert.equal(calls, 1);
});

test("辨識永久錯誤", () => {
  assert.equal(isRetryableError("OpenWeather API error: 401"), false);
  assert.equal(isRetryableError("connection reset"), true);
});
