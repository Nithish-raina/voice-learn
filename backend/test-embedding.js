import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_API_KEY);

async function testEmbedding() {
  try {
    const result = await client.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: "HTTP is how browsers communicate with servers",
    });

    // Check what we got back
    console.log("Type:", typeof result);
    console.log("Is array:", Array.isArray(result));

    // It might be nested - let's see the shape
    if (Array.isArray(result)) {
      if (Array.isArray(result[0])) {
        console.log("Shape: nested array");
        console.log("Dimensions:", result[0].length);
        console.log("First 5 values:", result[0].slice(0, 5));
      } else {
        console.log("Shape: flat array");
        console.log("Dimensions:", result.length);
        console.log("First 5 values:", result.slice(0, 5));
      }
    }

    console.log("HUGGINGFACE EMBEDDING WORKING");
  } catch (error) {
    console.error("Failed:", error.message);
  }
}

testEmbedding();
