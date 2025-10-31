import axios from 'axios';
import { cache } from './cache';

// const API_BASE_URL = 'https://api.data.gov.in/resource/mgnrega';  // update it 

const API_BASE_URL = process.env.API_URL;  
const API_KEY = process.env.DATA_GOV_API_KEY;

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'api-key': API_KEY || ''
  }
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios API error:', error.message);
    throw error;
  }
);

export class MGNREGSApiClient {
  private async fetchWithCache(url: string, cacheKey: string, ttl: number = 300000) {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axiosInstance.get(url);
      
      const data = response.data;
      cache.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error('API fetch error:', error);
      
      // Check if it's an axios error
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('No response from API server. Please try again later.');
        }
      }
      
      throw error;
    }
  }
  
  async getDistrictPerformance(districtId: string, year?: number) {
    const cacheKey = `district-${districtId}-${year || 'all'}`;
    let url = `${API_BASE_URL}?filters[district]=${districtId}&format=json`;
    
    if (year) {
      url += `&filters[year]=${year}`;
    }
    
    return this.fetchWithCache(url, cacheKey);
  }
  
  async getAllDistricts() {
    const cacheKey = 'all-districts';
    const url = `${API_BASE_URL}?fields=district&format=json&limit=1000`;
    
    return this.fetchWithCache(url, cacheKey, 3600000); // 1 hour cache
  }

  // Additional method with retry logic
  async getDistrictPerformanceWithRetry(
    districtId: string, 
    year?: number, 
    retries: number = 3
  ) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.getDistrictPerformance(districtId, year);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Method to get multiple districts data in parallel
  async getMultipleDistrictsPerformance(districtIds: string[], year?: number) {
    const promises = districtIds.map(districtId => 
      this.getDistrictPerformance(districtId, year)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        districtId: districtIds[index],
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null
      }));
    } catch (error) {
      throw new Error(`Failed to fetch multiple districts: ${error}`);
    }
  }
}