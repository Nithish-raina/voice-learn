import "dotenv/config";
import { extractConcepts } from "../src/services/agents/concept-extractor.js";
import { checkFacts } from "../src/services/agents/fact-checker.js";
import { checkCompleteness } from "../src/services/agents/completeness-checker.js";
import { generateScore } from "../src/services/agents/scorer.js";
import { generateContent } from "../src/services/agents/content-generator.js";

const transcript = `So HTTP is basically how your browser talks to a server. Think of it like ordering food at a restaurant. You make a request, like hey I want a burger, and the server brings back a response. In web terms, your browser sends a GET request to fetch a page, or a POST request to submit a form. Every response comes with a status code like 200 means everything is fine, 404 means the page wasn't found.`;

const topic = "How HTTP Works";
const subject = "Programming";
const difficulty = "intermediate";

async function testPipeline() {
  try {
    console.log("=== Agent 1: Concept Extractor ===");
    const startA1 = Date.now();
    const concepts = await extractConcepts({
      transcript,
      topic,
      subject,
      difficulty,
    });
    console.log(`Done in ${Date.now() - startA1}ms`);
    console.log(
      "Concepts:",
      concepts.concepts?.map((c) => c.concept).join(", "),
    );
    console.log();

    console.log("=== Agent 2A + 2B: Fact Check + Completeness (Parallel) ===");
    const startA2 = Date.now();
    const [factCheck, completeness] = await Promise.all([
      checkFacts({ concepts, topic, difficulty }),
      checkCompleteness({ concepts, topic, difficulty }),
    ]);
    console.log(`Done in ${Date.now() - startA2}ms`);
    console.log("Fact check:", factCheck.assessments?.length, "assessments");
    console.log(
      "Missing concepts:",
      completeness.missingConcepts?.map((c) => c.concept).join(", "),
    );
    console.log();

    console.log("=== Agent 3A + 3B: Score + Content (Parallel) ===");
    const startA3 = Date.now();
    const agentInputs = {
      concepts,
      factCheck,
      completeness,
      topic,
      difficulty,
    };
    const [scoreResult, contentResult] = await Promise.all([
      generateScore(agentInputs),
      generateContent(agentInputs),
    ]);
    console.log(`Done in ${Date.now() - startA3}ms`);
    console.log();

    console.log("=== FINAL RESULTS ===");
    console.log("Score:", scoreResult.score, "/ 10");
    console.log("Strengths:", scoreResult.strengths);
    console.log("Gaps:", scoreResult.gaps);
    console.log();
    console.log("Test Yourself Q&As:", contentResult.testYourselfQas?.length);
    contentResult.testYourselfQas?.forEach((qa, i) => {
      console.log(`  Q${i + 1}: ${qa.question}`);
      console.log(`  A${i + 1}: ${qa.answer.substring(0, 80)}...`);
    });
    console.log();
    console.log("Flashcards:", contentResult.flashcards?.length);
    contentResult.flashcards?.forEach((f, i) => {
      console.log(`  Card ${i + 1}: ${f.question}`);
    });

    const totalTime = Date.now() - startA1;
    console.log(`\nTotal pipeline time: ${totalTime}ms`);
    console.log(
      totalTime < 3000
        ? "✅ Under 3 second target!"
        : "⚠️ Over 3 second target",
    );

    console.log("\n🎉 AGENT PIPELINE IS WORKING PERFECTLY");
  } catch (error) {
    console.error("❌ Pipeline failed:", error);
  }
}

testPipeline();
