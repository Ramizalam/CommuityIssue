import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LogIn, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from './AuthModal';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authenticated = !!session;
        setIsAuthenticated(authenticated);
        setUserEmail(session?.user?.email || null);
        
        // Check if user is admin
        if (authenticated && session?.user?.email === 'admin123@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
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
    
    // Direct check for admin email
    if (session?.user?.email === 'admin123@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setIsAdmin(false);
    setIsMenuOpen(false);
  }

  // For debugging - remove in production
  console.log("Auth state:", { isAuthenticated, isAdmin, userEmail });

  return (
    <header className="bg-indigo-600">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4 md:py-6">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span className="text-xl md:text-2xl font-bold text-white">CommunityWatch</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-white hover:text-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Always show View Issues for all users */}
            <Link
              to="/issues"
              className="inline-block rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-base font-medium text-white hover:bg-indigo-600"
            >
              View Issues
            </Link>
            
            {isAuthenticated && !isAdmin && (
              <Link
                to="/report"
                className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Report Issue
              </Link>
            )}
            
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-block rounded-md border border-transparent bg-white py-2 px-4 text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                Admin Dashboard
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-white">
                  {userEmail} {isAdmin ? "(Admin)" : ""}
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

        {/* Mobile menu, show/hide based on menu state */}
        {isMenuOpen && (
          <div className="md:hidden py-3 pb-5 border-t border-indigo-500">
            <div className="space-y-3 flex flex-col items-center">
              {/* Always show View Issues for all users in mobile menu too */}
              <Link
                to="/issues"
                className="block w-full rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-center font-medium text-white hover:bg-indigo-600"
                onClick={() => setIsMenuOpen(false)}
              >
                View Issues
              </Link>
              
              {isAuthenticated && !isAdmin && (
                <Link
                  to="/report"
                  className="block w-full rounded-md border border-transparent bg-white py-2 px-4 text-center font-medium text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Report Issue
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block w-full rounded-md border border-transparent bg-white py-2 px-4 text-center font-medium text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="flex flex-col items-center space-y-3 w-full">
                  <span className="text-sm text-white">
                    {userEmail} {isAdmin ? "(Admin)" : ""}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white hover:bg-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(adminStatus) => {
          setIsAuthenticated(true);
          // If admin status was explicitly provided, use it
          if (adminStatus !== undefined) {
            setIsAdmin(adminStatus);
          }
          setShowAuthModal(false);
        }}
      />
    </header>
  );
}