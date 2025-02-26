import React, { useEffect, useState } from 'react';
import { getIssues, updateIssueStatus, Issue, checkIsAdmin } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { MapPin, AlertTriangle, CheckCircle, Clock, Filter, Search } from 'lucide-react';

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

export function AdminPanel() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      if (adminStatus) await fetchAllIssues();
      setLoading(false);
    }
    initialize();
  }, []);

  async function fetchAllIssues() {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setIssues(data as Issue[]);
  }

  const getStatusCount = (status: string) => 
    issues.filter(issue => issue.status === status).length;

  if (loading) return <div className="p-4">Loading admin panel...</div>;
  if (!isAdmin) return <div className="p-4 text-red-600">Admin access required.</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md">
            <Filter className="h-4 w-4" /> More Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Total Reports</h3>
          <p className="text-3xl font-bold">{issues.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Pending</h3>
          <p className="text-3xl font-bold">{getStatusCount('pending')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">In Progress</h3>
          <p className="text-3xl font-bold">{getStatusCount('in_progress')}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm">Resolved</h3>
          <p className="text-3xl font-bold">{getStatusCount('resolved')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search community reports..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border rounded-lg">
            <option>All Categories</option>
            <option>Infrastructure</option>
            <option>Roads</option>
            <option>Sanitation</option>
            <option>Safety</option>
          </select>
        </div>

        <div className="space-y-6">
          {issues.map((issue) => (
            <div key={issue.id} className="border-b pb-6 last:border-b-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{issue.title}</h2>
                  <div className="flex gap-2 items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[issue.status]}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      High Priority
                    </span>
                  </div>
                </div>
                <select
                  value={issue.status}
                  onChange={(e) => updateIssueStatus(issue.id, e.target.value as Issue['status'])}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <p className="text-gray-600 mb-4">{issue.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{issue.location}</span>
                </div>
                <div>
                  <span className="font-medium">Category:</span> {issue.category || 'Infrastructure'}
                </div>
                <div>
                  <span className="font-medium">Reported by:</span> {issue.user_id}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(issue.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}