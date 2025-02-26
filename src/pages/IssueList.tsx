import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { getIssues, Issue, updateIssueStatus } from '../lib/supabase';
import { IssueFilters } from '../components/IssueFilters';
import { IssueComments } from '../components/IssueComments';

const statusIcons = {
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  in_progress: <AlertTriangle className="h-5 w-5 text-blue-500" />,
  resolved: <CheckCircle className="h-5 w-5 text-green-500" />
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800'
};

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category?: string;
    status?: Issue['status'];
    search?: string;
  }>({});

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  async function fetchIssues() {
    try {
      const data = await getIssues(filters);
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      alert('Failed to fetch issues. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: Issue['status']) => {
    try {
      await updateIssueStatus(id, newStatus);
      // Immediately update the UI without refetching all issues
      setIssues(issues.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
      ));
      // Optionally, also refetch to ensure data consistency
      await fetchIssues();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600">Loading issues...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Issues</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md ${
              view === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded-md ${
              view === 'map'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      <IssueFilters filters={filters} onFilterChange={setFilters} />

      {view === 'map' ? (
        <div className="h-[600px] rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={[0, 0]}
            zoom={2}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {issues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.latitude, issue.longitude]}
                icon={new Icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(issue.created_at), 'PPP')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {issue.image_url && (
                <img
                  src={issue.image_url}
                  alt={issue.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{issue.title}</h2>
                  <div className="relative group">
                    <button
                      className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2 ${
                        statusColors[issue.status]
                      }`}
                    >
                      {statusIcons[issue.status]}
                      {issue.status.replace('_', ' ')}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                      <div className="py-1">
                        {['pending', 'in_progress', 'resolved'].map((status) => (
                          <button
                            key={status}
                            className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                              issue.status === status ? 'bg-gray-50' : ''
                            }`}
                            onClick={() => handleStatusUpdate(issue.id, status as Issue['status'])}
                          >
                            Mark as {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{issue.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {issue.location}
                  </p>
                  <p>🏷️ {issue.category}</p>
                  <p>📅 {format(new Date(issue.created_at), 'PPP')}</p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    {selectedIssue === issue.id ? 'Hide Comments' : 'Show Comments'}
                  </button>
                  {selectedIssue === issue.id && (
                    <div className="mt-4">
                      <IssueComments issueId={issue.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className="text-center py-12 col-span-full">
              <p className="text-gray-600">No issues found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}