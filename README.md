# VoiceLearn

You learn best when you explain things out loud. VoiceLearn lets you record yourself explaining any topic, then tells you what you got right, what you missed, and helps you remember it all.

## Screenshot

![Voice-learn](docs/output/voice-learn.png)

## How it works

1. Pick a topic — like "How HTTP Works" or "Photosynthesis"
2. Hit record and explain it like you're teaching someone
3. Get instant feedback — a score, what you nailed, what you missed
4. Review flashcards built from your weak spots

That's it. Record, learn what you don't know, fix it.

## Features

### Record and explain

Choose a topic, a subject, and a difficulty level. Hit record and start talking.

### Instant analysis

Once you stop recording, the app breaks down your explanation. It pulls out the key concepts you covered, checks them for accuracy, and figures out what important things you left out. You see results streaming in — no waiting for a loading screen.

### Score and feedback

You get a score out of 10, a list of things you explained well (strengths), and a list of things you missed or got wrong (gaps). This is the part that actually teaches you — seeing the gap between what you think you know and what you actually know.

### Flashcards

The app generates flashcards automatically, and they specifically target the stuff you got wrong or forgot to mention. These aren't random cards — they're built from your actual knowledge gaps.

Cards are scheduled using spaced repetition. You'll see them again tomorrow, then in 3 days, then a week, and so on — depending on how well you remember them. Cards you struggle with come back more often.

### Library

Every recording is saved. You can search through past sessions by topic, filter by subject, and revisit your results anytime.

### Insights

Track your progress over time. See your score trends, which subjects you're strongest in, which topics need more work, your recording streak, and an activity heatmap.

### Works on your phone

The whole app works on mobile. On smaller screens, the sidebar turns into a bottom navigation bar and everything stacks nicely.

## Getting started

### You'll need

- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) has a free tier)
- A Redis instance ([Upstash](https://upstash.com) has a free tier)
- API keys for Deepgram, Anthropic, and AWS S3

### Setup

```bash
git clone https://github.com/Nithish-raina/voice-learn.git
cd voice-learn

# Backend
cd backend
npm install
cp .env.example .env    # fill in your keys
npx prisma db push      # create database tables
npm run dev              # starts on :3000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev              # starts on :5173
```

### Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@host/dbname
REDIS_URL=redis://default:pass@host:port

JWT_SECRET=pick-something-random
JWT_REFRESH_SECRET=pick-something-else-random

DEEPGRAM_API_KEY=your-key
ANTHROPIC_API_KEY=your-key

AWS_ACCESS_KEY=your-key
AWS_SECRET_ACCESS=your-secret
AWS_BUCKET_NAME=your-bucket
AWS_REGION=ap-south-1

PINECONE_API_KEY=your-key
PINECONE_INDEX=voice-learn

CLIENT_URL=http://localhost:5173

# Optional
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
```

## License

MIT
