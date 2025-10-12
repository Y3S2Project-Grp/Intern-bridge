import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    QuerySnapshot,
    Unsubscribe,
    updateDoc,
    where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebaseConfig';
import { BaseModel } from '../types/common';

interface UseFirestoreOptions {
  realtime?: boolean;
  queryConstraints?: QueryConstraint[];
}

interface UseFirestoreResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  add: (item: Omit<T, keyof BaseModel>) => Promise<string>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<T | null>;
  refresh: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useFirestore = <T extends BaseModel>(
  collectionName: string, 
  options: UseFirestoreOptions = {}
): UseFirestoreResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  const collectionRef = collection(db, collectionName);

  const fetchData = async (loadMore: boolean = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }
      setError(null);

      let q = query(collectionRef);
      
      // Apply query constraints if provided
      if (options.queryConstraints) {
        q = query(collectionRef, ...options.queryConstraints);
      }

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      if (loadMore) {
        setData(prev => [...prev, ...items]);
      } else {
        setData(items);
      }

      // Set pagination info
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === 10); // Assuming page size of 10
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!options.realtime) return;

    try {
      let q = query(collectionRef);
      
      if (options.queryConstraints) {
        q = query(collectionRef, ...options.queryConstraints);
      }

      const unsubscribeFn = onSnapshot(q, 
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          setData(items);
        },
        (err) => {
          setError(err.message);
          console.error('Realtime listener error:', err);
        }
      );

      setUnsubscribe(() => unsubscribeFn);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (options.realtime) {
      setupRealtimeListener();
    } else {
      fetchData();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, JSON.stringify(options.queryConstraints)]);

  const add = async (item: Omit<T, keyof BaseModel>): Promise<string> => {
    try {
      setError(null);
      const docRef = await addDoc(collectionRef, {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (err: any) {
      setError(err.message || 'Failed to add document');
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>): Promise<void> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
      throw err;
    }
  };

  const get = async (id: string): Promise<T | null> => {
    try {
      setError(null);
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to get document');
      throw err;
    }
  };

  const refresh = async (): Promise<void> => {
    await fetchData();
  };

  const loadMore = async (): Promise<void> => {
    if (!hasMore || loading) return;
    await fetchData(true);
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    get,
    refresh,
    hasMore,
    loadMore,
  };
};

// Specialized hooks for common collections
export const useUsers = (options?: UseFirestoreOptions) => {
  return useFirestore('users', options);
};

export const useInternships = (options?: UseFirestoreOptions) => {
  return useFirestore('internships', options);
};

export const useApplications = (options?: UseFirestoreOptions) => {
  return useFirestore('applications', options);
};

export const useEligibilityResults = (options?: UseFirestoreOptions) => {
  return useFirestore('eligibilityResults', options);
};

// Query builder helpers
export const useFirestoreQueries = {
  // Get internships by organization
  internshipsByOrg: (orgId: string) => useInternships({
    queryConstraints: [
      where('organizationId', '==', orgId),
      orderBy('createdAt', 'desc')
    ]
  }),

  // Get active internships
  activeInternships: () => useInternships({
    queryConstraints: [
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    ]
  }),

  // Get user applications
  userApplications: (userId: string) => useApplications({
    queryConstraints: [
      where('userId', '==', userId),
      orderBy('appliedAt', 'desc')
    ]
  }),

  // Get applications for internship
  internshipApplications: (internshipId: string) => useApplications({
    queryConstraints: [
      where('internshipId', '==', internshipId),
      orderBy('appliedAt', 'desc')
    ]
  }),
};

export default useFirestore;