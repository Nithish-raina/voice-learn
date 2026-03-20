import "dotenv/config";
import WebSocket from "ws";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkODI3OTM4My1kNGZkLTQ1NmItYjlkNi04OTFhNTVkZGUwM2MiLCJpYXQiOjE3NzQwMTg2MDIsImV4cCI6MTc3NDAxOTUwMn0.dRpEyroByUulgmKq_MQt5BPK1IO4mh77divlxylUiq8";
const SESSION_ID = "ba5fcca4-642b-491d-8e7e-67192b495c06";

const ws = new WebSocket(
  `ws://localhost:3000/ws?sessionId=${SESSION_ID}&token=${TOKEN}`,
);

ws.on("open", () => {
  console.log("✅ WebSocket connected");
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  console.log("✅ Received:", msg.type, msg.stage || "");

  if (msg.type === "status" && msg.stage === "ready") {
    console.log("✅ Server is ready for audio");

    // Send stop signal after 2 seconds (no audio, just testing the flow)
    setTimeout(() => {
      console.log("Sending stop signal...");
      ws.send(JSON.stringify({ type: "stop" }));
    }, 2000);
  }

  if (msg.type === "error") {
    console.log("❌ Error:", msg.error.code, msg.error.message);
  }

  if (msg.type === "results_partial") {
    console.log(
      "✅ Partial results:",
      JSON.stringify(msg.data).substring(0, 100) + "...",
    );
  }

  if (msg.type === "results_complete") {
    console.log("✅ Complete results received");
    console.log("  Q&As:", msg.data.testYourselfQas?.length || 0);
    console.log("  Flashcards:", msg.data.flashcards?.length || 0);
  }

  if (msg.type === "status" && msg.stage === "complete") {
    console.log("\n🎉 FULL FLOW COMPLETED");
    ws.close();
  }
});

ws.on("close", (code, reason) => {
  console.log("WebSocket closed:", code, reason.toString());
  process.exit(0);
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err.message);
  process.exit(1);
});
