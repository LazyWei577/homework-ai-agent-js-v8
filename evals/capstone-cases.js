export const capstoneCases = [
  {
    id: "four-week-internal-doc-assistant",
    input: `我會一點 JavaScript，但沒碰過 AI API。
我每週有 6 小時，請安排 4 週學習路線。
目標是做一個可以查公司內部文件的助理。`,
    expected: {
      tools: ["search_courses", "build_learning_plan"],
      language: "zh",
    },
  },
  {
    id: "ask-for-missing-constraints",
    input: "我想學 AI Agent，幫我排課。",
    expected: {
      forbiddenTools: ["build_learning_plan"],
      language: "zh",
    },
  },
];
