'use client';

import { useState } from 'react';
import LocationDetector from './components/LocationDetector';
import DistrictSelector from './components/DistrictSelector';
import Dashboard from './components/Dashboard';

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string>('');

  const handleDistrictDetected = async (district: string, state: string) => {
    try {
      // In a real app, you'd match the district name with your database
      setSelectedDistrict({ id: district.toLowerCase().replace(/\s+/g, '-'), name: district });
      setError('');
    } catch (err) {
      setError('District not found in database');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MGNREGS District Performance
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track the performance of Mahatma Gandhi National Rural Employment Guarantee Scheme in your district. 
          View current data, historical trends, and comparative analysis.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!selectedDistrict ? (
        <div className="max-w-4xl mx-auto">
          <LocationDetector
            onDistrictDetected={handleDistrictDetected}
            onError={setError}
          />
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Or select your district manually
            </h2>
            <DistrictSelector onDistrictSelect={setSelectedDistrict} />
          </div>
        </div>
      ) : (
        <Dashboard
          districtId={selectedDistrict.id}
          districtName={selectedDistrict.name}
        />
      )}
    </main>
  );
}