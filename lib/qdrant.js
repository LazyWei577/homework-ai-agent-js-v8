import { QdrantClient } from "@qdrant/js-client-rest";
import { QDRANT_URL, QDRANT_API_KEY } from "../config.js";
import { client } from "./openai.js";

export const qdrant = new QdrantClient({
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY }),
  checkCompatibility: false,
});

export const COFFEE_COLLECTION = "coffee";
export const EMBEDDING_DIM = 1536;
export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function embed(text) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return res.data[0].embedding;
}

export async function searchCoffee(query, limit = 5) {
  const vector = await embed(query);

  const results = await qdrant.search(COFFEE_COLLECTION, {
    vector,
    limit,
    with_payload: true,
  });

  return results.map((r) => ({
    score: r.score,
    coffee_name: r.payload.coffee_name,
    english_name: r.payload.english_name,
    coffee_base: r.payload.coffee_base,
    main_ingredients: r.payload.main_ingredients,
    milk_foam: r.payload.milk_foam,
    taste: r.payload.taste,
    bitterness_level: r.payload.bitterness_level,
    milkiness_level: r.payload.milkiness_level,
    sweetness_level: r.payload.sweetness_level,
    serving_temperature: r.payload.serving_temperature,
    features: r.payload.features,
    recommended_for: r.payload.recommended_for,
    common_sizes: r.payload.common_sizes,
    recommended_pairings: r.payload.recommended_pairings,
  }));
}
