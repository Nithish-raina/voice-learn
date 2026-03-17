import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log("Prisma Client initialised");
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@voicelearn.com",
        passwordHash: "fakehash123",
      },
    });
    console.log("Created user:", user.id);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        topic: "How HTTP Works",
        subject: "Programming",
        difficulty: "intermediate",
        status: "completed",
        score: 8,
        strengths: "Good explanation of request-response",
        gaps: "Missed DNS resolution",
        durationSeconds: 154,
      },
    });
    console.log("Created session:", session.id);

    const flashcard = await prisma.flashcard.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        question: "What is DNS?",
        answer: "Domain Name System translates domain names to IP addresses",
        nextReviewAt: new Date(Date.now() + 86400000),
        intervalDays: 1,
        easeFactor: 2.5,
        reviewCount: 0,
      },
    });
    console.log("Created flashcard:", flashcard.id);

    const fullSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: { flashcards: true, user: true },
    });
    console.log(
      "Created session with flashcards:",
      fullSession.topic,
      "- Cards:",
      fullSession.flashcards.length,
    );
    console.log("DATABASE IS WORKING PERFECTLY");
  } catch (error) {
    console.error("Database test failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
