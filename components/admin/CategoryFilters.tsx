'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

interface Section {
  id: string;
  name: string;
}

interface CategoryFiltersProps {
  sections: Section[];
  initialSearch?: string;
  initialSection?: string;
  initialStatus?: string;
}

export default function CategoryFilters({
  sections,
  initialSearch = '',
  initialSection = '',
  initialStatus = '',
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [section, setSection] = useState(initialSection);
  const [status, setStatus] = useState(initialStatus);

  // Update state when initial props change (e.g. from Clear All)
  useEffect(() => {
    setSearch(initialSearch || '');
    setSection(initialSection || '');
    setStatus(initialStatus || '');
  }, [initialSearch, initialSection, initialStatus]);

  // Apply filters whenever state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (section) params.set('section', section);
      if (status) params.set('status', status);

      const queryString = params.toString();
      const newUrl = `/admin/categories${queryString ? `?${queryString}` : ''}`;
      
      // Only push if the URL actually changed to avoid infinite loops or unnecessary history entries
      if (window.location.search !== (queryString ? `?${queryString}` : '')) {
        router.push(newUrl);
      }
    }, 400); // 400ms debounce for all fields

    return () => clearTimeout(timer);
  }, [search, section, status, router]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
          />
        </div>

        {/* Section Filter */}
        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
            Section
          </label>
          <select
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
          >
            <option value="">All Sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <button
            onClick={() => {
              setSearch('');
              setSection('');
              setStatus('');
              router.push('/admin/categories');
            }}
            className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
