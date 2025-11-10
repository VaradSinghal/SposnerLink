# Server Setup Guide

## Overview

This server provides AI matching and proposal generation functionality for SponsorLink. It can be deployed to free hosting services like Render, Railway, or Vercel.

## Features

- **AI Matching**: Finds matching brands for events and matching events for brands
- **Proposal Generation**: Generates AI-powered sponsorship proposals
- **Firebase Integration**: Uses Firebase Admin SDK to access Firestore
- **Authentication**: Verifies Firebase ID tokens for secure API access

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
FIREBASE_PROJECT_ID=sponsperlink
OPENAI_API_KEY=your-openai-api-key-here
PORT=5000
```

**Note**: OpenAI API key is optional. Without it, the server will use mock data for AI features.

### 3. Firebase Admin SDK Setup

For local development, you can use Firebase Application Default Credentials or a service account key.

**Option A: Application Default Credentials (Recommended for local)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set application default credentials
firebase use --add
```

**Option B: Service Account Key**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file
4. Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json`

### 4. Run Locally

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### 5. Update Client Configuration

In `client/src/services/apiService.js`, update the `API_URL`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

For production, set `REACT_APP_API_URL` to your deployed server URL.

## Deployment

### Deploy to Render (Free Tier Available)

1. Create a new account at [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     - `FIREBASE_PROJECT_ID=sponsperlink`
     - `OPENAI_API_KEY=your-key` (optional)
     - `PORT=5000`
5. Deploy!

### Deploy to Railway (Free Tier Available)

1. Create a new account at [railway.app](https://railway.app)
2. Create a new project
3. Add a new service from GitHub
4. Select the `server` directory
5. Add environment variables
6. Deploy!

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In the `server` directory, run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

## API Endpoints

### POST `/api/find-matches-for-event`
Find matching brands for an event.

**Request:**
```json
{
  "eventId": "event-id-here"
}
```

**Response:**
```json
{
  "matches": [
    {
      "brandId": "brand-id",
      "brand": {...},
      "score": 85,
      "factors": {...},
      "aiRelevanceIndex": 85
    }
  ]
}
```

### POST `/api/find-matches-for-brand`
Find matching events for a brand.

**Request:**
```json
{
  "brandId": "brand-id-here"
}
```

**Response:**
```json
{
  "matches": [
    {
      "eventId": "event-id",
      "event": {...},
      "score": 85,
      "factors": {...},
      "aiRelevanceIndex": 85
    }
  ]
}
```

### POST `/api/generate-proposal`
Generate a sponsorship proposal.

**Request:**
```json
{
  "eventId": "event-id-here",
  "brandId": "brand-id-here"
}
```

**Response:**
```json
{
  "proposalContent": {
    "subject": "Sponsorship Opportunity: Event Name",
    "body": "...",
    "pitchDeck": {
      "sections": [...]
    }
  }
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Matching Service is running"
}
```

## Authentication

All API endpoints (except `/health`) require authentication via Firebase ID token.

The client automatically includes the token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify all environment variables are set
- Check Firebase Admin SDK credentials

### Authentication errors
- Ensure Firebase ID token is being sent
- Verify token is valid and not expired
- Check Firebase Admin SDK is properly initialized

### AI features not working
- Verify OpenAI API key is set (optional)
- Without API key, server uses mock data
- Check OpenAI API quota/credits

### Firestore access errors
- Verify Firebase Admin SDK credentials
- Check Firestore security rules
- Ensure project ID is correct

## Free Hosting Options

1. **Render** - Free tier with 750 hours/month
2. **Railway** - Free tier with $5 credit/month
3. **Vercel** - Free tier for serverless functions
4. **Fly.io** - Free tier available
5. **Heroku** - No longer free, but has low-cost options

## Next Steps

1. Deploy server to free hosting
2. Update `REACT_APP_API_URL` in client
3. Test all API endpoints
4. Monitor server logs for errors

