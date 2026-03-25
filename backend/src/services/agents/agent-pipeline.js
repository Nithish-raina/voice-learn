import { extractConcepts } from "./concept-extractor.js";
import { checkFacts } from "./fact-checker.js";
import { checkCompleteness } from "./completeness-checker.js";
import { generateScore } from "./scorer.js";
import { generateContent } from "./content-generator.js";
import { sessionRepository } from "../../repositories/session-repository.js";
import { flashcardRepository } from "../../repositories/flashcard-repository.js";
import { ragQueue } from "../../lib/queue-client.js";
import { prisma } from "../../lib/prisma-client.js";
import { SESSION_STATUS } from "../../utils/constants.js";
import logger from "../../lib/logger.js";

export async function runPipeline({
  transcript,
  topic,
  subject,
  difficulty,
  sessionId,
  userId,
  onPartialResults,
  onStageComplete,
}) {
  const log = logger.child({ sessionId });
  log.info("Pipeline started");
  const startTime = Date.now();

  // Agent 1 — Concept Extraction (must run first)
  log.info("Running Agent 1: Concept Extractor");
  const concepts = await extractConcepts({
    transcript,
    topic,
    subject,
    difficulty,
  });
  log.info({ conceptCount: concepts.concepts?.length || 0 }, "Agent 1 done");

  if (onStageComplete) {
    onStageComplete({
      stage: "concepts",
      data: { concepts: concepts.concepts, keyTerms: concepts.keyTerms },
    });
  }

  // Agent 2A + 2B — Fact Check and Completeness Check (parallel)
  log.info("Running Agent 2A + 2B in parallel");
  const [factCheck, completeness] = await Promise.all([
    checkFacts({ concepts, topic, difficulty }),
    checkCompleteness({ concepts, topic, difficulty }),
  ]);
  log.info("Agent 2A + 2B done");

  // Agent 3A + 3B — Scorer and Content Generator (parallel)
  log.info("Running Agent 3A + 3B in parallel");
  const agentInputs = { concepts, factCheck, completeness, topic, difficulty };

  const [scoreResult, contentResult] = await Promise.all([
    generateScore(agentInputs).then((result) => {
      // Send partial results as soon as score is ready
      if (onPartialResults) {
        onPartialResults({
          score: result.score,
          strengths: result.strengths,
          gaps: result.gaps,
        });
      }
      return result;
    }),
    generateContent(agentInputs),
  ]);
  log.info("Agent 3A + 3B done");

  const elapsed = Date.now() - startTime;
  log.info({ elapsedMs: elapsed }, "Pipeline completed");

  // Save everything to database in a transaction
  const savedData = await prisma.$transaction(async (tx) => {
    // Update session with results
    const updatedSession = await tx.session.update({
      where: { id: sessionId },
      data: {
        score: scoreResult.score,
        strengths: scoreResult.strengths,
        gaps: scoreResult.gaps,
        testYourselfQas: contentResult.testYourselfQas,
        status: SESSION_STATUS.COMPLETED,
      },
    });

    // Create flashcards
    const flashcardsData = contentResult.flashcards.map((f) => ({
      sessionId,
      userId,
      question: f.question,
      answer: f.answer,
      nextReviewAt: new Date(), // available for review immediately
      intervalDays: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      status: "active",
    }));

    if (flashcardsData.length > 0) {
      await tx.flashcard.createMany({ data: flashcardsData });
    }

    // Create RAG index job
    await tx.ragIndexJob.create({
      data: {
        sessionId,
        status: "queued",
      },
    });

    // Fetch created flashcards to return
    const flashcards = await tx.flashcard.findMany({
      where: { sessionId },
      select: {
        id: true,
        question: true,
        answer: true,
        nextReviewAt: true,
      },
    });

    return { updatedSession, flashcards };
  });

  // Push RAG indexing job to queue
  try {
    await ragQueue.add("index_session", { sessionId });
    log.info("RAG indexing job queued");
  } catch (error) {
    log.error({ err: error }, "Failed to queue RAG job");
    // Don't fail the pipeline if queue push fails
  }

  return {
    score: scoreResult.score,
    strengths: scoreResult.strengths,
    gaps: scoreResult.gaps,
    testYourselfQas: contentResult.testYourselfQas,
    flashcards: savedData.flashcards,
  };
}
