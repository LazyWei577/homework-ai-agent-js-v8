export const getNearbyYoubikeTool = {
  type: "function",
  name: "get_nearby_youbike",
  description: "取得指定經緯度座標附近可租借的 YouBike 站點",
  parameters: {
    type: "object",
    properties: {
      lat: { type: "number", description: "緯度" },
      lon: { type: "number", description: "經度" },
      radius: {
        type: "number",
        description: "搜尋半徑（公尺），預設 500",
      },
      available_amount: {
        type: "number",
        description: "至少可租借車輛數，預設 0",
      },
      limit: {
        type: "number",
        description: "回傳筆數上限，預設 3",
      },
    },
    required: ["lat", "lon"],
  },
  strict: false,
};

export async function getNearbyYoubike({ lat, lon }) {
  return {
    message: "尚未實作，將在 2.4 完成",
    lat,
    lon,
  };
}
