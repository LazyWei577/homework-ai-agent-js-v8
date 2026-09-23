import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function calculate({ expression }) {
  try {
    // 簡單限制只允許數字與基本運算符號
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error("只允許數字與 + - * / ( )");
    }

    const result = eval(expression);

    return String(result);
  } catch (error) {
    return `計算錯誤：${error.message}`;
  }
}

export const calculateTool = defineTool({
  name: "calculate",
  description: "進行數學計算",
  fn: calculate,
  parameters: z.object({
    expression: z.string().describe('10 + 5 * 2'),
  }),
});
