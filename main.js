import { input } from "@inquirer/prompts";
import { searchCoffee } from "./lib/qdrant.js";
import { spinner } from "./utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({ message: "請輸入想搜尋的咖啡：" })
    ).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("搜尋中...").start();
    const results = await searchCoffee(query, 3);
    spin.stop();

    for (const [i, r] of results.entries()) {
      console.log(`\n${i + 1}. ${r.coffee_name}`);
      console.log(`   英文名稱：${r.english_name}`);
      console.log(`   相似度：${r.score.toFixed(3)}`);
      console.log(`   咖啡基底：${r.coffee_base}`);
      console.log(`   主要材料：${r.main_ingredients}`);
      console.log(`   奶泡：${r.milk_foam}`);
      console.log(`   風味：${r.taste}`);
      console.log(`   苦味程度：${r.bitterness_level}`);
      console.log(`   奶味程度：${r.milkiness_level}`);
      console.log(`   甜度程度：${r.sweetness_level}`);
      console.log(`   飲用溫度：${r.serving_temperature}`);
      console.log(`   特色：${r.features}`);
      console.log(`   適合：${r.recommended_for}`);
      console.log(`   常見容量：${r.common_sizes}`);
      console.log(`   推薦搭配：${r.recommended_pairings}`);
    }
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}
