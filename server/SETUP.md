# Server Setup Guide

## Firebase Admin SDK Credentials

The server needs Firebase Admin SDK credentials to access Firestore. You have several options:

### Option 1: Service Account Key File (Recommended for Local Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sponsperlink`)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Save it as `serviceAccountKey.json` in the `server` directory

**Important**: Add `serviceAccountKey.json` to `.gitignore` to avoid committing credentials!

### Option 2: Environment Variable

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account key file:

```bash
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"

# Windows CMD
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json

# Linux/Mac
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Option 3: Firebase Emulator (For Local Development)

If you're using the Firebase emulator, set the `FIRESTORE_EMULATOR_HOST` environment variable:

```bash
# Windows PowerShell
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"

# Windows CMD
set FIRESTORE_EMULATOR_HOST=localhost:8080

# Linux/Mac
export FIRESTORE_EMULATOR_HOST="localhost:8080"
```

### Option 4: Application Default Credentials (For Deployed Environments)

For deployed environments (like Google Cloud Run, App Engine, etc.), the server will automatically use Application Default Credentials.

## Running the Server

1. Install dependencies:
```bash
cd server
npm install
```

2. Make sure you have one of the credential methods set up (see above)

3. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000` by default.

## Environment Variables

You can set these environment variables:

- `PORT`: Server port (default: 5000)
- `FIREBASE_PROJECT_ID`: Firebase project ID (default: 'sponsperlink')
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account key file
- `FIRESTORE_EMULATOR_HOST`: Firebase emulator host (for local development)
- `OPENAI_API_KEY`: OpenAI API key for AI features (required)

## Troubleshooting

If you see "Could not load the default credentials" error:

1. Make sure you have a service account key file in the `server` directory, OR
2. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, OR
3. Use the Firebase emulator by setting `FIRESTORE_EMULATOR_HOST`

The server will provide helpful error messages if credentials are not found.

