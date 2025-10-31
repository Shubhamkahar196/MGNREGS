import axios from 'axios';

// Create axios instance for location services
const locationAxios = axios.create({
  timeout: 5000,
});

export class LocationService {
  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
  
  static async getDistrictFromCoordinates(lat: number, lng: number): Promise<{ district: string; state: string }> {
    try {
      const response = await locationAxios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      const data = response.data;
      
      if (data.address) {
        const district = data.address.county || data.address.state_district || data.address.state;
        const state = data.address.state;
        
        if (!district || !state) {
          throw new Error('Could not determine district and state from location');
        }
        
        return { district, state };
      }
      
      throw new Error('Could not determine location');
    } catch (error) {
      console.error('Geocoding error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Location service timeout. Please try again.');
        }
        throw new Error('Failed to get location from service.');
      }
      
      throw error;
    }
  }

  // Alternative method using a different geocoding service as fallback
  static async getDistrictFromCoordinatesFallback(lat: number, lng: number): Promise<{ district: string; state: string }> {
    try {
      // Try BigDataCloud API as fallback
      const response = await locationAxios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      const data = response.data;
      
      if (data.city || data.principalSubdivision) {
        return {
          district: data.city || data.principalSubdivision,
          state: data.principalSubdivision || 'Unknown'
        };
      }
      
      throw new Error('Could not determine location from fallback service');
    } catch (error) {
      console.error('Fallback geocoding error:', error);
      throw new Error('All location services failed');
    }
  }
}