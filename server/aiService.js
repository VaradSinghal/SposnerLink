// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OpenAI = require('openai');

// Initialize OpenAI with API key
let apiKey = process.env.OPENAI_API_KEY;

// If key is not found, try to reload from .env file
if (!apiKey) {
  const fs = require('fs');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const keyMatch = envContent.match(/OPENAI_API_KEY\s*=\s*(.+)/);
    if (keyMatch) {
      apiKey = keyMatch[1].trim().replace(/^["']|["']$/g, '');
      process.env.OPENAI_API_KEY = apiKey;
    }
  }
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;



// Generate embeddings for text with retry logic
async function generateEmbedding(text, retries = 2) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('Empty or invalid text provided for embedding');
      return Array(1536).fill(0).map(() => Math.random() * 0.1);
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not set, using fallback embedding');
      return generateFallbackEmbedding(text);
    }

    try {
      console.log('Calling OpenAI API for embedding...');
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.substring(0, 8000) // Limit to avoid token limits
      });

      if (!response.data || !response.data[0] || !response.data[0].embedding) {
        throw new Error('Invalid embedding response');
      }

      console.log('Successfully generated embedding from OpenAI');
      return response.data[0].embedding;
    } catch (apiError) {
      // Handle rate limit errors with retry
      if ((apiError.status === 429 || apiError.message?.includes('quota') || apiError.message?.includes('rate limit')) && retries > 0) {
        const waitTime = Math.pow(2, 3 - retries) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit hit, retrying in ${waitTime}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateEmbedding(text, retries - 1);
      }
      throw apiError;
    }
  } catch (error) {
    // Check if it's a quota/rate limit error
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      console.warn('OpenAI quota/rate limit exceeded after retries, using enhanced fallback embedding');
    } else {
      console.error('Error generating embedding:', error.message);
    }
    
    // Enhanced fallback embedding based on text content
    return generateFallbackEmbedding(text || '');
  }
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate AI summary and keywords with retry logic
async function generateSummary(text, retries = 2) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        summary: 'No description provided.',
        keywords: []
      };
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not set, using fallback summary');
      // Better fallback: extract meaningful keywords and create a simple summary
      const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const commonWords = ['the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'their', 'what', 'when', 'where', 'which', 'about', 'after', 'before', 'during', 'under', 'above', 'between'];
      const keywords = [...new Set(words.filter(w => !commonWords.includes(w)))].slice(0, 10);
      const summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
      
      return { summary, keywords };
    }

    try {
      console.log('Calling OpenAI API for summary...');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes text and extracts keywords. Always provide a concise summary and a list of relevant keywords.'
          },
          {
            role: 'user',
            content: `Summarize this text in 2-3 sentences and extract 5-10 key keywords:\n\n${text.substring(0, 4000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid summary response');
      }

      const summary = response.choices[0].message.content;
      const keywords = extractKeywords(summary + ' ' + text);
      
      console.log('Successfully generated summary from OpenAI');
      return { summary, keywords };
    } catch (apiError) {
      // Handle rate limit errors with retry
      if ((apiError.status === 429 || apiError.message?.includes('quota') || apiError.message?.includes('rate limit')) && retries > 0) {
        const waitTime = Math.pow(2, 3 - retries) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit hit, retrying in ${waitTime}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateSummary(text, retries - 1);
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating summary:', error.message);
    // Better fallback
    const words = (text || '').toLowerCase().match(/\b\w{4,}\b/g) || [];
    const commonWords = ['the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'their'];
    const keywords = [...new Set(words.filter(w => !commonWords.includes(w)))].slice(0, 10);
    const summary = text && text.length > 200 ? text.substring(0, 200) + '...' : (text || 'No description provided.');
    
    return { summary, keywords };
  }
}

function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
  const filtered = words.filter(w => !commonWords.includes(w) && w.length > 3);
  return [...new Set(filtered)].slice(0, 10);
}

// Generate enhanced fallback embedding based on text content
function generateFallbackEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return Array(1536).fill(0).map(() => Math.random() * 0.1);
  }

  // Extract meaningful features from text
  const normalizedText = text.toLowerCase();
  const words = normalizedText.match(/\b\w{4,}\b/g) || [];
  const commonWords = ['the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'their', 'what', 'when', 'where', 'which', 'about', 'after', 'before', 'during', 'under', 'above', 'between'];
  const keywords = [...new Set(words.filter(w => !commonWords.includes(w)))];
  
  // Create hash-based embedding with better distribution
  const textHash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // Generate embedding based on multiple features
  const embedding = Array(1536).fill(0);
  const numKeywords = Math.min(keywords.length, 50);
  
  // Use keyword positions to seed embedding
  keywords.slice(0, 50).forEach((keyword, idx) => {
    const keywordHash = keyword.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    const position = (keywordHash % 1536 + idx * 30) % 1536;
    embedding[position] = (keywordHash % 1000) / 1000 * 0.3;
  });
  
  // Add text hash influence
  for (let i = 0; i < 1536; i++) {
    const seed = ((textHash + i) % 1000) / 1000;
    embedding[i] = (embedding[i] + seed * 0.2) / 1.2; // Normalize
  }
  
  // Normalize the embedding vector
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    return embedding.map(val => val / norm * 0.5); // Scale to reasonable range
  }
  
  return embedding;
}

// Generate proposal content
async function generateProposal(event, brand) {
  try {
    const prompt = `Create a professional sponsorship proposal for ${brand.companyName} to sponsor ${event.name}.

Event Details:
- Name: ${event.name}
- Type: ${event.type}
- Description: ${event.description}
- Location: ${event.location?.city || 'TBD'}, ${event.location?.country || 'TBD'}
- Expected Attendees: ${event.expectedAttendees}
- Target Audience: ${JSON.stringify(event.targetAudience)}

Brand Details:
- Company: ${brand.companyName}
- Product/Service: ${brand.productServiceType}
- Description: ${brand.description}
- Marketing Goals: ${brand.marketingGoals?.join(', ') || 'N/A'}

Create a compelling proposal with:
1. Subject line for email
2. Introduction paragraph
3. Why this event is a perfect fit
4. Benefits for the brand
5. Sponsorship package details
6. Call to action

Format as JSON with: { subject, body, pitchDeck: { sections: [{ title, content }] } }`;

    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not set, using mock proposal');
      return generateMockProposal(event, brand);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional sponsorship proposal writer. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return generateMockProposal(event, brand);
  } catch (error) {
    console.error('Error generating proposal:', error);
    return generateMockProposal(event, brand);
  }
}

function generateMockProposal(event, brand) {
  return {
    subject: `Sponsorship Opportunity: ${event.name}`,
    body: `Dear ${brand.companyName} Team,

We are excited to present a unique sponsorship opportunity for ${event.name}, a ${event.type} event that aligns perfectly with your brand values and target audience.

Event Overview:
${event.name} is a ${event.scale || 'medium'}-scale event taking place in ${event.location?.city || 'TBD'}, ${event.location?.country || 'TBD'}. We expect ${event.expectedAttendees || 0} attendees who match your target demographic.

Why This Is A Perfect Fit:
- Audience alignment with your marketing goals
- Strong brand visibility opportunities
- Engagement with your target market
- Measurable ROI potential

We would love to discuss how ${brand.companyName} can be part of this exciting event. Please let us know if you're interested in learning more.

Best regards,
The ${event.name} Team`,
    pitchDeck: {
      sections: [
        {
          title: 'Event Overview',
          content: `${event.name} is a ${event.type} event that will bring together ${event.expectedAttendees || 0} attendees.`
        },
        {
          title: 'Why Sponsor?',
          content: 'This event offers exceptional brand visibility and engagement opportunities.'
        },
        {
          title: 'Sponsorship Packages',
          content: 'We offer flexible sponsorship packages tailored to your marketing goals and budget.'
        }
      ]
    }
  };
}

// Generate chat response for AI assistant with conversation history
async function generateChatResponse(message, userType, userContext, conversationHistory = [], retries = 3) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced system prompt for more human-like conversation
    let systemPrompt = `You are a friendly and knowledgeable AI assistant for SponsorLink, a sponsorship matchmaking platform. 
You help ${userType === 'organizer' ? 'event organizers find sponsors for their events' : 'brands find events to sponsor'}.

Your personality:
- Be conversational, warm, and approachable like a helpful colleague
- Use natural language, not robotic responses
- Show enthusiasm about helping users succeed
- Ask follow-up questions when appropriate
- Provide specific, actionable advice
- Be concise but thorough

You can help with:
- Finding matching events or brands using AI-powered matching
- Understanding how the matching algorithm works (semantic similarity, audience overlap, etc.)
- Creating and optimizing profiles/events for better matches
- Understanding sponsorship opportunities and best practices
- Platform navigation and features
- General questions about sponsorship, events, and marketing
- Troubleshooting and support

FAQ Topics you should know:
- How matching works: Uses AI embeddings, semantic similarity, audience overlap, category fit, location, budget, and marketing goals
- Creating events/profiles: Detailed steps with emphasis on completeness for better matches
- Finding sponsors/events: Process of using AI matching and viewing results
- Proposals: AI-generated sponsorship pitches, how to send/receive/respond
- Profile optimization: Tips for better matching scores
- Platform features: Matches, Proposals, Events, Dashboard, Feed pages

Remember: You're having a conversation, not just answering questions. Be natural and engaging!`;

    // Add user context if available
    if (userContext && Object.keys(userContext).length > 0) {
      if (userType === 'organizer') {
        systemPrompt += `\n\nThe user is an organizer. Their profile: ${JSON.stringify(userContext).substring(0, 300)}`;
      } else if (userType === 'brand') {
        systemPrompt += `\n\nThe user is a brand. Company: ${userContext.companyName || 'N/A'}, Type: ${userContext.productServiceType || 'N/A'}, Description: ${(userContext.description || '').substring(0, 200)}`;
      }
    }

    // Check if OpenAI is available - if not, use fallback
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not set, using fallback response');
      return getFallbackChatResponse(lowerMessage, userType, conversationHistory);
    }

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role || 'user',
        content: msg.content || msg.message
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Try to use OpenAI API first
    try {
      console.log('Calling OpenAI API for chat response with conversation history...');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.8, // Slightly higher for more natural conversation
        max_tokens: 600, // Increased for more detailed responses
        presence_penalty: 0.6, // Encourage variety in responses
        frequency_penalty: 0.3
      });

      if (!response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid chat response');
      }

      const chatResponse = response.choices[0].message.content;
      console.log('Successfully generated chat response from OpenAI');
      return chatResponse;
    } catch (apiError) {
      // Handle rate limit errors with retry
      if ((apiError.status === 429 || apiError.message?.includes('quota') || apiError.message?.includes('rate limit')) && retries > 0) {
        const waitTime = Math.pow(2, 3 - retries) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit hit, retrying in ${waitTime}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return generateChatResponse(message, userType, userContext, conversationHistory, retries - 1);
      }
      // If API fails, use fallback
      console.warn('OpenAI API failed, using fallback response:', apiError.message);
      return getFallbackChatResponse(lowerMessage, userType, conversationHistory);
    }
  } catch (error) {
    console.error('Error generating chat response:', error);
    // Return fallback response
    return getFallbackChatResponse(message.toLowerCase(), userType, conversationHistory);
  }
}

// Get fallback chat response when OpenAI is not available
function getFallbackChatResponse(lowerMessage, userType, conversationHistory = []) {
  // Handle specific questions
  if (lowerMessage.includes('how does matching work') || lowerMessage.includes('how does the matching system work')) {
    return `Our AI-powered matching system uses multiple factors to find the best matches:

1. **Semantic Similarity** (25 points): Uses AI embeddings to understand the meaning and context of your event/brand description
2. **Category Fit** (20 points): Matches event types with brand preferences
3. **Audience Overlap** (20 points): Compares target audience demographics, age ranges, and interests
4. **Location Fit** (15 points): Matches event locations with brand location preferences
5. **Budget Fit** (10 points): Aligns sponsorship budgets
6. **Marketing Goals Fit** (5 points): Matches marketing objectives
7. **Event Scale Fit** (5 points): Considers event size preferences

The system calculates a relevance score (0-100) and shows matches with scores above 30. Higher scores indicate better matches!`;
  }
  
  if (lowerMessage.includes('how do i create') || lowerMessage.includes('create event') || lowerMessage.includes('create profile')) {
    return userType === 'organizer' 
      ? `To create an event:
1. Go to the "Events" page and click "Create Event"
2. Fill in the event details (name, description, type, location, dates)
3. Add target audience information
4. Specify sponsorship needs and budget range
5. Click "Create Event" to save

The more details you provide, the better matches you'll get!`
      : `To create your brand profile:
1. Go to your Profile page
2. Fill in your company details (name, description, product/service type)
3. Add your target audience information
4. Specify your marketing goals and budget range
5. Set your location preferences
6. Click "Save Profile"

A complete profile helps us find better matches for you!`;
  }
  
  if (lowerMessage.includes('find sponsors') || lowerMessage.includes('find matches')) {
    return userType === 'organizer'
      ? `To find sponsors for your events:
1. Create an event with complete details
2. Go to the event detail page and click "Find Sponsors"
3. The AI will analyze your event and match it with relevant brands
4. View matches on the "Matches" page
5. Generate and send proposals to interested brands

Make sure your event is set to "active" status!`
      : `To find events to sponsor:
1. Complete your brand profile
2. Go to the "Events" page to see available events
3. Click "Find Matches" to let AI match you with relevant events
4. View matches on the "Matches" page
5. Send proposals to events you're interested in

The AI analyzes your profile and finds events that align with your goals!`;
  }
  
  if (lowerMessage.includes('proposal') || lowerMessage.includes('send proposal')) {
    return `Proposals are AI-generated sponsorship pitches that help you communicate with potential partners:

**For Organizers:**
- Generate proposals from the Matches page
- Review and customize the proposal
- Send to brands you're interested in
- Track proposal status (sent, viewed, responded)

**For Brands:**
- Receive proposals from event organizers
- Send proposals to events you're interested in
- Review and respond to proposals
- Accept or decline sponsorship opportunities

Proposals are automatically generated using AI to highlight the best match factors!`;
  }
  
  if (lowerMessage.includes('relevance score') || lowerMessage.includes('score') || lowerMessage.includes('match score')) {
    return `The relevance score (0-100) shows how well an event and brand match each other. It's calculated using:

• **Semantic Similarity** (25 points): How well descriptions align using AI
• **Category Fit** (20 points): Event type matches brand preferences
• **Audience Overlap** (20 points): Target audiences align
• **Location Fit** (15 points): Geographic preferences match
• **Budget Fit** (10 points): Budget ranges align
• **Marketing Goals** (5 points): Objectives match
• **Event Scale** (5 points): Event size preferences match

Scores above 30 are shown as matches. Higher scores = better alignment!`;
  }
  
  if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('better match')) {
    return `To improve your matching scores:

**For Organizers:**
• Write detailed event descriptions with keywords
• Specify your target audience clearly (age, interests, demographics)
• Set realistic budget ranges
• Choose appropriate event categories
• Add location details
• Include marketing goals and objectives

**For Brands:**
• Complete all profile sections thoroughly
• Describe your company and products/services in detail
• Specify your target audience clearly
• Set your preferred event categories
• Define your marketing goals
• Set location preferences

The more detailed your profile, the better the AI can match you!`;
  }
  
  if (lowerMessage.includes('edit') || lowerMessage.includes('update') || lowerMessage.includes('change')) {
    return `Yes! You can edit your ${userType === 'organizer' ? 'events' : 'profile'} at any time:

**For Organizers:**
• Go to the Events page
• Click on an event to view details
• Click "Edit" to modify event information
• Updates will improve future matches

**For Brands:**
• Go to your Profile page
• Click "Edit Profile"
• Update any information
• Changes will be reflected in new matches

Remember: Editing your ${userType === 'organizer' ? 'event' : 'profile'} may change your match scores, so you might want to run "Find Matches" again after making changes!`;
  }
  
  if (lowerMessage.includes('faq') || lowerMessage.includes('frequently asked') || lowerMessage.includes('common questions')) {
    return `Here are some frequently asked questions:

**Matching:**
• How does matching work? - Uses AI to analyze multiple factors
• What is a relevance score? - A 0-100 score showing match quality
• How do I improve my matches? - Complete your profile with detailed information

**Creating Content:**
• How do I create an event? - Go to Events page → Create Event
• How do I create a profile? - Go to Profile page and fill in details
• Can I edit after creating? - Yes, you can edit anytime

**Proposals:**
• How do I send a proposal? - From Matches page or Event detail page
• What are proposals? - AI-generated sponsorship pitches
• How do I respond to proposals? - From the Proposals page

**Platform:**
• What pages are available? - Dashboard, Events, Matches, Proposals, Feed
• How do I navigate? - Use the navigation bar at the top

Feel free to ask me about any of these topics in more detail!`;
  }
  
  // Default helpful response - more conversational
  return `I'm here to help you with ${userType === 'organizer' ? 'event sponsorship' : 'finding sponsorship opportunities'}!

I can help you with:
• Understanding how the matching system works
• Creating and optimizing your ${userType === 'organizer' ? 'events' : 'profile'}
• Finding ${userType === 'organizer' ? 'sponsors' : 'events to sponsor'}
• Sending and managing proposals
• Platform navigation and features
• General questions about sponsorship

What would you like to know? Feel free to ask me anything!`;
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  generateSummary,
  generateProposal,
  generateChatResponse,
  generateFallbackEmbedding
};

