import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, List } from 'lucide-react';

export function Home() {
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
        <Link
          to="/report"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Report an Issue
        </Link>
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
    </div>
  );
}