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
  const [lastSyncedData, setLastSyncedData] = useState<string>('');

  // Sync to Firestore when local state changes (debounced)
  useEffect(() => {
    if (!user || !userProfile) return;

    // Create a hash of current data to compare
    const currentDataHash = JSON.stringify({
      caughtData,
      isCompletionist,
      autoCollapsePostNational
    });

    // Skip sync if data hasn't actually changed
    if (currentDataHash === lastSyncedData) {
      return;
    }

    // Debounce sync to avoid too many writes (increased to 3 seconds)
    const syncTimeout = setTimeout(async () => {
      // Double-check data hasn't changed during the debounce period
      const latestDataHash = JSON.stringify({
        caughtData,
        isCompletionist,
        autoCollapsePostNational
      });
      
      if (latestDataHash === lastSyncedData) {
        return; // Data hasn't changed, skip sync
      }

      setIsSyncing(true);
      try {
        await updateProfile({
          caughtData,
          isCompletionist,
          autoCollapsePostNational
        });
        setLastSyncedData(latestDataHash); // Remember what we synced
      } catch (error) {
        console.error('Error syncing to Firestore:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 3000); // Wait 3 seconds after last change before syncing

    return () => clearTimeout(syncTimeout);
  }, [caughtData, isCompletionist, autoCollapsePostNational, user, userProfile, updateProfile, lastSyncedData]);

  // Reset lastSyncedData when userProfile changes (from Firestore)
  useEffect(() => {
    if (userProfile) {
      const firestoreDataHash = JSON.stringify({
        caughtData: userProfile.caughtData || {},
        isCompletionist: userProfile.isCompletionist ?? false,
        autoCollapsePostNational: userProfile.autoCollapsePostNational ?? true
      });
      setLastSyncedData(firestoreDataHash);
    }
  }, [userProfile?.caughtData, userProfile?.isCompletionist, userProfile?.autoCollapsePostNational]);

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

