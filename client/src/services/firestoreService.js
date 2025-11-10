import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Helper to convert Firestore timestamp to date
const toDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Users Collection
export const usersCollection = collection(db, 'users');

export const Users = {
  async findById(id) {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async findByEmail(email) {
    const q = query(usersCollection, where('email', '==', email.toLowerCase()), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async findByFirebaseUid(firebaseUid) {
    const q = query(usersCollection, where('firebaseUid', '==', firebaseUid), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async create(data) {
    const userData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(usersCollection, userData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'users', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  }
};

// Events Collection
export const eventsCollection = collection(db, 'events');

export const Events = {
  async findById(id) {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async find(filters = {}) {
    try {
      let q = query(eventsCollection);
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.organizerId) {
        q = query(q, where('organizerId', '==', filters.organizerId));
      }

      // Try to order by createdAt, but if it fails (no index), just get results
      try {
        q = query(q, orderBy('createdAt', 'desc'));
      } catch (e) {
        // If orderBy fails, continue without it
        console.warn('Could not order by createdAt, index may be needed');
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
      });
      
      // Sort manually if orderBy failed
      if (results.length > 0 && results[0].createdAt) {
        results.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error finding events:', error);
      return [];
    }
  },

  async create(data) {
    const eventData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(eventsCollection, eventData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'events', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  },

  async delete(id) {
    const docRef = doc(db, 'events', id);
    await deleteDoc(docRef);
  },

  async populateOrganizer(event) {
    if (!event.organizerId) return event;
    const organizer = await Users.findById(event.organizerId);
    return { ...event, organizerId: organizer || { id: event.organizerId } };
  }
};

// Posts Collection
export const postsCollection = collection(db, 'posts');

export const Posts = {
  async findById(id) {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async find(filters = {}) {
    try {
      let q = query(postsCollection);
      
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      try {
        q = query(q, orderBy('createdAt', 'desc'));
      } catch (e) {
        console.warn('Could not order by createdAt, index may be needed');
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
      });
      
      if (results.length > 0 && results[0].createdAt) {
        results.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error finding posts:', error);
      return [];
    }
  },

  async create(data) {
    const postData = {
      ...data,
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(postsCollection, postData);
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'posts', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  },

  async delete(id) {
    const docRef = doc(db, 'posts', id);
    await deleteDoc(docRef);
  },

  async likePost(postId, userId) {
    const post = await this.findById(postId);
    if (!post) throw new Error('Post not found');
    
    const likes = post.likes || [];
    const isLiked = likes.includes(userId);
    
    const updatedLikes = isLiked 
      ? likes.filter(id => id !== userId)
      : [...likes, userId];
    
    return this.update(postId, { likes: updatedLikes });
  },

  async addComment(postId, comment) {
    const post = await this.findById(postId);
    if (!post) throw new Error('Post not found');
    
    const comments = post.comments || [];
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    return this.update(postId, { comments: [...comments, newComment] });
  }
};

// Brands Collection
export const brandsCollection = collection(db, 'brands');

export const Brands = {
  async findById(id) {
    const docRef = doc(db, 'brands', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async findByUserId(userId) {
    const q = query(brandsCollection, where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async find(filters = {}) {
    try {
      let q = query(brandsCollection);
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Try to order by createdAt, but if it fails (no index), just get results
      try {
        q = query(q, orderBy('createdAt', 'desc'));
      } catch (e) {
        console.warn('Could not order by createdAt, index may be needed');
      }
      
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
      });
      
      // Sort manually if orderBy failed
      if (results.length > 0 && results[0].createdAt) {
        results.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error finding brands:', error);
      return [];
    }
  },

  async create(data) {
    const brandData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(brandsCollection, brandData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'brands', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  },

  async populateUser(brand) {
    if (!brand.userId) return brand;
    const user = await Users.findById(brand.userId);
    return { ...brand, userId: user || { id: brand.userId } };
  }
};

// Matches Collection
export const matchesCollection = collection(db, 'matches');

export const Matches = {
  async findById(id) {
    const docRef = doc(db, 'matches', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async find(filters = {}) {
    try {
      let q = query(matchesCollection);
      
      if (filters.eventId) {
        q = query(q, where('eventId', '==', filters.eventId));
      }
      if (filters.brandId) {
        q = query(q, where('brandId', '==', filters.brandId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Try to order by relevanceScore, but if it fails (no index), just get results
      try {
        q = query(q, orderBy('relevanceScore', 'desc'));
      } catch (e) {
        console.warn('Could not order by relevanceScore, index may be needed');
      }
      
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
      });
      
      // Sort manually if orderBy failed
      if (results.length > 0 && results[0].relevanceScore !== undefined) {
        results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      }
      
      return results;
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  },

  async findByEventAndBrand(eventId, brandId) {
    const q = query(
      matchesCollection,
      where('eventId', '==', eventId),
      where('brandId', '==', brandId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async create(data) {
    const matchData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(matchesCollection, matchData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'matches', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  },

  async upsert(eventId, brandId, data) {
    const existing = await this.findByEventAndBrand(eventId, brandId);
    if (existing) {
      return this.update(existing.id, data);
    } else {
      return this.create({ eventId, brandId, ...data });
    }
  },

  async populateEvent(match) {
    if (!match.eventId) return match;
    const event = await Events.findById(match.eventId);
    return { ...match, eventId: event || { id: match.eventId } };
  },

  async populateBrand(match) {
    if (!match.brandId) return match;
    const brand = await Brands.findById(match.brandId);
    return { ...match, brandId: brand || { id: match.brandId } };
  }
};

// Proposals Collection
export const proposalsCollection = collection(db, 'proposals');

export const Proposals = {
  async findById(id) {
    const docRef = doc(db, 'proposals', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
  },

  async find(filters = {}) {
    try {
      let q = query(proposalsCollection);
      
      if (filters.organizerId) {
        q = query(q, where('organizerId', '==', filters.organizerId));
      }
      if (filters.brandId) {
        q = query(q, where('brandId', '==', filters.brandId));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Try to order by createdAt, but if it fails (no index), just get results
      try {
        q = query(q, orderBy('createdAt', 'desc'));
      } catch (e) {
        console.warn('Could not order by createdAt, index may be needed');
      }
      
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
      });
      
      // Sort manually if orderBy failed
      if (results.length > 0 && results[0].createdAt) {
        results.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error finding proposals:', error);
      return [];
    }
  },

  async create(data) {
    const proposalData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(proposalsCollection, proposalData);
    // Fetch the created document to get the actual timestamps
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data();
    return { id: docRef.id, ...createdData, createdAt: toDate(createdData.createdAt), updatedAt: toDate(createdData.updatedAt) };
  },

  async update(id, data) {
    const docRef = doc(db, 'proposals', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await updateDoc(docRef, updateData);
    return this.findById(id);
  },

  async populateEvent(proposal) {
    if (!proposal.eventId) return proposal;
    const event = await Events.findById(proposal.eventId);
    return { ...proposal, eventId: event || { id: proposal.eventId } };
  },

  async populateBrand(proposal) {
    if (!proposal.brandId) return proposal;
    const brand = await Brands.findById(proposal.brandId);
    return { ...proposal, brandId: brand || { id: proposal.brandId } };
  },

  async populateOrganizer(proposal) {
    if (!proposal.organizerId) return proposal;
    const organizer = await Users.findById(proposal.organizerId);
    return { ...proposal, organizerId: organizer || { id: proposal.organizerId } };
  }
};

