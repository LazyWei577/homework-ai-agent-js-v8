export const evalCases = [
  {
    id: "weather-tool",
    input: "請問台北現在天氣如何？",
    expected: {
      tool: "get_weather",
      language: "zh",
    },
  },
  {
    id: "python-book-rag",
    input: "《為你自己學 Python》這本書適合完全沒寫過程式的人嗎？",
    expected: {
      handoff: "Python 老師",
      tool: "search_learn_python",
      language: "zh",
    },
  },
  {
    id: "vue-handoff",
    input: "Vue component props 要怎麼設計比較好？",
    expected: {
      handoff: "Vue 老師",
      language: "zh",
    },
  },
];
