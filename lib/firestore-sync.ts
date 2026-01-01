import { useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { UserProfile } from './auth-context';

/**
 * Custom hook to sync local state with Firestore
 * This automatically syncs caughtData, isCompletionist, and autoCollapsePostNational
 * to Firestore whenever they change
 */
export const useFirestoreSync = (
  caughtData: Record<string, number>,
  isCompletionist: boolean,
  autoCollapsePostNational: boolean
) => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to Firestore when local state changes (debounced)
  useEffect(() => {
    if (!user || !userProfile) return;

    // Debounce sync to avoid too many writes
    const syncTimeout = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await updateProfile({
          caughtData,
          isCompletionist,
          autoCollapsePostNational
        });
      } catch (error) {
        console.error('Error syncing to Firestore:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1000); // Wait 1 second after last change before syncing

    return () => clearTimeout(syncTimeout);
  }, [caughtData, isCompletionist, autoCollapsePostNational, user, userProfile, updateProfile]);

  return { isSyncing };
};

/**
 * Hook to load user profile data from Firestore into local state
 * This is useful when you want to initialize local state from Firestore
 */
export const useLoadProfileFromFirestore = () => {
  const { userProfile } = useAuth();

  const getInitialCaughtData = (): Record<string, number> => {
    return userProfile?.caughtData || {};
  };

  const getInitialIsCompletionist = (): boolean => {
    return userProfile?.isCompletionist ?? false;
  };

  const getInitialAutoCollapse = (): boolean => {
    return userProfile?.autoCollapsePostNational ?? true;
  };

  return {
    getInitialCaughtData,
    getInitialIsCompletionist,
    getInitialAutoCollapse
  };
};

