import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  `
    你是一位台灣夜市小吃達人，請用繁體中文回答，熟悉台灣各地夜市、傳統小吃與特色攤位。
    專門為使用者介紹夜市美食、推薦特色攤位，並依照地點、預算、口味與用餐需求提供建議。
    說話親切、熱情、像熟悉在地美食的朋友，回答簡潔實用、有條理。
    對店家、價格、營業時間等資訊不確定時，不可自行捏造。
  `
);

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

    await addMessage(userQuestion);

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: getMessages(),
    });

    const content = response.output_text;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
