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



// Generate embeddings for text
async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.warn('Empty or invalid text provided for embedding');
      return Array(1536).fill(0).map(() => Math.random() * 0.1);
    }

    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not set, using fallback embedding');
      // Generate a more meaningful fallback based on text content
      const hash = text.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      return Array(1536).fill(0).map((_, i) => {
        const seed = (hash + i) % 1000 / 1000;
        return seed * 0.2; // Normalize to small values
      });
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000) // Limit to avoid token limits
    });

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid embedding response');
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    // Return a fallback embedding
    const hash = (text || '').split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return Array(1536).fill(0).map((_, i) => {
      const seed = (hash + i) % 1000 / 1000;
      return seed * 0.2;
    });
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

// Generate AI summary and keywords
async function generateSummary(text) {
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

    return { summary, keywords };
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

// Generate chat response for AI assistant
async function generateChatResponse(message, userType, userContext) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses based on user type and message
    let systemPrompt = `You are a helpful AI assistant for a sponsorship matchmaking platform called SponsorLink. 
You help ${userType === 'organizer' ? 'event organizers' : 'brands'} find sponsorship opportunities and understand how the platform works.

Key features you can help with:
- Finding matching events or brands
- Understanding how the AI matching system works
- Creating and optimizing profiles
- Understanding sponsorship opportunities
- Platform navigation and features

Be friendly, concise, and helpful. Provide actionable advice.`;

    // Add user context if available
    if (userContext && Object.keys(userContext).length > 0) {
      if (userType === 'organizer') {
        systemPrompt += `\n\nThe user is an organizer. Their profile: ${JSON.stringify(userContext).substring(0, 200)}`;
      } else if (userType === 'brand') {
        systemPrompt += `\n\nThe user is a brand. Company: ${userContext.companyName || 'N/A'}, Type: ${userContext.productServiceType || 'N/A'}`;
      }
    }

    // Handle specific questions
    if (lowerMessage.includes('how does matching work') || lowerMessage.includes('how does the matching system work')) {
      return `Our AI-powered matching system uses multiple factors to find the best matches:

1. **Semantic Similarity** (10 points): Uses AI embeddings to understand the meaning and context of your event/brand description
2. **Category Fit** (30 points): Matches event types with brand preferences
3. **Audience Overlap** (25 points): Compares target audience demographics, age ranges, and interests
4. **Location Fit** (20 points): Matches event locations with brand location preferences
5. **Budget Fit** (15 points): Ensures budget ranges align

The system calculates a relevance score (0-100) and shows matches with scores above 30. Higher scores mean better alignment!

To get better matches:
- Fill out your profile completely
- Be specific about your target audience
- Include detailed descriptions
- Set realistic budget ranges`;
    }

    if (lowerMessage.includes('how do i create an event') || lowerMessage.includes('create event')) {
      return `To create an event:

1. Go to the "Events" page and click "Create Event"
2. Fill out the multi-step form:
   - **Step 1**: Basic info (name, type, description, scale, expected attendees)
   - **Step 2**: Location & dates
   - **Step 3**: Target audience (age range, interests)
   - **Step 4**: Sponsorship needs (budget, categories, requirements)

3. Click "Create Event & Find Matches"
4. Our AI will automatically find matching brands!

**Tips for better matches:**
- Be detailed in your description
- Accurately describe your target audience
- Set realistic budget expectations
- Include all relevant event categories`;
    }

    if (lowerMessage.includes('how do i find sponsors') || lowerMessage.includes('find sponsors')) {
      if (userType === 'organizer') {
        return `To find sponsors for your events:

1. **Create your event** with complete details
2. **The AI automatically finds matches** when you create/update an event
3. **View matches** on the "Matches" page
4. **Review match scores** - higher scores mean better alignment
5. **Generate proposals** for brands you're interested in
6. **Send proposals** through the platform

**Pro tip**: Update your event details regularly. The AI re-matches when you update your event, so you'll discover new potential sponsors!`;
      } else {
        return `To find events to sponsor:

1. **Complete your brand profile** with all details
2. **The AI automatically finds matches** when you create/update your profile
3. **View matches** on the "Matches" page
4. **Review match scores** - higher scores mean better alignment
5. **Generate proposals** for events you're interested in
6. **Contact organizers** through the platform

**Pro tip**: Be specific about your target audience and marketing goals. This helps the AI find events that truly align with your brand!`;
      }
    }

    if (lowerMessage.includes('what makes a good profile') || lowerMessage.includes('good profile')) {
      if (userType === 'organizer') {
        return `A great event profile includes:

✅ **Detailed description**: Explain what makes your event unique
✅ **Accurate target audience**: Age range, interests, demographics
✅ **Clear sponsorship needs**: Budget range, categories, deliverables
✅ **Location details**: City, country, venue information
✅ **Event scale**: Expected attendees, event type
✅ **Marketing goals**: What sponsors can expect

**The more detail, the better!** Our AI uses this information to find brands that truly match your event.`;
      } else {
        return `A great brand profile includes:

✅ **Company description**: What you do and what makes you unique
✅ **Target audience**: Age range, interests, demographics you want to reach
✅ **Marketing goals**: Awareness, lead generation, brand building, etc.
✅ **Event preferences**: Categories, locations, event scales
✅ **Budget range**: Realistic sponsorship budget
✅ **Location preferences**: Cities/countries where you want to sponsor

**The more detail, the better!** Our AI uses this information to find events that truly match your brand.`;
      }
    }

    // Use OpenAI for general questions if API key is available
    if (openai && process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error('Error calling OpenAI:', error);
      }
    }

    // Fallback response
    return `I'm here to help you with:
- Understanding how the matching system works
- Creating and optimizing your profile
- Finding sponsorship opportunities
- Platform navigation

What specific question can I help you with? You can ask about matching, creating events, finding sponsors, or anything else about the platform!`;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'Sorry, I encountered an error. Please try again or contact support.';
  }
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  generateSummary,
  generateProposal,
  generateChatResponse
};

