import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

function fixtureTool({ name, description, parameters, result }) {
  return defineTool({
    name,
    description,
    parameters,
    fn: async () => result,
  });
}

export const evalToolset = {
  currentTime: fixtureTool({
    name: "get_current_time",
    description: "取得現在的台灣時間",
    parameters: z.object({}),
    result: "2026/8/3 下午 2:00:00",
  }),
  weather: fixtureTool({
    name: "get_weather",
    description: "取得指定城市的即時天氣資訊",
    parameters: z.object({ city: z.string() }),
    result: {
      city: "Taipei",
      temperature: 30,
      humidity: 70,
      description: "晴",
    },
  }),
  youbike: fixtureTool({
    name: "get_nearby_youbike",
    description: "取得指定座標附近的 YouBike 站點",
    parameters: z.object({
      lat: z.number(),
      lon: z.number(),
      radius: z.number().default(500),
      available_amount: z.number().default(0),
      limit: z.number().default(3),
    }),
    result: [
      {
        name: "捷運臺北車站(M2出口)",
        available_rent: 7,
        distance: 210,
      },
    ],
  }),
  netflix: fixtureTool({
    name: "search_netflix",
    description: "在 Netflix 測試資料中搜尋影片",
    parameters: z.object({
      query: z.string(),
      limit: z.number().default(5),
    }),
    result: [{ title: "Inception", release_year: "2010" }],
  }),
  pythonBook: fixtureTool({
    name: "search_learn_python",
    description: "搜尋《為你自己學 Python》的測試知識庫",
    parameters: z.object({
      query: z.string(),
      limit: z.number().default(5),
    }),
    result: [
      {
        score: 0.93,
        text: "本書從零開始，預設讀者沒有程式設計經驗。",
      },
    ],
  }),
};
