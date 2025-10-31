'use client';

import {useState} from 'react';
import { LocationService } from '../lib/location';
import axios from 'axios';


interface LocationDetectorProps {
  onDistrictDetected: (district: string, state: string) => void;
  onError: (error: string) => void;
}

export default function LocationDetector({ onDistrictDetected, onError }: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      const { latitude, longitude } = await LocationService.getCurrentLocation();
      
      // Using axios instead of fetch
      const response = await axios.get(`/api/location?lat=${latitude}&lng=${longitude}`);
      
      if (response.data.success) {
        onDistrictDetected(response.data.data.district, response.data.data.state);
      } else {
        onError(response.data.error || 'Could not determine your district');
      }
    } catch (error: unknown) {
      console.error('Location detection error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          onError(`Server error: ${error.response.status} - ${error.response.data?.error || 'Please try again'}`);
        } else if (error.request) {
          // Request was made but no response received
          onError('Unable to connect to server. Please check your internet connection.');
        } else {
          // Something else happened
          onError('Location detection failed. Please try again.');
        }
      } else if (error instanceof Error) {
        // Handle LocationService errors
        if (error.message.includes('Geolocation is not supported')) {
          onError('Your browser does not support location detection. Please update your browser or select district manually.');
        } else if (error.message.includes('Permission denied')) {
          onError('Location access was denied. Please allow location access or select district manually.');
        } else if (error.message.includes('timeout')) {
          onError('Location detection timed out. Please try again or select district manually.');
        } else {
          onError(error.message || 'Please allow location access to automatically detect your district');
        }
      } else {
        onError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 text-lg mb-1">Auto-detect your location</h3>
          <p className="text-blue-700 text-sm">
            We'll use your device's location to find your district automatically
          </p>
        </div>
        <button
          onClick={detectLocation}
          disabled={isDetecting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors duration-200 font-medium shadow-sm"
        >
          {isDetecting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <span className="text-xl">📍</span>
              <span>Detect My District</span>
            </>
          )}
        </button>
      </div>
      
      {/* Privacy notice */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-600">
          🔒 Your location data is processed securely and is not stored on our servers. 
          We only use it to determine your district for showing relevant MGNREGS information.
        </p>
      </div>
    </div>
  );
}