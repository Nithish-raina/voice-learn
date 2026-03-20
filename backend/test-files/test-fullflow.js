import "dotenv/config";
import WebSocket from "ws";
import { readFileSync } from "fs";

// You need a real audio file for this test
// Record a short .wav file saying something about HTTP
// Or download a sample: https://dpgr.am/spacewalk.wav
// Convert to raw PCM 16-bit 16kHz mono if needed

const TOKEN = "YOUR_ACCESS_TOKEN";
const SESSION_ID = "YOUR_SESSION_ID";

const ws = new WebSocket(
  `ws://localhost:3000/ws?sessionId=${SESSION_ID}&token=${TOKEN}`,
);

ws.on("open", () => {
  console.log("WebSocket connected");
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log(
    `[${new Date().toISOString()}] ${msg.type}:`,
    msg.stage || msg.data?.partial?.substring(0, 50) || "",
  );

  if (msg.type === "status" && msg.stage === "ready") {
    console.log("Sending audio...");

    // For testing without a real mic, we can simulate with Deepgram's REST API
    // and just test the pipeline part. Let's send a fake transcript via stop.
    // In production, the frontend sends real audio chunks here.

    // Simulate: wait 3 seconds then stop
    setTimeout(() => {
      console.log("Sending stop signal...");
      ws.send(JSON.stringify({ type: "stop" }));
    }, 3000);
  }

  if (msg.type === "transcript_partial") {
    console.log("  Transcript so far:", msg.data.full.substring(0, 80) + "...");
  }

  if (msg.type === "results_partial") {
    console.log("\n=== PARTIAL RESULTS ===");
    console.log("Score:", msg.data.score);
    console.log("Strengths:", msg.data.strengths);
    console.log("Gaps:", msg.data.gaps);
  }

  if (msg.type === "results_complete") {
    console.log("\n=== COMPLETE RESULTS ===");
    console.log("Q&As:", msg.data.testYourselfQas?.length);
    msg.data.testYourselfQas?.forEach((qa, i) => {
      console.log(`Q${i + 1}: ${qa.question}`);
    });
    console.log("Flashcards:", msg.data.flashcards?.length);
    msg.data.flashcards?.forEach((f, i) => {
      console.log(`Card ${i + 1}: ${f.question}`);
    });
  }

  if (msg.type === "error") {
    console.log("Error:", msg.error.code, msg.error.message);
  }

  if (msg.type === "status" && msg.stage === "complete") {
    console.log("\nFULL PIPELINE COMPLETED");
    ws.close();
  }
});

ws.on("close", (code, reason) => {
  console.log("Closed:", code);
  process.exit(0);
});

ws.on("error", (err) => {
  console.error("Error:", err.message);
});
