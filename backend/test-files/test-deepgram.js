import "dotenv/config";

async function testDeepgram() {
  try {
    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://dpgr.am/spacewalk.wav",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const transcript = result.results.channels[0].alternatives[0].transcript;
    console.log("Deepgram transcribed audio");
    console.log("First 100 chars:", transcript.substring(0, 100) + "...");
    console.log(
      "Confidence:",
      result.results.channels[0].alternatives[0].confidence,
    );

    console.log("DEEPGRAM IS WORKING PERFECTLY");
  } catch (error) {
    console.error("Deepgram test failed:", error.message);
  }
}

testDeepgram();
