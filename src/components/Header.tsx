import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setUserEmail(session?.user?.email || null);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setUserEmail(session?.user?.email || null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
  }

  return (
    <header className="bg-indigo-600">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">CommunityWatch</span>
            </Link>
          </div>
          <div className="ml-10 space-x-4 flex items-center">
            <Link
              to="/report"
              className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Report Issue
            </Link>
            <Link
              to="/issues"
              className="inline-block rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-base font-medium text-white hover:bg-indigo-600"
            >
              View Issues
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-white hidden md:inline-block">
                  {userEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white hover:bg-red-600"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthModal(false);
        }}
      />
    </header>
  );
}