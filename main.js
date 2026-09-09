import { OPENAI_API_KEY } from "./config.js";

console.log(
  OPENAI_API_KEY
    ? "OPENAI_API_KEY 已設定"
    : "OPENAI_API_KEY 尚未設定，請先填寫 .env",
);
