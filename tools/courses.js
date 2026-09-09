import { readFile } from "node:fs/promises";
import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

export const courseCatalog = JSON.parse(
  await readFile(new URL("../data/courses.json", import.meta.url), "utf8"),
);

export function searchCourses({ query, limit = 5 }, catalog = courseCatalog) {
  const normalizedQuery = normalize(query);
  const knownTags = new Set(catalog.flatMap((course) => course.tags));
  const terms = new Set(
    normalizedQuery.split(/[\s,，、/]+/u).filter((term) => term.length >= 2),
  );

  for (const tag of knownTags) {
    if (normalizedQuery.includes(normalize(tag))) terms.add(normalize(tag));
  }

  return catalog
    .map((course) => ({ course, score: scoreCourse(course, normalizedQuery, terms) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ course, score }) => ({ ...course, score }));
}

export function buildLearningPlan(
  { background, goal, weeklyHours, weeks, courseIds },
  catalog = courseCatalog,
) {
  const selected = courseIds.map((id) =>
    catalog.find((course) => course.id === id),
  );
  const missingIds = courseIds.filter((_, index) => !selected[index]);
  if (missingIds.length > 0) {
    return { error: `課程目錄裡沒有：${missingIds.join(", ")}` };
  }

  const schedule = Array.from({ length: weeks }, (_, index) => {
    const course = selected[index % selected.length];
    const outcome = course.outcomes[index % course.outcomes.length];
    return {
      week: index + 1,
      courseId: course.id,
      course: course.title,
      hours: weeklyHours,
      focus: outcome,
      deliverable: `完成「${outcome}」練習，並留下可展示的程式或筆記`,
    };
  });

  return {
    background,
    goal,
    weeklyHours,
    weeks,
    totalHours: weeklyHours * weeks,
    selectedCourses: selected.map(({ id, title }) => ({ id, title })),
    schedule,
  };
}

function scoreCourse(course, query, terms) {
  const corpus = normalize(
    [
      course.title,
      course.summary,
      ...course.prerequisites,
      ...course.outcomes,
      ...course.tags,
    ].join(" "),
  );
  let score = corpus.includes(query) ? 10 : 0;

  for (const term of terms) {
    if (corpus.includes(term)) score += 2;
    if (course.tags.some((tag) => normalize(tag) === term)) score += 3;
  }
  return score;
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

export const courseSearchTool = defineTool({
  name: "search_courses",
  description:
    "搜尋課程目錄。推薦課程或規劃學習路線前必須先用這個工具取得真實課程 id、先備知識與學習成果。",
  fn: searchCourses,
  parameters: z.object({
    query: z.string().min(1).describe("學員背景、目標或想學的主題"),
    limit: z.number().int().min(1).max(5).default(5),
  }),
});

export const learningPlanTool = defineTool({
  name: "build_learning_plan",
  description:
    "用 search_courses 回傳的課程 id 建立逐週學習計畫。缺少背景、目標、每週時數或週數時，應先詢問使用者。",
  fn: buildLearningPlan,
  parameters: z.object({
    background: z.string().min(1).describe("學員目前背景"),
    goal: z.string().min(1).describe("學習目標"),
    weeklyHours: z.number().int().min(1).max(40),
    weeks: z.number().int().min(1).max(12),
    courseIds: z.array(z.string()).min(1).max(5),
  }),
});
