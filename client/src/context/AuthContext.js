import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Users, Brands } from '../services/firestoreService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const isRegisteringRef = useRef(false); // Use ref to track registration state

  // Helper function to determine userType from brand profile
  const determineUserType = async (firebaseUid) => {
    try {
      const brand = await Brands.findByUserId(firebaseUid);
      return brand ? 'brand' : null;
    } catch (error) {
      console.error('Error checking brand profile:', error);
      return null;
    }
  };

  // Helper function to find or create user document with retry
  const findOrCreateUserDoc = async (firebaseUser, retryCount = 0) => {
    // First, try to find by firebaseUid
    let userDoc = await Users.findByFirebaseUid(firebaseUser.uid);
    
    if (userDoc) {
      return userDoc;
    }

    // If not found, try to find by email
    userDoc = await Users.findByEmail(firebaseUser.email);
    
    if (userDoc) {
      // If found by email but no firebaseUid, update it
      if (!userDoc.firebaseUid) {
        await Users.update(userDoc.id, { firebaseUid: firebaseUser.uid });
        userDoc = await Users.findById(userDoc.id);
      }
      return userDoc;
    }

    // If still not found and we're not registering, wait a bit and retry (in case registration just happened)
    // This prevents race conditions where onAuthStateChanged fires before Firestore syncs
    if (!isRegisteringRef.current && retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms
      return findOrCreateUserDoc(firebaseUser, retryCount + 1);
    }

    // If still not found after retries, only create if we're not in registration
    // (registration function will create it)
    if (isRegisteringRef.current) {
      // During registration, don't create here - wait for registration to complete
      console.log('AuthContext - Registration in progress, skipping user doc creation in onAuthStateChanged');
      return null;
    }

    // Only create if we're sure it doesn't exist (not during registration)
    const inferredUserType = await determineUserType(firebaseUser.uid);
    userDoc = await Users.create({
      firebaseUid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      email: firebaseUser.email,
      userType: inferredUserType || 'organizer'
    });

    return userDoc;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          // Get user data from Firestore (with retry logic to prevent duplicates)
          let userDoc = await findOrCreateUserDoc(firebaseUser);
          
          // If userDoc is null (during registration), wait a bit and try again
          if (!userDoc && isRegisteringRef.current) {
            await new Promise(resolve => setTimeout(resolve, 500));
            userDoc = await Users.findByFirebaseUid(firebaseUser.uid);
          }
          
          if (!userDoc) {
            // If still not found, use fallback data
            console.warn('AuthContext - User document not found, using fallback data');
            setUserData({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              email: firebaseUser.email,
              userType: 'organizer'
            });
            setLoading(false);
            return;
          }
          
          // If userType is null/undefined, try to infer it from brand profile
          if (!userDoc.userType || userDoc.userType === null) {
            const inferredUserType = await determineUserType(firebaseUser.uid);
            const finalUserType = inferredUserType || 'organizer'; // Default to organizer
            
            if (userDoc.userType !== finalUserType) {
              await Users.update(userDoc.id, { userType: finalUserType });
              userDoc = await Users.findById(userDoc.id);
            }
          }
          
          const userDataObj = {
            id: userDoc.id || firebaseUser.uid,
            name: userDoc.name || firebaseUser.displayName,
            email: userDoc.email || firebaseUser.email,
            userType: userDoc.userType || 'organizer', // Ensure userType is never null
            ...userDoc
          };
          
          // Ensure userType is set
          if (!userDataObj.userType) {
            userDataObj.userType = 'organizer';
          }
          
          // Debug: Log user data
          console.log('AuthContext - User doc from Firestore:', userDoc);
          console.log('AuthContext - User data object:', userDataObj);
          console.log('AuthContext - UserType:', userDataObj.userType);
          
          setUserData(userDataObj);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data with default userType
          setUserData({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            email: firebaseUser.email,
            userType: 'organizer' // Default to organizer
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (name, email, password, userType) => {
    try {
      // Validate userType
      if (!userType || (userType !== 'organizer' && userType !== 'brand')) {
        return {
          success: false,
          message: 'Invalid user type. Please select organizer or brand.'
        };
      }

      // Set registration flag to prevent duplicate creation in onAuthStateChanged
      isRegisteringRef.current = true;

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: name });

      // Check if user document already exists (shouldn't, but just in case)
      let userDoc = await Users.findByFirebaseUid(firebaseUser.uid);
      
      if (!userDoc) {
        // Check by email too
        userDoc = await Users.findByEmail(email);
      }

      if (!userDoc) {
        // Create user document in Firestore with userType
        userDoc = await Users.create({
          firebaseUid: firebaseUser.uid,
          name,
          email,
          userType: userType
        });
        console.log('AuthContext - Created user doc during registration:', userDoc);
      } else {
        // If document exists, update it with userType
        console.log('AuthContext - User doc already exists, updating userType');
        userDoc = await Users.update(userDoc.id, { 
          firebaseUid: firebaseUser.uid,
          userType: userType 
        });
      }

      // Create brand profile if userType is brand
      if (userType === 'brand') {
        try {
          // Check if brand profile already exists
          const existingBrand = await Brands.findByUserId(firebaseUser.uid);
          if (!existingBrand) {
            await Brands.create({
              userId: firebaseUser.uid,
              companyName: name,
              status: 'active'
            });
            console.log('AuthContext - Created brand profile during registration');
          }
        } catch (brandError) {
          console.error('Error creating brand profile:', brandError);
          // Don't fail registration if brand profile creation fails
        }
      }

      // Set user data immediately
      setUserData({
        id: userDoc.id || firebaseUser.uid,
        name: userDoc.name || name,
        email: userDoc.email || email,
        userType: userDoc.userType || userType,
        ...userDoc
      });

      // Clear registration flag after a short delay
      setTimeout(() => {
        isRegisteringRef.current = false;
      }, 1000);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      isRegisteringRef.current = false; // Clear flag on error
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  // Ensure userData always has a valid userType
  const getUserData = () => {
    if (userData) {
      return {
        ...userData,
        userType: userData.userType || 'organizer' // Default to organizer if missing
      };
    }
    if (user) {
      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0],
        email: user.email,
        userType: 'organizer' // Default to organizer
      };
    }
    return null;
  };

  const value = {
    user: getUserData(),
    firebaseUser: user,
    loading,
    login,
    register,
    logout,
    getToken,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
