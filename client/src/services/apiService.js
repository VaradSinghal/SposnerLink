import { auth } from '../config/firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get auth token for API requests
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

// Make authenticated API request
async function apiRequest(endpoint, options = {}) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Find matches for event
export async function findMatchesForEvent(eventId) {
  return apiRequest('/api/find-matches-for-event', {
    method: 'POST',
    body: JSON.stringify({ eventId }),
  });
}

// Find matches for brand
export async function findMatchesForBrand(brandId) {
  return apiRequest('/api/find-matches-for-brand', {
    method: 'POST',
    body: JSON.stringify({ brandId }),
  });
}

// Generate proposal
export async function generateProposal(eventId, brandId) {
  return apiRequest('/api/generate-proposal', {
    method: 'POST',
    body: JSON.stringify({ eventId, brandId }),
  });
}

// Chat with AI assistant
export async function chatWithAI(message, user) {
  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ 
      message,
      userType: user?.userType || 'organizer',
      userId: user?.id 
    }),
  });
}

// Health check
export async function healthCheck() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    return { status: 'error', message: error.message };
  }
}

