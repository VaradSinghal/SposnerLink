# SponsorLink - AI-Powered Sponsorship Matchmaking Platform

An intelligent platform that connects event organizers with potential sponsors using AI-powered matching algorithms.

## Features

### For Event Organizers
- Create and manage events
- AI-powered sponsor matching
- Automated proposal generation
- Match relevance scoring
- Analytics dashboard

### For Brands/Sponsors
- Complete brand profile setup
- Discover relevant events automatically
- View and respond to proposals
- Match analytics and insights

### AI Features
- Semantic matching using embeddings
- Relevance scoring (0-100)
- Automated proposal generation
- Audience overlap analysis
- Category and location matching

## Tech Stack

### Backend
- Node.js with Express
- Firebase Firestore (database)
- Firebase Admin SDK (authentication & database)
- OpenAI API for AI features

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Firebase Authentication & Firestore
- Axios for API calls
- Recharts for analytics

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Firebase project (already configured)
- OpenAI API key (optional, for full AI features)
- Firebase Admin SDK credentials (for backend operations)

### Setup

1. **Clone the repository**
```bash
cd SponsorL
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Configure environment variables**

Create a `.env` file in the `server` directory:
```env
PORT=5000
OPENAI_API_KEY=your-openai-api-key-here
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}' # Required for backend operations
```

**Note:** The app uses Firebase Firestore for all database operations. See `FIREBASE_SETUP.md` for Firebase setup details.

4. **Start the development servers**

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

## Project Structure

```
SponsorL/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI, matching)
│   ├── middleware/      # Auth middleware
│   └── index.js         # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── package.json         # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (organizer)
- `PUT /api/events/:id` - Update event
- `GET /api/events/organizer/my-events` - Get organizer's events

### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/profile/me` - Get brand profile
- `PUT /api/brands/profile/me` - Update brand profile

### Matching
- `GET /api/matching/my-matches` - Get user's matches
- `POST /api/matching/event/:id/trigger` - Find matches for event
- `POST /api/matching/brand/trigger` - Find matches for brand

### Proposals
- `GET /api/proposals/my-proposals` - Get user's proposals
- `POST /api/proposals/generate/:matchId` - Generate AI proposal
- `POST /api/proposals/:id/send` - Send proposal

### Analytics
- `GET /api/analytics/organizer` - Organizer analytics
- `GET /api/analytics/brand` - Brand analytics
- `GET /api/analytics/matches` - Match analytics

## Usage

1. **Register/Login**: Create an account as either an organizer or brand
2. **Organizers**: Create events and find matching sponsors
3. **Brands**: Complete profile and discover relevant events
4. **Matching**: AI automatically finds and scores matches
5. **Proposals**: Generate and send sponsorship proposals
6. **Analytics**: Track performance and match quality

## AI Matching Algorithm

The matching algorithm considers:
- **Category Fit** (30 points): Event type vs brand preferences
- **Audience Overlap** (25 points): Age, interests, demographics
- **Location Fit** (20 points): Geographic preferences
- **Budget Fit** (15 points): Budget range compatibility
- **Semantic Similarity** (10 points): AI embedding similarity

Total relevance score: 0-100

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm start
```

## Deployment

### Backend
- Deploy to services like Render, Heroku, or AWS
- Set environment variables
- Ensure MongoDB connection

### Frontend
- Build: `cd client && npm run build`
- Deploy to Vercel, Netlify, or similar
- Set `REACT_APP_API_URL` environment variable

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

