import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLearningPlan,
  searchCourses,
} from "../tools/courses.js";

test("依目標搜尋內部文件與 RAG 課程", () => {
  const results = searchCourses({
    query: "我想做公司內部文件 RAG 助理",
    limit: 3,
  });

  assert.equal(results[0].id, "rag-knowledge-base");
  assert.ok(results[0].score > 0);
});

test("只用目錄裡存在的 course id 建立四週計畫", () => {
  const plan = buildLearningPlan({
    background: "會一點 JavaScript",
    goal: "完成內部文件助理",
    weeklyHours: 6,
    weeks: 4,
    courseIds: [
      "openai-api-foundations",
      "ai-agent-workshop",
      "rag-knowledge-base",
    ],
  });

  assert.equal(plan.totalHours, 24);
  assert.equal(plan.schedule.length, 4);
  assert.ok(plan.schedule.every((week) => week.hours === 6));
});

test("拒絕不存在的課程 id", () => {
  const result = buildLearningPlan({
    background: "初學者",
    goal: "學 AI",
    weeklyHours: 4,
    weeks: 2,
    courseIds: ["imaginary-course"],
  });

  assert.match(result.error, /imaginary-course/);
});
