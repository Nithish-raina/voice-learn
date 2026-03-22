import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: "johndoe@gmail.com" },
    });
    if (!user) {
      console.log("Create a user first by signing up via the API");
      return;
    }

    console.log("User:", user.id);

    // Create completed sessions with scores
    const sessions = await Promise.all([
      prisma.session.create({
        data: {
          userId: user.id,
          topic: "How HTTP Works",
          subject: "Programming",
          difficulty: "intermediate",
          status: "completed",
          score: 8,
          strengths:
            "Clear request-response explanation. Good restaurant analogy.",
          gaps: "Missed DNS resolution and TLS handshake.",
          durationSeconds: 154,
          transcriptText: "HTTP is how browsers talk to servers...",
          testYourselfQas: [
            {
              question: "What happens before an HTTP request?",
              answer: "DNS resolution then TCP handshake...",
            },
          ],
          createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          topic: "Binary Search Trees",
          subject: "Programming",
          difficulty: "advanced",
          status: "completed",
          score: 5,
          strengths: "Understood basic tree structure.",
          gaps: "Could not explain balancing or time complexity.",
          durationSeconds: 192,
          transcriptText: "A BST is a tree where left is smaller...",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          topic: "Photosynthesis",
          subject: "Science",
          difficulty: "beginner",
          status: "completed",
          score: 9,
          strengths: "Excellent coverage of light and dark reactions.",
          gaps: "Minor gap in explaining electron transport chain.",
          durationSeconds: 108,
          transcriptText: "Photosynthesis converts light energy...",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          topic: "Supply and Demand",
          subject: "Business",
          difficulty: "intermediate",
          status: "completed",
          score: 6,
          strengths: "Good grasp of basic supply demand curve.",
          gaps: "Missed elasticity and market equilibrium.",
          durationSeconds: 125,
          transcriptText: "Supply and demand is about how prices are set...",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      }),
      prisma.session.create({
        data: {
          userId: user.id,
          topic: "How HTTP Works",
          subject: "Programming",
          difficulty: "intermediate",
          status: "completed",
          score: 9,
          strengths: "Covered DNS, TLS, and full request lifecycle.",
          gaps: "Could go deeper on HTTP/2 vs HTTP/1.1.",
          durationSeconds: 180,
          transcriptText: "HTTP starts with DNS resolution...",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
      }),
    ]);

    console.log("Created", sessions.length, "sessions");

    // Create flashcards — mix of due and upcoming
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setDate(nextMonth.getDate() + 35);

    const flashcards = await Promise.all([
      // Due today (nextReviewAt in the past)
      prisma.flashcard.create({
        data: {
          sessionId: sessions[0].id,
          userId: user.id,
          question:
            "What is DNS and what role does it play before an HTTP request?",
          answer:
            "Domain Name System translates domain names to IP addresses. Before any HTTP request, the browser queries DNS to resolve the server IP.",
          nextReviewAt: yesterday,
          intervalDays: 1,
          easeFactor: 2.5,
          reviewCount: 0,
          status: "active",
        },
      }),
      prisma.flashcard.create({
        data: {
          sessionId: sessions[0].id,
          userId: user.id,
          question: "Explain the TLS handshake process.",
          answer:
            "Client sends hello with supported ciphers. Server responds with certificate. Both generate session keys. Encrypted connection established.",
          nextReviewAt: yesterday,
          intervalDays: 1,
          easeFactor: 2.5,
          reviewCount: 0,
          status: "active",
        },
      }),
      prisma.flashcard.create({
        data: {
          sessionId: sessions[0].id,
          userId: user.id,
          question: "What are the 5 HTTP status code categories?",
          answer:
            "1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Error, 5xx Server Error.",
          nextReviewAt: yesterday,
          intervalDays: 1,
          easeFactor: 2.5,
          reviewCount: 0,
          status: "active",
        },
      }),
      // Due today from different session
      prisma.flashcard.create({
        data: {
          sessionId: sessions[1].id,
          userId: user.id,
          question:
            "What is the time complexity of searching in a balanced BST?",
          answer:
            "O(log n) because each comparison eliminates half the remaining nodes.",
          nextReviewAt: yesterday,
          intervalDays: 3,
          easeFactor: 2.5,
          reviewCount: 1,
          lastReviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "active",
        },
      }),
      prisma.flashcard.create({
        data: {
          sessionId: sessions[1].id,
          userId: user.id,
          question: "What makes a BST balanced vs unbalanced?",
          answer:
            "A balanced BST has roughly equal height on left and right subtrees. Unbalanced degrades to O(n) search time.",
          nextReviewAt: yesterday,
          intervalDays: 1,
          easeFactor: 2.35,
          reviewCount: 1,
          status: "active",
        },
      }),
      // Upcoming (not due yet)
      prisma.flashcard.create({
        data: {
          sessionId: sessions[2].id,
          userId: user.id,
          question: "What is the electron transport chain in photosynthesis?",
          answer:
            "A series of protein complexes in thylakoid membranes that transfer electrons to produce ATP.",
          nextReviewAt: tomorrow,
          intervalDays: 3,
          easeFactor: 2.65,
          reviewCount: 2,
          status: "active",
        },
      }),
      prisma.flashcard.create({
        data: {
          sessionId: sessions[3].id,
          userId: user.id,
          question: "What is price elasticity of demand?",
          answer:
            "Measures how sensitive quantity demanded is to price changes. Elastic means demand changes a lot with price.",
          nextReviewAt: nextWeek,
          intervalDays: 7,
          easeFactor: 2.5,
          reviewCount: 2,
          status: "active",
        },
      }),
      // Mastered (high interval)
      prisma.flashcard.create({
        data: {
          sessionId: sessions[4].id,
          userId: user.id,
          question: "What is the HTTP request-response cycle?",
          answer:
            "Client sends a request with method, URL, headers. Server processes it and returns a response with status code, headers, body.",
          nextReviewAt: nextMonth,
          intervalDays: 35,
          easeFactor: 2.8,
          reviewCount: 5,
          status: "active",
        },
      }),
    ]);

    console.log("Created", flashcards.length, "flashcards");
    console.log("Due today:", 5);
    console.log("Upcoming:", 2);
    console.log("Mastered:", 1);

    console.log("\nTEST DATA SEEDED SUCCESSFULLY");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
