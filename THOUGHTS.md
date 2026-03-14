# voice-learn

## Idea

- The idea of this app is to learn out aloud, a popular technique called Feynman that helps us to learn anything and explain it in simpler terms.
- The technique follows a 4 step mental model,
  - Select a topic and write down whatever knowledge you have
  - Explain it to a 12 year old avoiding jargons and if you can't explain then you've not understood fully
  - Identify the gaps, refine them with a good explanation and get a deeper understanding

## Motive

The traditional way used pen and paper techinque writing down topics, identifying gaps, refining explanation. But we could use voice AI to allow anyone to speak out their learning, analyse the gaps and gather a deeper understanding on their subject.

## How to achieve the idea

- Have a voice AI model that captures users voice recording, analyse their explanation, provide gaps and strengths. This solves the identifying gaps step.
- Generate flash card questions related to the weaker gap points. This solves the knowledge refinement problem.
- Enforce this as a habit by allowing streak based learning, review type flash cards, insights on their learning.

## Functional requirements

- Ability to record voice and speak their learning. For now let's allow 10mins per record, 30mins max for a day.
- Ability to select a topic, difficulty level and record their learning.
- Ability to view transcripts, recording, strengths, gap points, followup questions, score (out of 10) post recording of voice session **(Agentic AI Pipeline)**
- Ability to generate flash cards for recorded learnings specifically focusing on weaker or gap points.
- Ability to review generated flash cards and refine their scores back.
- Ability to view flash cards on a spaced reptition algorithm. (If you score low on a flashcard, it will show up more often so you can practice the weaker concepts. If you score high, it will appear less often. This way, difficult topics come up frequently, while well-known cards come back only once in a while to help you remember them for long-term)
- Ability to chat with their learnings and ask anything **(RAG)**
- Ability to view insights such as Topics learned (with avg scores on each), strongest topic learned with it's score, weaker topics that needs an improvement.
- Ability to view their streak, activity heatmap **(UI / UX needs to addressed later)**

## Non-functional requirements

- Rate limiting per session, per day on an account basis.
- Eventual consistency for insights, streak count, and any other stats.
- System should be highly available
- Latency for AI Analysis for a topic should be less than 3s for now. Later this should even be reduced to < 2s
- Accuracy for the speech to text should be an industry standard

## UI / UX Scenarios

- **Login, Signup**: Creating an account, logging in to the voice learn app
- **Dashboard / Home**: Post login, in the dashboard screen user could review their flash cards, see their recent 5 to 7 explanations with each explanation displayed as a card
- **Library**: List of all their explanations, each explanation has it's audio recording, transcripts, strengths, weaker gap points, follow up questions with AI Generated answers, auto generated flashcards
- **Flashcards**: List of auto generated flashcards for their learning sessions, review them and get scores.
- **Insights**: Insights such as list of topics learned with avg score of each, strongest topic, weaker topic learned and needs improvement.
- **Settings**: Update profile name, profile avatar.

## Screenshots

1. Onboarding Page

![Onboarding Page](screenshots/onboarding.png)

2. Login / Signup

![Sign In](screenshots/signin.png)
![Sign Up](screenshots/signup.png)

3. Home page

![Home Page](screenshots/homepage.png)

4. Explanation card details

![Explanation Card](screenshots/explanation-card.png)

5. Library page

![Library](screenshots/library.png)

6. Flashcards page (the stats at the top of this page should be reviewed in the design to decide if it's needed or not)

![Flashcards](screenshots/flashcards.png)

7. Review flashcards page

![Review Flashcards](screenshots/review-flashcards.png)

8. Insights page

![Insights](screenshots/insights.png)

9. New recording start page

![New Recording Start](screenshots/new-recording-start.png)

10. In progress voice recording session page

![In Progress Voice Recording Session](screenshots/in-progress-voice-recording-session.png)

11. AI Analysis page post voice record session

![AI Analysis](screenshots/ai-analysis.png)

## Technical flow - TLDR (This was taken as a summary from a whole conversation thread chatted with an LLM by providing the High Level design)

### This section includes the design decision taken and the reason behind it

**1. User Authentication Flow**

- User opens VoiceLearn and signs up with email/password or Google OAuth. For email signup, the frontend sends name, email, and password to the backend. The backend hashes the password using bcrypt (salt is built into bcrypt, no separate salt column needed), creates a user record in PostgreSQL, generates a JWT access token and a refresh token, and sends both back.
- The access token is short-lived (15 minutes), the refresh token is long-lived (7 days). The frontend stores the access token in memory (this is abstracted by HTTP Client and we can use axios for this) and the refresh token in an httpOnly cookie.
- For Google OAuth, the frontend redirects to Google's consent screen, gets back an auth code, sends it to the backend. The backend exchanges the code with Google for the user's profile info, creates or finds the user record using the google_id, and issues the same JWT pair.
- Every subsequent API request from the frontend includes the access token in the Authorization header. When it expires, the frontend silently uses the refresh token to get a new access token.

**2. Start Recording Flow**

- User fills in the topic, subject, and difficulty on the New Recording page and clicks Start Recording. Here's what happens step by step.
- The frontend sends POST /api/sessions with the topic, subject, difficulty, and the user's access token. The backend first validates the token and extracts the user ID. - Then it checks the rate limit (explained in the next section). If the user is within limits, the backend creates a session record in PostgreSQL with status "recording" and the current timestamp as created_at. It generates a presigned S3 URL for the audio upload — the S3 key is predictable, something like audio/{userId}/{sessionId}.webm. It returns the session ID, the presigned S3 URL, and the max allowed recording time for this session back to the frontend.
- The frontend receives the response and does two things. It starts capturing audio from the microphone using the MediaRecorder API and buffering the raw audio blob locally (this is for the S3 upload later). It also opens a WebSocket connection to wss://api.voicelearn.com/ws/session/{sessionId}.
- On the backend, when the WebSocket connects, the backend authenticates it (the session ID is tied to a user, so it verifies the requesting user owns this session). The backend then opens a second WebSocket connection to Deepgram's streaming transcription API.
- Now the real-time loop begins. The browser captures audio in 250ms chunks and sends each chunk as a binary WebSocket frame to the backend. The backend receives each chunk and immediately forwards it to Deepgram's WebSocket. Deepgram processes the audio and sends back partial transcript text. The backend accumulates these partial results into a growing full transcript string tied to this session.
- The frontend also starts a timer counting up. When the timer reaches the max recording time returned by the backend, the frontend auto-stops the recording.
- Why WebSocket and not WebRTC: WebRTC is for peer-to-peer communication like video calls between two browsers. It requires STUN/TURN servers and ICE negotiation which is complexity we don't need. We have a straightforward client-to-server audio stream, and WebSocket handles that perfectly.
- Why Deepgram streaming and not OpenAI Whisper: Whisper is a batch API — you upload the complete audio file after recording ends and wait for the full transcription. For a 2-minute recording, that's 3-5 seconds of waiting before the agent pipeline can even start. Deepgram processes audio in real time as the user speaks, so by the time they hit Stop, the transcript is already 99% complete. This saves us 3-5 seconds which is critical for hitting the 3-second response time target.
- Why presigned URL for audio upload: The alternative is routing the audio file through our backend to S3. That means our backend has to receive a 1-2MB file, hold it in memory, and upload it to S3 — all while also running the agent pipeline. Presigned URLs let the frontend upload directly to S3, keeping our backend free to focus on the analysis.

**3. Stop Recording and Analysis Flow**

- User clicks Stop. Three independent things happen simultaneously.
- Path 1 — Frontend uploads audio to S3. The browser takes the complete audio blob from MediaRecorder and sends a PUT request directly to the presigned S3 URL. This runs in the background. The frontend tracks the upload promise so it knows when it finishes, but the user isn't waiting on this.
- Path 2 — Backend runs the agent pipeline. The frontend sends a "stop" message over the WebSocket. The backend receives it, calculates the recording duration (now minus session created_at), closes the Deepgram WebSocket (which triggers Deepgram to flush any remaining audio and send the final transcript pieces), and assembles the complete transcript.
- Now the agent pipeline kicks off.
- Agent 1 (Concept Extractor) runs first. It takes the raw transcript, topic, subject, and difficulty. It sends these to an LLM (Claude Haiku or GPT-4o mini for speed) with a prompt that says "extract the main concepts this person explained, what they said about each concept, any analogies used, and key terms mentioned. Return JSON." It comes back in about 800ms with a structured breakdown of what the user actually said.
- Why a fast/cheap model for Agent 1: This agent is just parsing and structuring text. It doesn't need deep reasoning. A smaller faster model handles this perfectly and saves 300-400ms compared to a larger model.
- Agent 2 runs next, but split into two parallel calls. The fact-checker takes Agent 1's output and asks "are the claims this person made actually correct?" The completeness checker takes Agent 1's output and asks "given this topic at this difficulty, what important concepts were not covered?" These two calls are independent. - The fact-checker doesn't need to know what's missing to verify what was said, and the completeness checker doesn't need to know if what was said is accurate to identify gaps. So they run at the same time using Promise.all. Both take about 800ms each, but since they run in parallel, only 800ms of wall clock time passes.
- Why parallel and not sequential: Running them one after another would take 1600ms. Running them simultaneously takes 800ms. Same results, half the time. This 800ms saving is the difference between hitting and missing the 3-second target.
- Agent 3A (Scorer) and Agent 3B (Content Generator) both fire next, also in parallel. Agent 3A takes all previous outputs and generates the score, strengths summary, and gaps summary. This is a small output, comes back in about 500-600ms. Agent 3B takes the same inputs and generates the test-yourself Q&As and flashcards. This is a heavier output, takes about 800-900ms.
- Why split Agent 3 into two parallel calls: If it were one call generating everything, the user waits for the full 900ms. By splitting it, Agent 3A finishes faster and we can send its results to the user immediately while 3B is still running.
- The backend sends results to the frontend progressively over the WebSocket. As soon as Agent 3A finishes, it sends a message with the score, strengths, and gaps. The frontend navigates to the results page and renders these immediately. The test-yourself and flashcards sections show a subtle loading state. When Agent 3B finishes, the backend sends a second message with the Q&As and flashcards. The frontend fills those sections in with a smooth transition.
- Why WebSocket for delivering results and not REST polling or SSE: The WebSocket is already open from the recording phase. Reusing it avoids opening a new connection. REST polling would mean the frontend hitting an endpoint repeatedly asking "are results ready yet?" which wastes requests and adds latency. SSE would work but it's a second protocol to manage when we already have a WebSocket.
- Path 3 — Backend saves to database. As each agent completes, the backend updates the session record in PostgreSQL. After all agents finish, the session has its transcript_text, score, strengths, gaps, test_yourself_qas (JSON), and status set to "completed." The flashcards are inserted as separate rows in the flashcards table with their initial spaced repetition values (next_review_at set to tomorrow, interval_days set to 1, ease_factor set to 2.5, review_count set to 0).
- After everything is saved, the backend pushes a job to the RAG indexing queue (explained in section 5).

**4. Rate Limiting Flow**

- Every time the frontend calls POST /api/sessions to start a new recording, the backend checks rate limits before creating the session. Here's the step-by-step.
- The backend reads the Redis key ratelimit:{userId}:daily. This key holds an integer — the total seconds of recording the user has used today. If the key doesn't exist (first recording of the day or the key expired at midnight), it means zero seconds used.
- The backend also reads the user's plan limits. For now these are hardcoded (600 seconds per session, 1800 seconds per day) but later they could come from a user_plans table in PostgreSQL or be cached in Redis.
- It calculates remaining daily budget: max daily seconds minus seconds used. If remaining is zero or negative, return a 429 error with a message like "Daily recording limit reached. Resets at midnight." The frontend disables the New Recording button and shows this message.
- If there's budget remaining, the session max time is the smaller of the per-session limit and the remaining daily budget. So if the user has used 25 minutes today out of 30, the session max is 5 minutes, not 10.
- The backend creates the session and returns the max recording time to the frontend. The frontend uses this to cap the recording timer.
- When the user stops recording, the backend calculates the actual duration and runs a Redis MULTI/EXEC transaction: INCRBY ratelimit:{userId}:daily {duration}. This is atomic — it executes in microseconds.
- Why Redis and not PostgreSQL for rate limiting: The rate limit check happens on every recording start. It needs to be fast (single-digit milliseconds) and atomic (no race conditions if the user rapidly starts and stops recordings). Redis gives both. PostgreSQL could work but it's slower for this kind of frequent read-write-on-same-key pattern and achieving atomicity requires row-level locking.
- Why MULTI/EXEC and not just INCRBY: Honestly for the current design a simple INCRBY is sufficient since it's a single atomic operation. MULTI/EXEC becomes useful if you later need to update multiple keys atomically in one transaction. For now, plain INCRBY works.
- The daily key has a TTL set to expire at midnight. When you first create or update it, you calculate the Unix timestamp of midnight tonight and set it using EXPIREAT. When it expires, the key disappears. Next recording attempt creates it fresh at zero. No cleanup cron jobs needed.
- Why TTL-based expiry and not a cron job: A cron job that resets all users' limits at midnight is an extra moving part that can fail silently. TTL-based expiry is built into Redis and is guaranteed to work. Less infrastructure, less things to break.
- The rapid stop-and-start race condition: If the user stops a recording and immediately clicks Start again, the INCRBY from the stop handler executes in microseconds in Redis. The new Start request has to travel over the network, hit the API server, go through auth middleware, and then read Redis. By that time, the stop handler's Redis write is long done. The rate limit read will always see the updated value.

**5. RAG Indexing Flow**

- After the agent pipeline finishes and results are saved to PostgreSQL, the backend pushes a job onto a BullMQ queue (backed by Redis): { type: "index_session", sessionId: "sess_abc123" }. This is fire-and-forget from the main flow's perspective — the user never waits for this.
- A separate worker process picks up the job. It creates a record in the rag_index_jobs table with status "queued." Then it queries PostgreSQL using the session ID to fetch the transcript, strengths, gaps, test-yourself Q&As, and flashcards.
- The worker chunks the data. The transcript gets split into concept-based segments using Agent 1's extracted concepts (stored in the session or re-derived from the transcript). If that's too complex initially, it just splits by every 2-3 sentences. The strengths text becomes one chunk. The gaps text becomes one chunk. Each flashcard (question plus answer) becomes one chunk.
- Each chunk gets metadata attached: the chunk type (transcript, strength, gap, flashcard), the session ID, the topic, the subject, and the date. Then each chunk is embedded using an embedding model (OpenAI's text-embedding-3-small or similar) and upserted into the vector database under the user's single namespace.
- The worker updates the rag_index_jobs record with status "completed", the number of chunks indexed, and the completed_at timestamp. If anything fails, it sets status to "failed" with the error message.
- Why BullMQ and not a direct async call: If the RAG indexing runs as a direct async function in the same process as the API server, a failure in indexing could potentially affect the API server's stability. A job queue decouples them. The worker can crash, restart, and retry without affecting the user-facing API. BullMQ also gives you automatic retries, dead letter queues for persistent failures, and visibility into job status — all for free.
- Why a single namespace per user and not separate namespaces per data type: Separate namespaces like userId:transcripts and userId:gaps mean you'd need multiple vector searches per chat query because you don't know which namespace has the relevant answer. A single namespace with metadata on each chunk lets you do one search and filter by type using metadata if needed. Simpler, faster, and easier to manage.
- Why session ID in the job and not the actual data: If you pass the full transcript and AI results in the job payload, you're coupling the job format to the data structure. If the RAG worker needs to change how it processes data, you'd have to change the job producer too. With just a session ID, the worker fetches fresh data from PostgreSQL and processes it however it needs. Also if the job fails and retries, it always gets the latest data.

**6. Chat Query Flow**

- User opens the Chat page and types a question like "What gaps do I still have in networking?"
- The frontend sends POST /api/chat/conversations/{conversationId}/messages with the message content. If it's a new conversation, the frontend first creates one with POST /api/chat/conversations.
- The backend takes the user's question, calls the embedding model to convert it into a vector, and searches the user's namespace in the vector database with a top-k of around 8-10 results. The vector DB returns the most semantically similar chunks — maybe some transcript segments about HTTP and TCP, a couple of gap chunks mentioning DNS and TLS, and a flashcard about status codes.
- The backend then constructs a prompt for the LLM. The system prompt says something like "You are a learning assistant. The user is asking about their own learning history. Use the following context from their past recordings to answer. Cite which recording each piece of information came from." The context section includes all the retrieved chunks with their metadata (topic, date, type). The user message is Alex's question.
- The LLM generates a response grounded in Alex's actual learning data. The backend saves both the user message and the assistant message to the chat_messages table. The assistant message includes a sources JSON array with the session IDs that were cited, so the frontend can render the citation pills linking back to specific recordings.
- The response is sent back to the frontend and displayed in the chat interface.
- Why not stream the chat response: You could use SSE or WebSocket to stream the LLM's response token by token for a ChatGPT-like typing effect. This is a nice-to-have but not essential for an MVP. A simple request-response that returns the full message is simpler to build and good enough. You can add streaming later.

**7. Flashcard Review Flow**

- User clicks on a flashcard's Review button on the Flashcards page. The frontend already has the card data (question, answer, source recording, interval info) loaded from GET /api/flashcards?userId={userId}&due=true which returns all flashcards where next_review_at is before now.
- The user reads the question, thinks, clicks to flip, sees the answer, and rates it as Forgot, Hard, Good, or Easy. The frontend sends PATCH /api/flashcards/{id}/review with the rating.
- The backend applies the SM-2 spaced repetition algorithm. Based on the rating, it recalculates the ease_factor (a multiplier that increases for Easy ratings and decreases for Forgot), calculates the new interval_days (previous interval multiplied by the ease factor, with minimums — Forgot always resets to 1 day), sets next_review_at to now plus the new interval in days, increments review_count, and sets last_reviewed_at to now. It updates the flashcard record in PostgreSQL and returns the updated card to the frontend.
- The frontend shows the next card or, if all due cards are reviewed, shows the session complete summary.
- Why SM-2 and not a simpler algorithm: SM-2 is the standard spaced repetition algorithm used by Anki and most flashcard systems. It's well-proven and not complex to implement — it's about 15 lines of code. A simpler approach like fixed intervals (1 day, 3 days, 7 days, 14 days) doesn't adapt to the user's actual recall ability per card. SM-2 makes easy cards appear less often and hard cards appear more often, which is more efficient for the user's time.

## ER Diagram

![ER Diagram](screenshots/voice-learn-er-diagram.png)
