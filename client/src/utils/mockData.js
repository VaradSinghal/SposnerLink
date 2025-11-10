// Utility to create mock events for testing
import { Events, Users } from '../services/firestoreService';

export const mockEvents = [
  {
    name: 'Tech Innovation Summit 2024',
    type: 'tech',
    theme: 'AI & Machine Learning',
    description: 'Join us for the biggest tech innovation summit of the year! Featuring keynote speakers from leading tech companies, hands-on workshops, and networking opportunities. Perfect for tech enthusiasts, developers, and entrepreneurs looking to stay ahead of the curve.',
    location: {
      city: 'San Francisco',
      state: 'California',
      country: 'USA',
      address: 'Moscone Center, 747 Howard St, San Francisco, CA 94103',
    },
    date: {
      startDate: new Date('2024-06-15').toISOString(),
      endDate: new Date('2024-06-17').toISOString(),
    },
    scale: 'large',
    expectedAttendees: 5000,
    targetAudience: {
      ageRange: { min: 25, max: 45 },
      interests: ['technology', 'artificial intelligence', 'startups', 'innovation'],
      demographics: {
        gender: 'all',
        education: 'college',
        income: 'middle-high',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 10000, max: 100000 },
      categories: ['title sponsor', 'gold sponsor', 'silver sponsor', 'food & beverage'],
      brandingRequirements: ['logo placement', 'booth space', 'social media mentions'],
      deliverables: ['branded swag', 'speaking slot', 'networking event'],
    },
    status: 'active',
  },
  {
    name: 'Music & Arts Festival',
    type: 'culture',
    theme: 'Summer Vibes',
    description: 'A three-day music and arts festival featuring top artists, local artisans, food vendors, and interactive art installations. Experience the best of music, culture, and community in one amazing event.',
    location: {
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      address: 'Zilker Park, Austin, TX',
    },
    date: {
      startDate: new Date('2024-07-20').toISOString(),
      endDate: new Date('2024-07-22').toISOString(),
    },
    scale: 'large',
    expectedAttendees: 15000,
    targetAudience: {
      ageRange: { min: 18, max: 40 },
      interests: ['music', 'arts', 'festivals', 'entertainment'],
      demographics: {
        gender: 'all',
        education: 'all',
        income: 'all',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 5000, max: 50000 },
      categories: ['beverage sponsor', 'food sponsor', 'merchandise sponsor'],
      brandingRequirements: ['stage branding', 'wristband branding', 'social media'],
      deliverables: ['vendor booth', 'branded merchandise', 'social media posts'],
    },
    status: 'active',
  },
  {
    name: 'Startup Pitch Competition',
    type: 'business',
    theme: 'Entrepreneurship & Innovation',
    description: 'Watch the next generation of entrepreneurs pitch their innovative ideas to a panel of investors and industry experts. Network with founders, investors, and mentors in the startup ecosystem.',
    location: {
      city: 'New York',
      state: 'New York',
      country: 'USA',
      address: 'Tech Hub NYC, 123 Innovation St, New York, NY 10001',
    },
    date: {
      startDate: new Date('2024-05-10').toISOString(),
      endDate: new Date('2024-05-10').toISOString(),
    },
    scale: 'medium',
    expectedAttendees: 500,
    targetAudience: {
      ageRange: { min: 22, max: 35 },
      interests: ['startups', 'entrepreneurship', 'venture capital', 'innovation'],
      demographics: {
        gender: 'all',
        education: 'college',
        income: 'middle-high',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 2000, max: 20000 },
      categories: ['title sponsor', 'prize sponsor', 'networking sponsor'],
      brandingRequirements: ['logo placement', 'speaking opportunity'],
      deliverables: ['judge seat', 'networking event', 'branded materials'],
    },
    status: 'active',
  },
  {
    name: 'College Sports Championship',
    type: 'sports',
    theme: 'College Athletics',
    description: 'The annual college sports championship featuring top teams competing in multiple sports. A celebration of athleticism, school spirit, and community. Perfect for brands looking to reach the college demographic.',
    location: {
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      address: 'Rose Bowl Stadium, Pasadena, CA',
    },
    date: {
      startDate: new Date('2024-09-15').toISOString(),
      endDate: new Date('2024-09-17').toISOString(),
    },
    scale: 'enterprise',
    expectedAttendees: 50000,
    targetAudience: {
      ageRange: { min: 18, max: 25 },
      interests: ['sports', 'college', 'athletics', 'competition'],
      demographics: {
        gender: 'all',
        education: 'college',
        income: 'low-middle',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 50000, max: 500000 },
      categories: ['title sponsor', 'official partner', 'broadcast sponsor'],
      brandingRequirements: ['stadium branding', 'jersey branding', 'broadcast mentions'],
      deliverables: ['VIP access', 'advertising slots', 'product placement'],
    },
    status: 'active',
  },
  {
    name: 'Educational Tech Conference',
    type: 'education',
    theme: 'EdTech Innovation',
    description: 'A conference dedicated to the future of education technology. Learn about the latest tools, platforms, and methodologies transforming education. Connect with educators, administrators, and EdTech companies.',
    location: {
      city: 'Boston',
      state: 'Massachusetts',
      country: 'USA',
      address: 'Boston Convention Center, 415 Summer St, Boston, MA 02210',
    },
    date: {
      startDate: new Date('2024-08-05').toISOString(),
      endDate: new Date('2024-08-07').toISOString(),
    },
    scale: 'medium',
    expectedAttendees: 2000,
    targetAudience: {
      ageRange: { min: 25, max: 55 },
      interests: ['education', 'technology', 'teaching', 'learning'],
      demographics: {
        gender: 'all',
        education: 'college',
        income: 'middle',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 5000, max: 30000 },
      categories: ['exhibitor', 'workshop sponsor', 'lunch sponsor'],
      brandingRequirements: ['booth space', 'session branding', 'conference materials'],
      deliverables: ['exhibition space', 'workshop slot', 'branded materials'],
    },
    status: 'active',
  },
  {
    name: 'Community Health Fair',
    type: 'community',
    theme: 'Health & Wellness',
    description: 'A community-focused health and wellness fair offering free health screenings, fitness demonstrations, healthy cooking classes, and wellness workshops. Promoting healthy living in our community.',
    location: {
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA',
      address: 'Grant Park, Chicago, IL',
    },
    date: {
      startDate: new Date('2024-06-01').toISOString(),
      endDate: new Date('2024-06-01').toISOString(),
    },
    scale: 'medium',
    expectedAttendees: 3000,
    targetAudience: {
      ageRange: { min: 18, max: 65 },
      interests: ['health', 'wellness', 'fitness', 'community'],
      demographics: {
        gender: 'all',
        education: 'all',
        income: 'all',
      },
    },
    sponsorshipNeeds: {
      budgetRange: { min: 1000, max: 10000 },
      categories: ['health sponsor', 'wellness sponsor', 'food sponsor'],
      brandingRequirements: ['booth space', 'tent branding', 'flyers'],
      deliverables: ['vendor space', 'branded materials', 'social media'],
    },
    status: 'active',
  },
];

// Function to create mock events (call this from browser console or admin panel)
export const createMockEvents = async (organizerId) => {
  if (!organizerId) {
    console.error('Organizer ID is required');
    return;
  }

  const results = [];
  for (const eventData of mockEvents) {
    try {
      const event = await Events.create({
        ...eventData,
        organizerId: organizerId,
      });
      results.push({ success: true, event });
      console.log(`Created event: ${event.name}`);
    } catch (error) {
      console.error(`Failed to create event ${eventData.name}:`, error);
      results.push({ success: false, error: error.message, event: eventData.name });
    }
  }
  
  return results;
};

// Function to create a test organizer user (for testing purposes)
export const createTestOrganizer = async () => {
  try {
    const organizer = await Users.create({
      firebaseUid: 'test-organizer-' + Date.now(),
      name: 'Test Organizer',
      email: 'organizer@test.com',
      userType: 'organizer',
    });
    console.log('Created test organizer:', organizer);
    return organizer;
  } catch (error) {
    console.error('Failed to create test organizer:', error);
    return null;
  }
};

