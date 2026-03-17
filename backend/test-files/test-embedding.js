import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testEmbedding() {
  try {
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "HTTP is how browsers communicate with servers",
    });

    const vector = result.data[0].embedding;
    console.log("Type:", typeof vector);
    console.log("Is array:", Array.isArray(vector));
    console.log("Dimensions:", vector.length);
    console.log("First 5 values:", vector.slice(0, 5));

    console.log("OPENAI EMBEDDING WORKING PERFECTLY");
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

testEmbedding();
