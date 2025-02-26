import React from 'react';
import type { Issue } from '../lib/supabase';

interface IssueFiltersProps {
  onFilterChange: (filters: {
    category?: string;
    status?: Issue['status'];
    search?: string;
  }) => void;
  filters: {
    category?: string;
    status?: Issue['status'];
    search?: string;
  };
}

export function IssueFilters({ onFilterChange, filters }: IssueFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          <option value="pothole">Pothole</option>
          <option value="garbage">Garbage</option>
          <option value="water">Water Issue</option>
          <option value="electricity">Electricity Issue</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value as Issue['status'] || undefined })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Search issues..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
}