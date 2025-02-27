import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AuthModal } from '../components/AuthModal';

export function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  }

  const handleReportClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/report');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="text-center px-4 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-6xl">
        Report Local Issues in Your Community
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 ">
        Help make your community better by reporting issues like potholes, garbage, or water shortages.
        Together we can create positive change.
      </p>
      <div className="mt-10">
        <button
          onClick={handleReportClick}
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Report an Issue
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-indigo-600" />
          <h3 className="mt-4 text-lg font-semibold">Report Problems</h3>
          <p className="mt-2 text-gray-600">
            Easily report local issues with details and photos
          </p>
        </div>
        <div className="flex flex-col items-center">
          <MapPin className="h-12 w-12 text-indigo-600" />
          <h3 className="mt-4 text-lg font-semibold">Location Tracking</h3>
          <p className="mt-2 text-gray-600">
            Pin the exact location of the issue on the map
          </p>
        </div>
        <div className="flex flex-col items-center">
          <List className="h-12 w-12 text-indigo-600" />
          <h3 className="mt-4 text-lg font-semibold">Track Progress</h3>
          <p className="mt-2 text-gray-600">
            Follow up on reported issues and their status
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuthModal(false);
          navigate('/report');
        }}
      />
    </div>
  );
}