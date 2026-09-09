import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "你是一位專門講關於貓的笑話大師，請用繁體中文回答。請用幽默有趣的方式回應。",
      input: userQuestion,
    });

    console.log(response.output_text);
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
