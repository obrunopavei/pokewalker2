import React from 'react';
import { useAuth } from '../lib/auth-context';
import { LogOut, User } from 'lucide-react';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, userProfile, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  if (!user || !userProfile) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {userProfile.photoURL ? (
        <img
          src={userProfile.photoURL}
          alt={userProfile.displayName || 'User'}
          className="w-10 h-10 rounded-full border-2 border-gray-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {userProfile.displayName || 'User'}
        </p>
        {userProfile.email && (
          <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
        )}
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors disabled:opacity-50"
        title="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

