'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface District {
  id: string;
  name: string;
  state: string;
}

interface DistrictSelectorProps {
  onDistrictSelect: (district: { id: string; name: string }) => void;
}

// Common Indian states and districts (fallback data)
const commonDistricts: District[] = [
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra' },
  { id: 'bangalore-urban', name: 'Bangalore Urban', state: 'Karnataka' },
  { id: 'mysore', name: 'Mysore', state: 'Karnataka' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan' },
  { id: 'udaipur', name: 'Udaipur', state: 'Rajasthan' },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh' },
  { id: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh' },
  { id: 'patna', name: 'Patna', state: 'Bihar' },
  { id: 'gaya', name: 'Gaya', state: 'Bihar' },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
  { id: 'surat', name: 'Surat', state: 'Gujarat' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { id: 'warangal', name: 'Warangal', state: 'Telangana' },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu' },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal' },
  { id: 'darjeeling', name: 'Darjeeling', state: 'West Bengal' },
  { id: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh' },
  { id: 'indore', name: 'Indore', state: 'Madhya Pradesh' },
  { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh' },
  { id: 'dehradun', name: 'Dehradun', state: 'Uttarakhand' },
  { id: 'guwahati', name: 'Guwahati', state: 'Assam' },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala' },
];

export default function DistrictSelector({ onDistrictSelect }: DistrictSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      // Try to fetch from API first
      const response = await axios.get('/api/data/districts');
      if (response.data.success) {
        setDistricts(response.data.data);
      } else {
        // Fallback to common districts
        setDistricts(commonDistricts);
      }
    } catch (error) {
      console.error('Failed to load districts:', error);
      // Fallback to common districts
      setDistricts(commonDistricts);
    } finally {
      setLoading(false);
    }
  };

  // Get unique states from districts
  const states = Array.from(new Set(districts.map(d => d.state))).sort();

  // Filter districts based on search term and selected state
  const filteredDistricts = districts.filter(district => {
    const matchesSearch = district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         district.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || district.state === selectedState;
    return matchesSearch && matchesState;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading districts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Your District</h3>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search District
          </label>
          <input
            id="search"
            type="text"
            placeholder="Type district name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by State
          </label>
          <select
            id="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Districts Grid */}
      {filteredDistricts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">No districts found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredDistricts.map((district) => (
            <button
              key={district.id}
              onClick={() => onDistrictSelect(district)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-700">
                {district.name}
              </div>
              <div className="text-sm text-gray-500 group-hover:text-blue-600">
                {district.state}
              </div>
              <div className="text-xs text-gray-400 mt-1 group-hover:text-blue-500">
                Click to select →
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-blue-500 text-lg">💡</span>
          <div>
            <p className="text-sm text-gray-700 font-medium">Can't find your district?</p>
            <p className="text-xs text-gray-500 mt-1">
              The district list includes major districts. If your district is not listed, 
              try searching with different spellings or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}