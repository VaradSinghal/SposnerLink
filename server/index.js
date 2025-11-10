// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { generateEmbedding, cosineSimilarity, generateSummary, generateProposal } = require('./aiService');

const app = express();
app.use(cors());
app.use(express.json());

// Log API key status (without exposing the key)
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log(`✅ Found .env file at: ${envPath}`);
} else {
  console.warn(`⚠️  .env file not found at: ${envPath}`);
  console.warn('   Creating .env file template...');
}

if (process.env.OPENAI_API_KEY) {
  console.log('✅ OpenAI API key is configured');
  console.log(`   Key length: ${process.env.OPENAI_API_KEY.length} characters`);
} else {
  console.warn('⚠️  OpenAI API key not found. AI features will use fallback methods.');
  console.warn('   To enable full AI features, set OPENAI_API_KEY in your .env file:');
  console.warn(`   Location: ${envPath}`);
  console.warn('   Format: OPENAI_API_KEY=sk-...');
  
  // Try to reload from .env if it exists
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const keyMatch = envContent.match(/OPENAI_API_KEY\s*=\s*(.+)/);
    if (keyMatch) {
      const keyValue = keyMatch[1].trim().replace(/^["']|["']$/g, '');
      if (keyValue && keyValue !== '') {
        process.env.OPENAI_API_KEY = keyValue;
        console.log('✅ OpenAI API key loaded from .env file');
      }
    }
  }
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let initialized = false;
    
    // Method 1: Try service account key file from environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          initialized = true;
          console.log('Firebase Admin initialized with service account key');
        }
      } catch (err) {
        console.warn('Could not load service account from GOOGLE_APPLICATION_CREDENTIALS:', err.message);
      }
    }
    
    // Method 2: Try service account key file in server directory
    if (!initialized) {
      try {
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require(serviceAccountPath);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          initialized = true;
          console.log('Firebase Admin initialized with local service account key');
        }
      } catch (err) {
        console.warn('Could not load local service account key:', err.message);
      }
    }
    
    // Method 3: Try using Firebase emulator (for local development)
    if (!initialized && process.env.FIRESTORE_EMULATOR_HOST) {
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'sponsperlink'
        });
        initialized = true;
        console.log('Firebase Admin initialized with emulator');
      } catch (err) {
        console.warn('Could not initialize with emulator:', err.message);
      }
    }
    
    // Method 4: Try application default credentials (for deployed environments)
    if (!initialized) {
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'sponsperlink'
        });
        initialized = true;
        console.log('Firebase Admin initialized with application default credentials');
      } catch (err) {
        console.error('Could not initialize Firebase Admin:', err.message);
        throw err;
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.error('\nTo fix this error, you need to:');
    console.error('1. Download a service account key from Firebase Console');
    console.error('2. Save it as "serviceAccountKey.json" in the server directory, OR');
    console.error('3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of the key file, OR');
    console.error('4. Use Firebase emulator by setting FIRESTORE_EMULATOR_HOST environment variable');
    throw error;
  }
}

// Initialize Firestore - this will fail if credentials are not available
let db;
try {
  db = admin.firestore();
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firestore:', error.message);
  console.error('\n⚠️  WARNING: Server will not be able to access Firestore without credentials.');
  console.error('Please set up credentials using one of the methods in server/SETUP.md');
  // Don't throw - let the server start but endpoints will fail gracefully
}

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Calculate relevance score with improved AI-powered algorithm
function calculateRelevanceScore(event, brand) {
  let score = 0;
  const factors = {
    audienceOverlap: 0,
    categoryFit: 0,
    locationFit: 0,
    budgetFit: 0,
    semanticSimilarity: 0,
    marketingGoalsFit: 0,
    eventScaleFit: 0
  };

  // Semantic Similarity (25 points) - Most important for AI matching
  let semanticScore = 0;
  if (event.aiProfile?.embeddings && brand.aiProfile?.embeddings) {
    const similarity = cosineSimilarity(event.aiProfile.embeddings, brand.aiProfile.embeddings);
    // Normalize similarity (0-1) to 0-25 points
    semanticScore = Math.max(0, Math.min(25, similarity * 25));
    factors.semanticSimilarity = Math.round(semanticScore);
    score += semanticScore;
  } else {
    // Fallback to keyword matching
    const keywordScore = calculateKeywordOverlap(event.aiProfile?.keywords || [], brand.aiProfile?.keywords || []);
    semanticScore = keywordScore * 25;
    factors.semanticSimilarity = Math.round(semanticScore);
    score += semanticScore;
  }

  // Category Fit (20 points)
  if (brand.preferredEventCategories && brand.preferredEventCategories.length > 0) {
    if (brand.preferredEventCategories.includes(event.type)) {
      factors.categoryFit = 20;
      score += 20;
    } else {
      // Partial match for related categories
      factors.categoryFit = 5;
      score += 5;
    }
  } else {
    // No preferences set - neutral score
    factors.categoryFit = 10;
    score += 10;
  }

  // Audience Overlap (20 points)
  const audienceScore = calculateAudienceOverlap(event.targetAudience, brand.targetAudience);
  factors.audienceOverlap = audienceScore;
  score += audienceScore;

  // Location Fit (15 points)
  const locationScore = calculateLocationFit(event.location, brand.preferences?.location);
  factors.locationFit = locationScore;
  score += locationScore;

  // Budget Fit (10 points)
  const budgetScore = calculateBudgetFit(event.sponsorshipNeeds?.budgetRange, brand.budgetRange);
  factors.budgetFit = budgetScore;
  score += budgetScore;

  // Marketing Goals Fit (5 points)
  if (event.sponsorshipNeeds?.marketingGoals && brand.marketingGoals && brand.marketingGoals.length > 0) {
    const eventGoals = new Set((event.sponsorshipNeeds.marketingGoals || []).map(g => g.toLowerCase()));
    const brandGoals = new Set(brand.marketingGoals.map(g => g.toLowerCase()));
    const commonGoals = [...eventGoals].filter(g => brandGoals.has(g));
    if (commonGoals.length > 0) {
      const goalScore = (commonGoals.length / Math.max(eventGoals.size, brandGoals.size)) * 5;
      factors.marketingGoalsFit = Math.round(goalScore);
      score += goalScore;
    }
  }

  // Event Scale Fit (5 points)
  if (brand.preferences?.eventScale && brand.preferences.eventScale.length > 0) {
    if (brand.preferences.eventScale.includes(event.scale)) {
      factors.eventScaleFit = 5;
      score += 5;
    }
  } else {
    factors.eventScaleFit = 2.5;
    score += 2.5;
  }

  // Bonus for high-quality profiles (both have complete data)
  let completenessBonus = 0;
  const eventCompleteness = calculateProfileCompleteness(event);
  const brandCompleteness = calculateProfileCompleteness(brand);
  if (eventCompleteness > 0.8 && brandCompleteness > 0.8) {
    completenessBonus = 5; // Bonus for complete profiles
  }

  const finalScore = Math.min(100, Math.round(score + completenessBonus));

  return {
    score: finalScore,
    factors,
    completeness: {
      event: eventCompleteness,
      brand: brandCompleteness
    }
  };
}

// Calculate profile completeness (0-1)
function calculateProfileCompleteness(profile) {
  let fields = 0;
  let filled = 0;

  // Check required fields
  if (profile.name || profile.companyName) {
    fields++;
    if (profile.name || profile.companyName) filled++;
  }
  if (profile.description) {
    fields++;
    if (profile.description && profile.description.length > 50) filled++;
  }
  if (profile.type || profile.productServiceType) {
    fields++;
    if (profile.type || profile.productServiceType) filled++;
  }
  if (profile.targetAudience) {
    fields++;
    if (profile.targetAudience.ageRange) filled++;
  }
  if (profile.location || profile.preferences?.location) {
    fields++;
    if (profile.location?.city || profile.preferences?.location?.cities?.length > 0) filled++;
  }

  return fields > 0 ? filled / fields : 0;
}

function calculateAudienceOverlap(eventAudience, brandAudience) {
  let score = 0;
  const maxScore = 20;

  // Age Range Overlap (10 points)
  if (eventAudience?.ageRange && brandAudience?.ageRange) {
    const eventMin = eventAudience.ageRange.min || 18;
    const eventMax = eventAudience.ageRange.max || 65;
    const brandMin = brandAudience.ageRange.min || 18;
    const brandMax = brandAudience.ageRange.max || 65;

    const overlap = Math.max(0, Math.min(eventMax, brandMax) - Math.max(eventMin, brandMin));
    const eventRange = eventMax - eventMin;
    const brandRange = brandMax - brandMin;
    const totalRange = Math.max(eventMax, brandMax) - Math.min(eventMin, brandMin);
    
    if (totalRange > 0 && eventRange > 0 && brandRange > 0) {
      // Calculate overlap percentage
      const overlapPercentage = overlap / totalRange;
      score += overlapPercentage * 10;
    }
  }

  // Interests Overlap (10 points)
  if (eventAudience?.interests && brandAudience?.interests) {
    const eventInterests = new Set((eventAudience.interests || []).map(i => i.toLowerCase().trim()));
    const brandInterests = new Set((brandAudience.interests || []).map(i => i.toLowerCase().trim()));
    
    if (eventInterests.size > 0 && brandInterests.size > 0) {
      const common = [...eventInterests].filter(i => brandInterests.has(i));
      const total = new Set([...eventInterests, ...brandInterests]).size;
      if (total > 0) {
        // Jaccard similarity
        const jaccard = common.length / total;
        score += jaccard * 10;
      }
    }
  }

  return Math.min(maxScore, Math.round(score * 10) / 10);
}

function calculateLocationFit(eventLocation, brandLocationPrefs) {
  if (!brandLocationPrefs || (!brandLocationPrefs.cities?.length && !brandLocationPrefs.countries?.length)) {
    return 10;
  }

  if (brandLocationPrefs.cities?.length) {
    const eventCity = eventLocation?.city?.toLowerCase();
    if (eventCity && brandLocationPrefs.cities.some(c => c.toLowerCase() === eventCity)) {
      return 20;
    }
  }

  if (brandLocationPrefs.countries?.length) {
    const eventCountry = eventLocation?.country?.toLowerCase();
    if (eventCountry && brandLocationPrefs.countries.some(c => c.toLowerCase() === eventCountry)) {
      return 15;
    }
  }

  return 5;
}

function calculateBudgetFit(eventBudget, brandBudget) {
  if (!eventBudget || !brandBudget) {
    return 7;
  }

  const eventMin = eventBudget.min || 0;
  const eventMax = eventBudget.max || Infinity;
  const brandMin = brandBudget.min || 0;
  const brandMax = brandBudget.max || Infinity;

  if (brandMax >= eventMin && brandMin <= eventMax) {
    const overlap = Math.min(brandMax, eventMax) - Math.max(brandMin, eventMin);
    const totalRange = Math.max(brandMax, eventMax) - Math.min(brandMin, eventMin);
    if (totalRange > 0) {
      return Math.round((overlap / totalRange) * 15);
    }
  }

  return 0;
}

function calculateKeywordOverlap(eventKeywords, brandKeywords) {
  if (!eventKeywords.length || !brandKeywords.length) {
    return 0.5;
  }

  const eventSet = new Set(eventKeywords.map(k => k.toLowerCase()));
  const brandSet = new Set(brandKeywords.map(k => k.toLowerCase()));
  const common = [...eventSet].filter(k => brandSet.has(k));
  const total = new Set([...eventSet, ...brandSet]).size;

  return total > 0 ? common.length / total : 0;
}

// Find matches for event
app.post('/api/find-matches-for-event', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ 
        error: 'Firestore not initialized. Please set up Firebase Admin credentials. See server/SETUP.md for instructions.' 
      });
    }

    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };

    // Ensure event has AI profile
    if (!event.aiProfile?.embeddings) {
      try {
        const eventText = `${event.name || ''} ${event.description || ''} ${event.type || ''} ${event.theme || ''}`.trim();
        if (!eventText) {
          throw new Error('Event has no text content for AI processing');
        }
        
        const embedding = await generateEmbedding(eventText);
        const { summary, keywords } = await generateSummary(eventText);
        
        await db.collection('events').doc(eventId).update({
          aiProfile: {
            embeddings: embedding,
            keywords: keywords || [],
            summary: summary || event.description || 'No summary available'
          }
        });
        event.aiProfile = { embeddings: embedding, keywords, summary };
      } catch (error) {
        console.error('Error creating AI profile for event:', error);
        // Create a basic fallback profile
        const fallbackEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
        event.aiProfile = {
          embeddings: fallbackEmbedding,
          keywords: [event.type, event.name].filter(Boolean).slice(0, 5),
          summary: event.description || 'No summary available'
        };
      }
    }

    // Find all active brands
    const brandsSnapshot = await db.collection('brands').where('status', '==', 'active').get();
    const matches = [];

    for (const brandDoc of brandsSnapshot.docs) {
      let brand = { id: brandDoc.id, ...brandDoc.data() };

      // Ensure brand has AI profile
      if (!brand.aiProfile?.embeddings) {
        try {
          const brandText = `${brand.companyName || ''} ${brand.description || ''} ${brand.productServiceType || ''} ${(brand.marketingGoals || []).join(' ')}`.trim();
          if (!brandText) {
            throw new Error('Brand has no text content for AI processing');
          }
          
          const embedding = await generateEmbedding(brandText);
          const { summary, keywords } = await generateSummary(brandText);
          
          await db.collection('brands').doc(brand.id).update({
            aiProfile: {
              embeddings: embedding,
              keywords: keywords || [],
              summary: summary || brand.description || 'No summary available'
            }
          });
          brand.aiProfile = { embeddings: embedding, keywords, summary };
        } catch (error) {
          console.error('Error creating AI profile for brand:', error);
          // Create a basic fallback profile
          const fallbackEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
          brand.aiProfile = {
            embeddings: fallbackEmbedding,
            keywords: [brand.productServiceType, brand.companyName].filter(Boolean).slice(0, 5),
            summary: brand.description || 'No summary available'
          };
        }
      }

      // Calculate relevance
      const { score, factors } = calculateRelevanceScore(event, brand);

      if (score >= 30) {
        matches.push({
          brandId: brand.id,
          brand,
          score,
          factors,
          aiRelevanceIndex: score
        });

        // Save match to Firestore
        const matchQuery = await db.collection('matches')
          .where('eventId', '==', eventId)
          .where('brandId', '==', brand.id)
          .limit(1)
          .get();

        const matchData = {
          eventId,
          brandId: brand.id,
          relevanceScore: score,
          aiRelevanceIndex: score,
          matchFactors: factors,
          status: 'pending',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (matchQuery.empty) {
          matchData.createdAt = admin.firestore.FieldValue.serverTimestamp();
          await db.collection('matches').add(matchData);
        } else {
          await matchQuery.docs[0].ref.update(matchData);
        }
      }
    }

    matches.sort((a, b) => b.score - a.score);
    
    console.log(`Found ${matches.length} matches for event ${eventId}`);
    res.json({ 
      matches: matches.slice(0, 20),
      total: matches.length,
      message: `Found ${matches.length} potential brand matches for your event!`
    });
  } catch (error) {
    console.error('Error finding matches for event:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to find matches',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Find matches for brand
app.post('/api/find-matches-for-brand', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ 
        error: 'Firestore not initialized. Please set up Firebase Admin credentials. See server/SETUP.md for instructions.' 
      });
    }

    const { brandId } = req.body;
    
    if (!brandId) {
      return res.status(400).json({ error: 'Brand ID is required' });
    }

    const brandDoc = await db.collection('brands').doc(brandId).get();
    
    if (!brandDoc.exists) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brand = { id: brandDoc.id, ...brandDoc.data() };

    // Ensure brand has AI profile
    if (!brand.aiProfile?.embeddings) {
      try {
        const brandText = `${brand.companyName || ''} ${brand.description || ''} ${brand.productServiceType || ''} ${(brand.marketingGoals || []).join(' ')}`.trim();
        if (!brandText) {
          throw new Error('Brand has no text content for AI processing');
        }
        
        const embedding = await generateEmbedding(brandText);
        const { summary, keywords } = await generateSummary(brandText);
        
        await db.collection('brands').doc(brandId).update({
          aiProfile: {
            embeddings: embedding,
            keywords: keywords || [],
            summary: summary || brand.description || 'No summary available'
          }
        });
        brand.aiProfile = { embeddings: embedding, keywords, summary };
      } catch (error) {
        console.error('Error creating AI profile for brand:', error);
        // Create a basic fallback profile
        const fallbackEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
        brand.aiProfile = {
          embeddings: fallbackEmbedding,
          keywords: [brand.productServiceType, brand.companyName].filter(Boolean).slice(0, 5),
          summary: brand.description || 'No summary available'
        };
      }
    }

    // Find all active events
    const eventsSnapshot = await db.collection('events').where('status', '==', 'active').get();
    const matches = [];

    for (const eventDoc of eventsSnapshot.docs) {
      let event = { id: eventDoc.id, ...eventDoc.data() };

      // Ensure event has AI profile
      if (!event.aiProfile?.embeddings) {
        try {
          const eventText = `${event.name || ''} ${event.description || ''} ${event.type || ''} ${event.theme || ''}`.trim();
          if (!eventText) {
            throw new Error('Event has no text content for AI processing');
          }
          
          const embedding = await generateEmbedding(eventText);
          const { summary, keywords } = await generateSummary(eventText);
          
          await db.collection('events').doc(event.id).update({
            aiProfile: {
              embeddings: embedding,
              keywords: keywords || [],
              summary: summary || event.description || 'No summary available'
            }
          });
          event.aiProfile = { embeddings: embedding, keywords, summary };
        } catch (error) {
          console.error('Error creating AI profile for event:', error);
          // Create a basic fallback profile
          const fallbackEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
          event.aiProfile = {
            embeddings: fallbackEmbedding,
            keywords: [event.type, event.name].filter(Boolean).slice(0, 5),
            summary: event.description || 'No summary available'
          };
        }
      }

      // Calculate relevance
      const { score, factors } = calculateRelevanceScore(event, brand);

      if (score >= 30) {
        matches.push({
          eventId: event.id,
          event,
          score,
          factors,
          aiRelevanceIndex: score
        });

        // Save match to Firestore
        const matchQuery = await db.collection('matches')
          .where('eventId', '==', event.id)
          .where('brandId', '==', brandId)
          .limit(1)
          .get();

        const matchData = {
          eventId: event.id,
          brandId: brandId,
          relevanceScore: score,
          aiRelevanceIndex: score,
          matchFactors: factors,
          status: 'pending',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (matchQuery.empty) {
          matchData.createdAt = admin.firestore.FieldValue.serverTimestamp();
          await db.collection('matches').add(matchData);
        } else {
          await matchQuery.docs[0].ref.update(matchData);
        }
      }
    }

    matches.sort((a, b) => b.score - a.score);
    
    console.log(`Found ${matches.length} matches for brand ${brandId}`);
    res.json({ 
      matches: matches.slice(0, 20),
      total: matches.length,
      message: `Found ${matches.length} potential event matches for your brand!`
    });
  } catch (error) {
    console.error('Error finding matches for brand:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to find matches',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Generate proposal
app.post('/api/generate-proposal', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ 
        error: 'Firestore not initialized. Please set up Firebase Admin credentials. See server/SETUP.md for instructions.' 
      });
    }

    const { eventId, brandId } = req.body;

    if (!eventId || !brandId) {
      return res.status(400).json({ error: 'Event ID and Brand ID are required' });
    }

    const [eventDoc, brandDoc] = await Promise.all([
      db.collection('events').doc(eventId).get(),
      db.collection('brands').doc(brandId).get()
    ]);

    if (!eventDoc.exists || !brandDoc.exists) {
      return res.status(404).json({ error: 'Event or brand not found' });
    }

    const event = { id: eventDoc.id, ...eventDoc.data() };
    const brand = { id: brandDoc.id, ...brandDoc.data() };

    const proposalContent = await generateProposal(event, brand);

    res.json({ proposalContent });
  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat with AI assistant
app.post('/api/chat', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ 
        error: 'Firestore not initialized. Please set up Firebase Admin credentials.' 
      });
    }

    const { message, userType, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Import AI service for chat
    const { generateChatResponse } = require('./aiService');
    
    // Get user context if available
    let userContext = {};
    if (userId && db) {
      try {
        if (userType === 'organizer') {
          // Try to get user from users collection
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            userContext = userDoc.data();
          } else {
            // Try to find by firebaseUid
            const userQuery = await db.collection('users').where('firebaseUid', '==', req.user.uid).limit(1).get();
            if (!userQuery.empty) {
              userContext = userQuery.docs[0].data();
            }
          }
        } else if (userType === 'brand') {
          // Try to find brand by userId (which might be firebaseUid)
          let brandQuery = await db.collection('brands').where('userId', '==', userId).limit(1).get();
          if (brandQuery.empty) {
            // Try with firebaseUid
            brandQuery = await db.collection('brands').where('userId', '==', req.user.uid).limit(1).get();
          }
          if (!brandQuery.empty) {
            userContext = brandQuery.docs[0].data();
          }
        }
      } catch (err) {
        console.warn('Could not fetch user context:', err.message);
        // Continue without context
      }
    }

    try {
      const response = await generateChatResponse(message, userType || 'organizer', userContext);
      res.json({ message: response });
    } catch (chatError) {
      console.error('Error generating chat response:', chatError);
      res.json({ 
        message: 'I apologize, but I encountered an error processing your message. Please try rephrasing your question or contact support if the issue persists.' 
      });
    }
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Matching Service is running',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    firestoreConfigured: !!db
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AI Matching Server running on port ${PORT}`);
});

